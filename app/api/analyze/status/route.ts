import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/jobs";

// GET /api/analyze/status?id=<jobId>
//
// Returns the current state of an analyze job from the analysis_jobs
// table. Clients poll this (typically every ~2s) while the Loading
// screen is visible and navigate to /v2/report/[reportId] once the
// status flips to 'done'.
//
// Payload shape is deliberately compact:
//   { status, progress, stage?, reportId?, error? }
// No vacancy text or analysis JSON is returned here — the loader
// doesn't need them, and the final report is served by the separate
// /v2/report/[id] server route once navigation happens.

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get("id");
  if (!jobId) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const job = await getJob(jobId);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: job.status,
    progress: job.progress_pct,
    stage: job.stage,
    reportId: job.report_id ?? undefined,
    error: job.status === "failed" ? (job.error_message ?? "Analysis failed") : undefined,
  });
}
