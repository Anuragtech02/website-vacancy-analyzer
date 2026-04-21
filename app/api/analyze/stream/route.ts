import { NextRequest } from "next/server";
import { analyzeVacancyStreaming } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/rate-limit";
import { dbClient } from "@/lib/db";
import { nanoid } from "nanoid";

// Same 5-min budget as the sync /api/analyze route.
export const maxDuration = 300;

// Must stay in sync with v2 AnalyzerCard MAX_CHARS and /api/analyze.
const MAX_VACANCY_CHARS = 4000;

// Map the current character-count fraction (0..1) into one of the six
// visible step indexes on the loading timeline. Stepping through 0..5 gives
// the v2 loader something to animate against without us lying about what
// Gemini is actually doing (we don't actually know whether it's in the
// "tone" or "bias" stage — the model streams one long JSON blob). What we
// CAN honestly signal is "X% of the expected output has arrived", and we
// reuse the existing visual vocabulary.
function stageFromPct(pct: number): number {
  if (pct <= 0) return 0;
  if (pct < 0.15) return 0;
  if (pct < 0.30) return 1;
  if (pct < 0.50) return 2;
  if (pct < 0.70) return 3;
  if (pct < 0.90) return 4;
  return 5;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(ip)) {
    return new Response(
      `data: ${JSON.stringify({ event: "error", message: "Rate limit exceeded." })}\n\n`,
      { status: 429, headers: { "Content-Type": "text/event-stream" } },
    );
  }

  let body: { vacancyText?: string; category?: string; locale?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(
      `data: ${JSON.stringify({ event: "error", message: "Invalid request body" })}\n\n`,
      { status: 400, headers: { "Content-Type": "text/event-stream" } },
    );
  }

  const { vacancyText, category, locale } = body;

  if (!vacancyText || typeof vacancyText !== "string") {
    return new Response(
      `data: ${JSON.stringify({ event: "error", message: "Vacancy text is required" })}\n\n`,
      { status: 400, headers: { "Content-Type": "text/event-stream" } },
    );
  }
  if (vacancyText.length > MAX_VACANCY_CHARS) {
    return new Response(
      `data: ${JSON.stringify({ event: "error", message: `Vacancy text exceeds ${MAX_VACANCY_CHARS} character limit.` })}\n\n`,
      { status: 413, headers: { "Content-Type": "text/event-stream" } },
    );
  }

  const finalCategory = category || "General";
  const finalLocale = locale || "nl";

  const encoder = new TextEncoder();
  const send = (controller: ReadableStreamDefaultController, obj: unknown) => {
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
  };

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      send(controller, { event: "started" });
      // Throttle progress events: only emit when the reported stage changes.
      let lastStage = -1;

      try {
        const analysis = await analyzeVacancyStreaming(
          vacancyText,
          finalCategory,
          finalLocale,
          (charsSoFar, expected) => {
            const pct = Math.min(0.95, charsSoFar / expected);
            const stage = stageFromPct(pct);
            if (stage !== lastStage) {
              lastStage = stage;
              send(controller, {
                event: "progress",
                stageIdx: stage,
                pct: Math.round(pct * 100),
              });
            }
          },
        );

        const reportId = nanoid(10);
        await dbClient.createReport(reportId, vacancyText, JSON.stringify(analysis));

        send(controller, { event: "done", reportId, analysis });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Analysis failed";
        console.error("SSE Analyze Error:", error);
        send(controller, { event: "error", message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      // Hint to upstream proxies (Traefik/Cloudflare): do not buffer. SSE
      // requires bytes to reach the client as they're written.
      "X-Accel-Buffering": "no",
    },
  });
}
