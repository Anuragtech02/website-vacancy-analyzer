import { NextRequest, NextResponse } from "next/server";
import { attachEmail, markEmailSent, getJob } from "@/lib/jobs";
import { sendEmail } from "@/lib/email";

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
    if (job.status === "done" && job.report_id && !job.email_sent_at) {
      void (async () => {
        try {
          const reportUrl = `${BASE_URL}/${job.locale}/v2/report/${job.report_id}`;
          const subject = job.locale === "en"
            ? "Your vacancy analysis is ready"
            : "Je vacature-analyse is klaar";
          const body = job.locale === "en"
            ? `Your vacancy analysis has finished.\n\nOpen the report here:\n${reportUrl}\n\nKind regards,\nVacature Tovenaar`
            : `Je vacature-analyse is klaar.\n\nBekijk het rapport hier:\n${reportUrl}\n\nMet vriendelijke groet,\nVacature Tovenaar`;
          await sendEmail({ to: email.trim(), subject, body });
          await markEmailSent(jobId);
        } catch (err) {
          console.error("[attach-email] Failed to send completion email:", err);
        }
      })();
    } else if (job.status === "failed") {
      void (async () => {
        try {
          const subject = job.locale === "en"
            ? "We couldn't finish your vacancy analysis"
            : "Je vacature-analyse is niet gelukt";
          const body = job.locale === "en"
            ? "Sorry — our analysis job failed. Please try again on the site, or reach out to joost@vacaturetovenaar.nl and we'll take a look."
            : "Helaas is onze analyse niet gelukt. Probeer het opnieuw op de site, of mail joost@vacaturetovenaar.nl dan kijken we mee.";
          await sendEmail({ to: email.trim(), subject, body });
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
