import { NextRequest, NextResponse } from "next/server";
import { attachEmail, buildReportUrl, getJob, markEmailSent } from "@/lib/jobs";
import { sendAnalysisReadyEmail, sendAnalysisFailedEmail } from "@/lib/email";
import { syncHubSpotContact } from "@/lib/hubspot";

// POST /api/analyze/attach-email
// Body: { jobId: string, email: string }
//
// Idempotent: calling this for a job that already has an email just
// overwrites with the new one. The worker re-reads the `email` column
// at the end of the job, so attaching mid-run is race-safe.
//
// If the job is already `done` by the time this request arrives, the
// handler sends the notification email directly from here rather than
// waiting for a worker pass (the worker never looks at this job again).
// If the job is `failed`, we send the failure notification.

const BASE_URL = process.env.NEXT_PUBLIC_URL?.replace(/\/$/, "") ?? "https://analyse.vacaturetovenaar.nl";

export async function POST(req: NextRequest) {
  try {
    const { jobId, email } = await req.json() as { jobId?: string; email?: string };
    if (!jobId) return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
    if (!email || !email.includes("@")) return NextResponse.json({ error: "Invalid email" }, { status: 400 });

    const trimmedEmail = email.trim();

    // Read the row FIRST so we know whether this is a new email attach
    // or a retry with the same email. attachEmail() overwrites
    // unconditionally, so without this pre-read every double-click or
    // network-retry would re-fire HubSpot sync.
    const existing = await getJob(jobId);
    const isNewEmail = !existing?.email || existing.email.toLowerCase() !== trimmedEmail.toLowerCase();

    const job = await attachEmail(jobId, trimmedEmail);
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    const locale: "en" | "nl" = job.locale === "en" ? "en" : "nl";

    // HubSpot sync — previously only ran in /api/optimize (the rewrite
    // unlock path). That meant users who submitted their email via the
    // "email me when ready" modal never made it into HubSpot. Mirror
    // the /optimize sync here: fire-and-forget, same scrape_bron value
    // so it's segmentable in HubSpot views.
    //
    // Gated on isNewEmail — a retry of the same email against the same
    // jobId does not need to re-hit HubSpot. This prevents double-click
    // sprays without adding a new DB column.
    //
    // Scope notes:
    //   - job_title / organization aren't known yet (analysis still
    //     running or just finished) so we leave those off — HubSpot will
    //     pick them up on the /optimize sync if the user continues.
    //   - count_analyzer_flow is "1" here — this is the first touchpoint
    //     from that user in the external analyser funnel.
    if (isNewEmail) {
      void (async () => {
        try {
          const hs = await syncHubSpotContact(trimmedEmail, {
            scrape_bron: "external-analyzer",
            count_analyzer_flow: "1",
          });
          if (hs && hs.success) {
            console.log(`[attach-email] HubSpot sync ${hs.action} for ${trimmedEmail}`);
          } else if (hs && !hs.success) {
            console.warn(`[attach-email] HubSpot sync failed for ${trimmedEmail}: ${hs.reason}`);
          }
        } catch (err) {
          console.error("[attach-email] HubSpot sync threw:", err);
        }
      })();
    } else {
      console.log(`[attach-email] Skipping HubSpot sync for ${trimmedEmail} — already attached to job ${jobId}`);
    }

    // Fire-and-forget terminal-state notification. Not awaited so the
    // client gets a fast response; errors are logged server-side.
    if (job.status === "done" && job.report_id && !job.email_sent_at) {
      void (async () => {
        try {
          const reportUrl = buildReportUrl({
            baseUrl: BASE_URL,
            locale: job.locale,
            reportId: job.report_id!,
            uiVersion: job.ui_version,
          });
          await sendAnalysisReadyEmail({
            to: trimmedEmail,
            reportUrl,
            locale,
          });
          await markEmailSent(jobId);
        } catch (err) {
          console.error("[attach-email] Failed to send completion email:", err);
        }
      })();
    } else if (job.status === "failed") {
      void (async () => {
        try {
          await sendAnalysisFailedEmail({
            to: trimmedEmail,
            locale,
            retryUrl: `${BASE_URL}/${job.locale}`,
          });
        } catch (err) {
          console.error("[attach-email] Failed to send failure email:", err);
        }
      })();
    }
    // else: job is pending/running — the worker will pick up the email
    // on its next re-read of the row at completion.

    return NextResponse.json({ success: true, status: job.status });
  } catch (error) {
    console.error("attach-email error:", error);
    return NextResponse.json({ error: "Failed to attach email" }, { status: 500 });
  }
}
