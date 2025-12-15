import { NextRequest, NextResponse } from "next/server";
import { dbClient } from "@/lib/db";
import { optimizeVacancy } from "@/lib/gemini";
import { sendOptimizedVacancyEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email, reportId } = await req.json() as { email: string; reportId: string };

    if (!email || !reportId) {
      return NextResponse.json(
        { error: "Email and Report ID are required" },
        { status: 400 }
      );
    }

    // Verify report exists
    const report = await dbClient.getReport(reportId);
    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    // Save lead
    await dbClient.createLead(email, reportId);

    // Generate optimization
    const analysis = JSON.parse(report.analysis_json);
    const optimizationResult = await optimizeVacancy(report.vacancy_text, analysis);

    // Send email with PDF attachment
    const emailResult = await sendOptimizedVacancyEmail({
      to: email,
      optimization: optimizationResult,
      reportId,
    });

    if (!emailResult.success) {
      console.error("Failed to send email:", emailResult.error);
      // Still return success since we generated the optimization
      // The user can still see it on the page
    }

    return NextResponse.json({
      success: true,
      optimization: optimizationResult,
      emailSent: emailResult.success
    });
  } catch (error) {
    console.error("Optimization Error:", error);
    return NextResponse.json(
      { error: "Failed to process optimization request" },
      { status: 500 }
    );
  }
}
