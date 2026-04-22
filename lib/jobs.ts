// lib/jobs.ts — analysis job CRUD (Postgres) + pg-boss queue wrapper.
//
// Architecture:
//   1. Web process: POST /api/analyze creates a row in `analysis_jobs`
//      with status='pending', then `boss.send('analyze', { jobId })` which
//      enqueues a message on pg-boss's Postgres-backed queue. Responds to
//      the client with `{ jobId }`.
//   2. Worker process (scripts/worker.ts): subscribes via boss.work
//      ('analyze', handler). Handler reads the row, runs analyzeVacancy,
//      updates progress as it goes, writes the final report row, marks
//      the job done (or failed), and sends the notification email if an
//      address has been attached.
//   3. Client polls GET /api/analyze/status?id=X every 2s until done.
//   4. Client POST /api/analyze/attach-email { jobId, email } sets the
//      email late; idempotent. If the job is already finished when the
//      attach request arrives, the handler sends the email immediately.
//
// No Redis. No SQLite. No separate dependency than pg-boss + the existing
// Postgres connection.

import { PgBoss } from "pg-boss";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { and, eq, lt } from "drizzle-orm";
import { nanoid } from "nanoid";
import { analysisJobs } from "./db/schema";

// ─── Database client (shared with the rest of the app) ────────────────────
// We re-open a small connection pool here rather than importing from db.ts
// because this file is also imported by scripts/worker.ts (a completely
// separate Node process), and sharing a singleton import is cleaner than
// threading one through.

const connectionString = process.env.DATABASE_URL!;
const pg = postgres(connectionString, { max: 4, idle_timeout: 20, connect_timeout: 10 });
const jobsDb = drizzle(pg, { schema: { analysisJobs } });

// ─── pg-boss ──────────────────────────────────────────────────────────────
// Lazy-initialized so importing this module in a Next.js build doesn't
// open a Postgres connection before we need one. Both the web process
// and the worker share the same queue via the `DATABASE_URL`.

let bossInstance: PgBoss | null = null;
let bossReady: Promise<PgBoss> | null = null;

export function getBoss(): Promise<PgBoss> {
  if (bossReady) return bossReady;
  bossReady = (async () => {
    const boss = new PgBoss({ connectionString, schema: "pgboss" });
    boss.on("error", (err) => console.error("[pg-boss]", err));
    await boss.start();
    bossInstance = boss;
    return boss;
  })();
  return bossReady;
}

export async function stopBoss(): Promise<void> {
  if (bossInstance) {
    await bossInstance.stop({ graceful: true });
    bossInstance = null;
    bossReady = null;
  }
}

// Queue name is exported so worker + web can't drift out of sync.
export const ANALYZE_QUEUE = "analyze";

export interface AnalyzeJobMessage {
  jobId: string;
}

// ─── Job lifecycle ────────────────────────────────────────────────────────

export type JobStatus = "pending" | "running" | "done" | "failed";
export type UiVersion = "v1" | "v2";

export interface JobRow {
  id: string;
  status: JobStatus;
  progress_pct: number;
  stage: string | null;
  vacancy_text: string;
  category: string;
  locale: string;
  ui_version: UiVersion;
  email: string | null;
  email_sent_at: Date | null;
  report_id: string | null;
  error_message: string | null;
  created_at: Date;
  updated_at: Date;
  started_at: Date | null;
  finished_at: Date | null;
}

export async function createJob(params: {
  vacancyText: string;
  category: string;
  locale: string;
  uiVersion?: string;  // caller-supplied, not yet trusted
}): Promise<string> {
  const id = nanoid(12);
  // Whitelist here too (route-level whitelisting is a second layer, but
  // pushing it INTO the create path means any future caller of createJob
  // can't accidentally write garbage into the ui_version column.
  // Anything that isn't literal "v1" becomes "v2" — the historical default.
  const uiVersion: UiVersion = params.uiVersion === "v1" ? "v1" : "v2";
  await jobsDb.insert(analysisJobs).values({
    id,
    status: "pending",
    progress_pct: 0,
    vacancy_text: params.vacancyText,
    category: params.category,
    locale: params.locale,
    ui_version: uiVersion,
  });
  return id;
}

export async function enqueueJob(jobId: string): Promise<void> {
  const boss = await getBoss();
  // pg-boss v10+ requires a queue to be created before messages can be
  // sent to it. createQueue() is idempotent, so calling it every time is
  // cheap and keeps the worker/web halves independent.
  await boss.createQueue(ANALYZE_QUEUE);
  const msg: AnalyzeJobMessage = { jobId };
  await boss.send(ANALYZE_QUEUE, msg, {
    // Retry up to once with a 30s delay if the worker crashes mid-job.
    retryLimit: 1,
    retryDelay: 30,
    // Expire pending messages after 1 hour — prevents zombie jobs from
    // building up if the worker was offline for a long window.
    expireInSeconds: 60 * 60,
  });
}

