import { NextRequest, NextResponse } from "next/server";
import { analyzeVacancy } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/rate-limit";
import { dbClient } from "@/lib/db";
import { nanoid } from "nanoid";

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
    const { vacancyText, category } = await req.json() as { vacancyText: string, category?: string };

    if (!vacancyText || typeof vacancyText !== "string") {
      return NextResponse.json(
        { error: "Vacancy text is required" },
        { status: 400 }
      );
    }

    // Analyze with Gemini
    const analysis = await analyzeVacancy(vacancyText, category || "General");
    
    // Generate Report ID
    const reportId = nanoid(10);

    // Save to DB
    await dbClient.createReport(reportId, vacancyText, JSON.stringify(analysis));

    return NextResponse.json({ reportId, analysis });
  } catch (error) {
    console.error("Analysis Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze vacancy" },
      { status: 500 }
    );
  }
}
