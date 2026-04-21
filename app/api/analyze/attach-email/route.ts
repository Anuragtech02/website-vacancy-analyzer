import { NextRequest, NextResponse } from "next/server";
import { attachEmail, markEmailSent } from "@/lib/jobs";
import { sendAnalysisReadyEmail, sendAnalysisFailedEmail } from "@/lib/email";

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

    const job = await attachEmail(jobId, email.trim());
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    // Fire-and-forget terminal-state notification. Not awaited so the
    // client gets a fast response; errors are logged server-side.
    const locale: "en" | "nl" = job.locale === "en" ? "en" : "nl";
    if (job.status === "done" && job.report_id && !job.email_sent_at) {
      void (async () => {
        try {
          const reportUrl = `${BASE_URL}/${job.locale}/v2/report/${job.report_id}`;
          await sendAnalysisReadyEmail({
            to: email.trim(),
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
            to: email.trim(),
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
