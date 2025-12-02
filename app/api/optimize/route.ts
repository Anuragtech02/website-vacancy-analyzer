import { NextRequest, NextResponse } from "next/server";
import { dbClient } from "@/lib/db";
import { optimizeVacancy } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { email, reportId } = await req.json();

    if (!email || !reportId) {
      return NextResponse.json(
        { error: "Email and Report ID are required" },
        { status: 400 }
      );
    }

    // Verify report exists
    // OpenNext with nodejs_compat should populate process.env with bindings
    const report = await dbClient.getReport(reportId, undefined);
    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    // Save lead
    await dbClient.createLead(email, reportId, undefined);

    // Generate optimization
    const analysis = JSON.parse(report.analysis_json);
    const optimizationResult = await optimizeVacancy(report.vacancy_text, analysis);

    return NextResponse.json({ success: true, optimization: optimizationResult });
  } catch (error) {
    console.error("Optimization Error:", error);
    return NextResponse.json(
      { error: "Failed to process optimization request" },
      { status: 500 }
    );
  }
}
