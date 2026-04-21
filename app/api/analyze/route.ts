import { NextRequest, NextResponse } from "next/server";
import { analyzeVacancy } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/rate-limit";
import { dbClient } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { nanoid } from "nanoid";

// Gemini 3 Pro analysis can take up to ~3 minutes on long vacancies.
// Default Vercel serverless timeout is 60s on Pro. Bump to 300s (5 min).
export const maxDuration = 300;

// Hard upper bound — must stay in sync with v2 AnalyzerCard MAX_CHARS.
// Enforced here too so the limit can't be bypassed with a direct POST.
const MAX_VACANCY_CHARS = 4000;

/**
 * Fire-and-forget detached worker. Runs inside the current Next.js Node
 * process (Coolify keeps the process alive long enough to finish), saves
 * the finished report to Postgres, then emails the user a link.
 *
 * NOT awaited — the caller returns to the client immediately.
 *
 * Deliberately no Bull/Redis/SQLite dependency: the previous queue setup
 * required a Redis instance and a separate worker process neither of
 * which exist on this Coolify deployment, so every "email me when ready"
 * submission was 500-erroring.
 */
function spawnBackgroundAnalyze(params: {
  vacancyText: string;
  category: string;
  locale: string;
  email: string;
  baseUrl: string;
}): void {
  const { vacancyText, category, locale, email, baseUrl } = params;

  // Scheduled on the microtask queue so the HTTP response can return
  // first. Promise rejection is caught internally — this handler never
  // throws back to the event loop.
  void (async () => {
    try {
      const analysis = await analyzeVacancy(vacancyText, category, locale);
      const reportId = nanoid(10);
      await dbClient.createReport(reportId, vacancyText, JSON.stringify(analysis));

      const reportUrl = `${baseUrl}/${locale}/v2/report/${reportId}`;
      const subject = locale === "en"
        ? "Your vacancy analysis is ready"
        : "Je vacature-analyse is klaar";
      const body = locale === "en"
        ? `Your vacancy analysis has finished.\n\nOpen the report here:\n${reportUrl}\n\nKind regards,\nVacature Tovenaar`
        : `Je vacature-analyse is klaar.\n\nBekijk het rapport hier:\n${reportUrl}\n\nMet vriendelijke groet,\nVacature Tovenaar`;

      await sendEmail({ to: email, subject, body });
      console.log(`[analyze-bg] Completed ${reportId} for ${email}`);
    } catch (error) {
      console.error("[analyze-bg] Failed:", error);
      // Best-effort failure notification. If this one also throws, swallow it.
      try {
        const subject = locale === "en"
          ? "We couldn't finish your vacancy analysis"
          : "Je vacature-analyse is niet gelukt";
        const body = locale === "en"
          ? "Sorry — our analysis job failed. Please try again on the site, or reach out to joost@vacaturetovenaar.nl and we'll take a look."
          : "Helaas is onze analyse niet gelukt. Probeer het opnieuw op de site, of mail joost@vacaturetovenaar.nl dan kijken we mee.";
        await sendEmail({ to: email, subject, body });
      } catch (notifyErr) {
        console.error("[analyze-bg] Failed to notify on failure:", notifyErr);
      }
    }
  })();
}

/** Derive a user-facing base URL from the incoming request. */
function deriveBaseUrl(req: NextRequest): string {
  if (process.env.NEXT_PUBLIC_URL) return process.env.NEXT_PUBLIC_URL.replace(/\/$/, "");
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "analyse.vacaturetovenaar.nl";
  return `${proto}://${host}`;
}

export async function POST(req: NextRequest) {
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

    // "Email me when ready" path: spawn a detached analyze promise in the
    // current Next.js Node process and return immediately. No Bull, no
    // Redis, no external worker.
    if (email && email.trim()) {
      spawnBackgroundAnalyze({
        vacancyText,
        category: finalCategory,
        locale: finalLocale,
        email: email.trim(),
        baseUrl: deriveBaseUrl(req),
      });

      return NextResponse.json({
        success: true,
        async: true,
        message: finalLocale === "en"
          ? "We'll email you the full report when it's ready. You can close this tab."
          : "We mailen je het volledige rapport zodra het klaar is. Je kunt dit tabblad sluiten.",
      });
    }

    // Foreground path (user waits on the loading screen).
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
