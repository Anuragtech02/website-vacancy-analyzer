import { NextRequest, NextResponse } from "next/server";
import { dbClient } from "@/lib/db";
import { optimizeVacancy } from "@/lib/gemini";
import { sendOptimizedVacancyEmail } from "@/lib/email";
import { syncHubSpotContact } from "@/lib/hubspot";
import { getClientIP } from "@/lib/fingerprint";

// Gemini 3 Flash optimization + Puppeteer PDF + SES send. Budget 5 min.
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const { email, reportId, fingerprint, locale } = await req.json() as { email: string; reportId: string; fingerprint?: string; locale?: string };

    if (!email || !reportId) {
      return NextResponse.json(
        { error: "Email and Report ID are required" },
        { status: 400 }
      );
    }

    // Extract IP address from request headers
    const ipAddress = getClientIP(req);

    // Verify report exists
    const report = await dbClient.getReport(reportId);
    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    // Check + insert atomically to prevent double-click / fetch-retry races.
    // IP is intentionally excluded from the count — shared office/VPN IPs would
    // cause colleagues to block each other. See lib/db.ts: countLeadsByFingerprint.
    // BYPASS_USAGE_LIMIT=true can be set in .env.local for development.
    const bypassLimit = process.env.BYPASS_USAGE_LIMIT === 'true';
    const effectiveLimit = bypassLimit ? Number.MAX_SAFE_INTEGER : 2;

    const { allowed, usageCountBefore } = await dbClient.createLeadIfUnderLimit({
      email,
      reportId,
      ipAddress,
      fingerprint,
      limit: effectiveLimit,
    });

    // Phase 3: Lock State — user already has 2 leads; this would be the 3rd attempt.
    if (!allowed) {
      return NextResponse.json({
        success: false,
        isLocked: true,
        message: "You have reached the limit of free audits."
      });
    }

    // The lead has been inserted inside the transaction.
    // usageCountBefore: 0 → 1st rewrite, 1 → 2nd rewrite.
    // Pass (usageCountBefore + 1) as the "Nth email" value for HubSpot + email template.
    const usageCount = usageCountBefore; // alias for clarity below

    // Generate optimization (pass locale for localized responses)
    const analysis = JSON.parse(report.analysis_json);
    const optimizationResult = await optimizeVacancy(report.vacancy_text, analysis, locale || 'nl');

    // Sync to HubSpot (with proper error handling)
    const hubspotResult = await syncHubSpotContact(email, {
      company: analysis.metadata?.organization || "",
      website: "",
      vacature_titel: analysis.metadata?.job_title || "Unknown Vacancy",
      vacature_report_id: reportId,
      count_analyzer_flow: String(usageCount + 1) // NEW total count (1 for first submission, 2 for second)
    });

    if (hubspotResult && !hubspotResult.success) {
      console.warn(`⚠️ HubSpot sync failed for ${email}:`, hubspotResult.reason);
    } else if (hubspotResult && hubspotResult.success) {
      console.log(`✅ HubSpot sync successful for ${email}: ${hubspotResult.action}`);
    }

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