export async function getJob(jobId: string): Promise<JobRow | null> {
  const rows = await jobsDb
    .select()
    .from(analysisJobs)
    .where(eq(analysisJobs.id, jobId))
    .limit(1);
  const row = rows[0] as (JobRow & { ui_version: string }) | undefined;
  if (!row) return null;
  // Runtime narrow: the DB column is `text`, not a real enum, so Drizzle
  // hands us a plain string. If somehow an unexpected value lands there
  // (manual SQL, future migration mistake, corrupted row), coerce back
  // to "v2" rather than silently tripping buildReportUrl's v1 branch and
  // emailing users a broken link. Log once so we can notice.
  if (row.ui_version !== "v1" && row.ui_version !== "v2") {
    console.warn(
      `[jobs] job ${jobId} has unexpected ui_version ${JSON.stringify(row.ui_version)}; coercing to "v2"`,
    );
    row.ui_version = "v2";
  }
  return row as JobRow;
}

export async function markRunning(jobId: string): Promise<void> {
  await jobsDb
    .update(analysisJobs)
    .set({ status: "running", started_at: new Date(), updated_at: new Date() })
    .where(eq(analysisJobs.id, jobId));
}

export async function updateProgress(jobId: string, progressPct: number, stage?: string | null): Promise<void> {
  const clamped = Math.max(0, Math.min(100, Math.round(progressPct)));
  await jobsDb
    .update(analysisJobs)
    .set({
      progress_pct: clamped,
      ...(stage !== undefined ? { stage } : {}),
      updated_at: new Date(),
    })
    .where(eq(analysisJobs.id, jobId));
}

export async function markDone(jobId: string, reportId: string): Promise<void> {
  await jobsDb
    .update(analysisJobs)
    .set({
      status: "done",
      progress_pct: 100,
      report_id: reportId,
      finished_at: new Date(),
      updated_at: new Date(),
    })
    .where(eq(analysisJobs.id, jobId));
}

export async function markFailed(jobId: string, errorMessage: string): Promise<void> {
  await jobsDb
    .update(analysisJobs)
    .set({
      status: "failed",
      error_message: errorMessage.slice(0, 1000),
      finished_at: new Date(),
      updated_at: new Date(),
    })
    .where(eq(analysisJobs.id, jobId));
}

export async function attachEmail(jobId: string, email: string): Promise<JobRow | null> {
  // Atomic: set the email column and return the updated row so the caller
  // can decide whether to send the notification immediately (job already
  // done) or leave it for the worker.
  await jobsDb
    .update(analysisJobs)
    .set({ email, updated_at: new Date() })
    .where(eq(analysisJobs.id, jobId));
  return getJob(jobId);
}

export async function markEmailSent(jobId: string): Promise<void> {
  await jobsDb
    .update(analysisJobs)
    .set({ email_sent_at: new Date(), updated_at: new Date() })
    .where(eq(analysisJobs.id, jobId));
}

// ─── Zombie reaper ────────────────────────────────────────────────────────
// If the worker container crashes mid-job, the row stays `running` forever.
// Called from scripts/worker.ts on startup AND periodically, plus from a
// lightweight web-side hook so even if the worker is down for a long time
// we surface "failed" to pollers instead of hanging forever.

const ZOMBIE_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes

export async function reapZombieJobs(): Promise<number> {
  const cutoff = new Date(Date.now() - ZOMBIE_THRESHOLD_MS);
  const result = await jobsDb
    .update(analysisJobs)
    .set({
      status: "failed",
      error_message: "Worker did not complete the job within 10 minutes. Please try again.",
      finished_at: new Date(),
      updated_at: new Date(),
    })
    // Use typed operators, not a raw `sql` template. Drizzle converts the
    // Date to the correct timestamp parameter only when it knows the column
    // type — inside a raw sql tag the Date would be handed straight to
    // postgres-js, which calls Buffer.byteLength() on it and crashes with
    // ERR_INVALID_ARG_TYPE.
    .where(
      and(
        eq(analysisJobs.status, "running"),
        lt(analysisJobs.updated_at, cutoff),
      ),
    )
    .returning({ id: analysisJobs.id });
  return result.length;
}

// ─── Report URL builder ───────────────────────────────────────────────────
// Routes the user back to the UI variant they originally used. This was
// previously hardcoded to /v2/, so v1 users clicking the "Your analysis
// is ready" email got dropped into the unfamiliar v2 layout.
export function buildReportUrl(params: {
  baseUrl: string;
  locale: string;
  reportId: string;
  uiVersion: UiVersion;
}): string {
  const { baseUrl, locale, reportId, uiVersion } = params;
  const trimmed = baseUrl.replace(/\/$/, "");
  return uiVersion === "v2"
    ? `${trimmed}/${locale}/v2/report/${reportId}`
    : `${trimmed}/${locale}/report/${reportId}`;
}
