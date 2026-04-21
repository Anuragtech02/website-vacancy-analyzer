import { NextRequest, NextResponse } from "next/server";
import { analyzeVacancy } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/rate-limit";
import { dbClient } from "@/lib/db";
import { nanoid } from "nanoid";
import { enqueueAnalysis } from "@/lib/queue";
import { dbRaw } from "@/lib/db-raw";

// Gemini 3 Pro analysis can take up to ~3 minutes on long vacancies.
// Default Vercel serverless timeout is 60s on Pro. Bump to 300s (5 min).
export const maxDuration = 300;

// Hard upper bound — must stay in sync with v2 AnalyzerCard MAX_CHARS.
// Enforced here too so the limit can't be bypassed with a direct POST.
const MAX_VACANCY_CHARS = 4000;

export async function POST(req: NextRequest) {
  // Rate Limiting
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const { vacancyText, category, locale, email } = await req.json() as {
      vacancyText: string,
      category?: string,
      locale?: string,
      email?: string
    };

    if (!vacancyText || typeof vacancyText !== "string") {
      return NextResponse.json(
        { error: "Vacancy text is required" },
        { status: 400 }
      );
    }

    if (vacancyText.length > MAX_VACANCY_CHARS) {
      return NextResponse.json(
        { error: `Vacancy text exceeds ${MAX_VACANCY_CHARS} character limit.` },
        { status: 413 }
      );
    }

    const finalCategory = category || "General";
    const finalLocale = locale || "nl";

    // If email is provided, process asynchronously in background
    if (email && email.trim() && process.env.ENABLE_BACKGROUND_JOBS === 'true') {
      const jobId = nanoid(12);

      // Create job record in database
      dbRaw.prepare(
        `INSERT INTO analysis_jobs (id, status, vacancy_text, category, locale, email, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run(jobId, 'pending', vacancyText, finalCategory, finalLocale, email, Math.floor(Date.now() / 1000));

      // Enqueue the job for background processing
      await enqueueAnalysis({
        jobId,
        vacancyText,
        category: finalCategory,
        locale: finalLocale,
        email,
      });

      return NextResponse.json({
        success: true,
        async: true,
        jobId,
        message: finalLocale === 'en'
          ? 'Your analysis has been queued. You will receive an email when it\'s ready.'
          : 'Je analyse is in de wachtrij geplaatst. Je ontvangt een email wanneer deze klaar is.'
      });
    }

    // Otherwise, process synchronously (immediate response)
    const analysis = await analyzeVacancy(vacancyText, finalCategory, finalLocale);

    // Generate Report ID
    const reportId = nanoid(10);

    // Save to DB
    await dbClient.createReport(reportId, vacancyText, JSON.stringify(analysis));

    return NextResponse.json({
      success: true,
      async: false,
      reportId,
      analysis
    });
  } catch (error) {
    console.error("Analysis Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze vacancy" },
      { status: 500 }
    );
  }
}
