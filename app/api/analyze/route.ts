import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { createJob, enqueueJob } from "@/lib/jobs";

// Non-blocking: we create a job row, enqueue a pg-boss message, and
// return immediately. The worker process (scripts/worker.ts) picks it
// up, runs analyzeVacancy, and updates the row with progress/result.
// Clients poll GET /api/analyze/status?id=<jobId> to follow along, and
// navigate to /v2/report/[reportId] once the row's status flips to
// 'done'. See lib/jobs.ts for the full lifecycle documentation.

// Hard upper bound — must stay in sync with v2 AnalyzerCard MAX_CHARS.
// Raised from 4000 → 10000 on user report that real-world vacancies
// (especially senior / technical roles) routinely run 6–10k characters.
const MAX_VACANCY_CHARS = 10000;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      { status: 429 },
    );
  }

  try {
    const { vacancyText, category, locale, uiVersion } = await req.json() as {
      vacancyText: string;
      category?: string;
      locale?: string;
      uiVersion?: string;  // 'v1' | 'v2' — which landing page enqueued the job
    };

    if (!vacancyText || typeof vacancyText !== "string") {
      return NextResponse.json(
        { error: "Vacancy text is required" },
        { status: 400 },
      );
    }
    if (vacancyText.length > MAX_VACANCY_CHARS) {
      return NextResponse.json(
        { error: `Vacancy text exceeds ${MAX_VACANCY_CHARS} character limit.` },
        { status: 413 },
      );
    }

    const finalCategory = category || "General";
    const finalLocale = locale || "nl";
    // Whitelist to avoid SQL default being overridden by garbage. Anything
    // not explicitly 'v1' is treated as 'v2'.
    const finalUiVersion: "v1" | "v2" = uiVersion === "v1" ? "v1" : "v2";

    const jobId = await createJob({
      vacancyText,
      category: finalCategory,
      locale: finalLocale,
      uiVersion: finalUiVersion,
    });
    await enqueueJob(jobId);

    return NextResponse.json({
      success: true,
      jobId,
      status: "pending",
    });
  } catch (error) {
    console.error("Analysis enqueue error:", error);
    return NextResponse.json(
      { error: "Failed to start analysis" },
      { status: 500 },
    );
  }
}
