// scripts/worker.ts — standalone Node process that consumes the
// 'analyze' queue. Run with `npm run worker`. Deployed as a separate
// Coolify application alongside the web container; both share the same
// DATABASE_URL.
//
// Why a separate process instead of in the web container:
//   - Web redeploys on every push don't interrupt in-flight analyses.
//   - The worker can be scaled / restarted independently (e.g. if a
//     Gemini outage wedges jobs, restart just the worker without a
//     user-facing blip).
//   - Memory footprint of the long-running analyzer doesn't compete
//     with web request handling.

import "dotenv/config";
import { analyzeVacancy } from "../lib/gemini";
import { dbClient } from "../lib/db";
import { sendAnalysisReadyEmail, sendAnalysisFailedEmail } from "../lib/email";
import { nanoid } from "nanoid";
import {
  ANALYZE_QUEUE,
  type AnalyzeJobMessage,
  getBoss,
  getJob,
  markRunning,
  markDone,
  markFailed,
  markEmailSent,
  reapZombieJobs,
  updateProgress,
} from "../lib/jobs";

const BASE_URL = process.env.NEXT_PUBLIC_URL?.replace(/\/$/, "") ?? "https://analyse.vacaturetovenaar.nl";

// Handler: one pg-boss message = one job row to work.
// pg-boss v10 pattern: handler receives an array of jobs (when teamSize/
// batchSize > 1). We only configure a single worker, so we process the
// first element.
async function handleAnalyzeJob(jobs: { data: AnalyzeJobMessage; id: string }[]) {
  for (const pbJob of jobs) {
    const { jobId } = pbJob.data;
    console.log(`[worker] picked up job ${jobId} (pg-boss id ${pbJob.id})`);

    const row = await getJob(jobId);
    if (!row) {
      console.warn(`[worker] job ${jobId} has no db row; skipping`);
      continue;
    }
    if (row.status === "done" || row.status === "failed") {
      console.warn(`[worker] job ${jobId} already ${row.status}; skipping`);
      continue;
    }

    await markRunning(jobId);

    // Simple staged progress: the actual analyzeVacancy call is atomic
    // from our perspective (one generateText), so we stage updates on a
    // timer while the Gemini call is in flight. Not real streaming — just
    // honest feedback that "yes, we're still working on it".
    const stages: Array<{ pct: number; stage: string }> = [
      { pct: 10, stage: "parse" },
      { pct: 25, stage: "bias" },
      { pct: 42, stage: "tone" },
      { pct: 60, stage: "structure" },
      { pct: 78, stage: "benefits" },
      { pct: 92, stage: "rewrite" },
    ];
    const stageIntervalMs = 7000; // ~42s across 6 stages, loops after
    let stageIdx = 0;
    const stageTimer: NodeJS.Timeout = setInterval(() => {
      const s = stages[stageIdx % stages.length];
      updateProgress(jobId, s.pct, s.stage).catch((e) =>
        console.warn(`[worker] progress update failed for ${jobId}:`, e),
      );
      stageIdx++;
    }, stageIntervalMs);

    try {
      const analysis = await analyzeVacancy(row.vacancy_text, row.category, row.locale);
      clearInterval(stageTimer);

      const reportId = nanoid(10);
      await dbClient.createReport(reportId, row.vacancy_text, JSON.stringify(analysis));
      await markDone(jobId, reportId);
      console.log(`[worker] completed job ${jobId} -> report ${reportId}`);

      // Re-read the row — the user may have attached an email while we
      // were running.
      const fresh = await getJob(jobId);
      if (fresh?.email && !fresh.email_sent_at) {
        await sendCompletionEmail(fresh.email, reportId, fresh.locale);
        await markEmailSent(jobId);
      }
    } catch (err) {
      clearInterval(stageTimer);
      const msg = err instanceof Error ? err.message : "Analysis failed";
      console.error(`[worker] job ${jobId} failed:`, err);
      await markFailed(jobId, msg);

      const fresh = await getJob(jobId);
      if (fresh?.email && !fresh.email_sent_at) {
        await sendFailureEmail(fresh.email, fresh.locale).catch((e) =>
          console.error(`[worker] failed to send failure email for ${jobId}:`, e),
        );
        // Not marking email_sent_at here — the failure notification is a
        // different thing from the success email. Both would overwrite
        // each other's timestamp, so we only mark on success.
      }
      throw err; // let pg-boss apply its retryLimit
    }
  }
}

async function sendCompletionEmail(email: string, reportId: string, locale: string): Promise<void> {
  const reportUrl = `${BASE_URL}/${locale}/v2/report/${reportId}`;
  await sendAnalysisReadyEmail({
    to: email,
    reportUrl,
    locale: normalizeLocale(locale),
  });
}

async function sendFailureEmail(email: string, locale: string): Promise<void> {
  await sendAnalysisFailedEmail({
    to: email,
    locale: normalizeLocale(locale),
    retryUrl: `${BASE_URL}/${locale}`,
  });
}

function normalizeLocale(l: string): "en" | "nl" {
  return l === "en" ? "en" : "nl";
}

// ─── Main loop ─────────────────────────────────────────────────────────────
async function main() {
  console.log("[worker] starting up…");
  const boss = await getBoss();
  await boss.createQueue(ANALYZE_QUEUE);

  // Reap zombies on startup in case a previous container was killed mid-job.
  try {
    const reaped = await reapZombieJobs();
    if (reaped > 0) console.log(`[worker] reaped ${reaped} zombie job(s) from a previous run`);
  } catch (e) {
    console.warn("[worker] zombie reap on startup failed:", e);
  }

  // Periodic zombie reap every 5 min so long-running crashes still surface
  // as "failed" to pollers within a reasonable window.
  const reapTimer = setInterval(() => {
    reapZombieJobs().then((n) => {
      if (n > 0) console.log(`[worker] reaped ${n} zombie job(s) on schedule`);
    }).catch((e) => console.warn("[worker] periodic zombie reap failed:", e));
  }, 5 * 60 * 1000);

  await boss.work(
    ANALYZE_QUEUE,
    { batchSize: 1, pollingIntervalSeconds: 2 },
    handleAnalyzeJob,
  );

  console.log(`[worker] listening on "${ANALYZE_QUEUE}" queue`);

  // Graceful shutdown — SIGTERM from Coolify redeploys.
  const shutdown = async () => {
    console.log("[worker] shutting down…");
    clearInterval(reapTimer);
    await boss.stop({ graceful: true });
    process.exit(0);
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main().catch((err) => {
  console.error("[worker] fatal:", err);
  process.exit(1);
});
