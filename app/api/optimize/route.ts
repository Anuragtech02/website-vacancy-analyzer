import { NextRequest, NextResponse } from "next/server";
import { dbClient } from "@/lib/db";
import { optimizeVacancy } from "@/lib/gemini";
import { sendOptimizedVacancyEmail } from "@/lib/email";
import { syncHubSpotContact } from "@/lib/hubspot";

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

    // Check usage count (Phase 1 vs 2 vs 3)
    const usageCount = await dbClient.countLeadsByEmail(email);

    // Phase 3: Lock State (Logic: If user ALREADY has 2 leads, this is the 3rd attempt -> Block)
    // Wait, if they have 0, this is 1st. If 1, this is 2nd. If 2, this is 3rd.
    // So if usageCount >= 2, we block.
    if (usageCount >= 2) {
      return NextResponse.json({
        success: false,
        isLocked: true, 
        message: "You have reached the limit of free audits."
      });
    }

    // Save lead (Increments the count for next time)
    await dbClient.createLead(email, reportId);
    
    // The current usage count for THIS email being sent (0 -> 1st email, 1 -> 2nd email)
    // We pass `usageCount + 1` to the email function to indicate this is the Nth email?
    // Let's look at email logic: `usageCount >= 2` triggers Phase 2 content? 
    // Wait, User request: "Mail #2 – versturen na tweede herschrijving".
    // So if previous usage is 1, this is the 2nd one. `usageCount` (before createLead) is 1.
    // So we invoke email with `usageCount + 1`.
    // If usageCount was 0, we pass 1. (Phase 1)
    // If usageCount was 1, we pass 2. (Phase 2)
    // If usageCount was 2, we mocked above.
    
    // Generate optimization
    const analysis = JSON.parse(report.analysis_json);
    const optimizationResult = await optimizeVacancy(report.vacancy_text, analysis);

    // Sync to HubSpot (Fire and Forget)
    syncHubSpotContact(email, {
      jobtitle: analysis.metadata?.job_title || "Unknown Vacancy",
      vacancy_report_id: reportId
    }).catch(err => console.error("HubSpot Sync Failed", err));

    // Send email with PDF attachment
    const emailResult = await sendOptimizedVacancyEmail({
      to: email,
      optimization: optimizationResult,
      reportId,
      usageCount: usageCount + 1, // Pass the NEW total count
    });

    if (!emailResult.success) {
      console.error("Failed to send email:", emailResult.error);
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
