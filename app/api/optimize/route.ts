import { NextRequest, NextResponse } from "next/server";
import { dbClient } from "@/lib/db";
import { optimizeVacancy } from "@/lib/gemini";
import { sendOptimizedVacancyEmail } from "@/lib/email";
import {
  HUBSPOT_EXTERNAL_ANALYZER_SOURCE,
  HUBSPOT_SCRAPE_SOURCE_PROPERTY,
  syncHubSpotContact,
} from "@/lib/hubspot";
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

    const analysis = JSON.parse(report.analysis_json);

    const syncAnalyzerLeadToHubSpot = async (countAnalyzerFlow: number, context: "unlocked" | "locked") => {
      try {
        const hubspotResult = await syncHubSpotContact(email, {
          company: analysis.metadata?.organization || "",
          website: "",
          vacature_titel: analysis.metadata?.job_title || "Unknown Vacancy",
          vacature_report_id: reportId,
          count_analyzer_flow: String(countAnalyzerFlow),
          [HUBSPOT_SCRAPE_SOURCE_PROPERTY]: HUBSPOT_EXTERNAL_ANALYZER_SOURCE,
        });

        if (hubspotResult && !hubspotResult.success) {
          console.warn(`⚠️ HubSpot sync failed for ${email} (${context}):`, hubspotResult.reason);
        } else if (hubspotResult && hubspotResult.success) {
          console.log(`✅ HubSpot sync successful for ${email} (${context}): ${hubspotResult.action}`);
        }
      } catch (hubspotError) {
        console.error(`HubSpot sync threw for ${email} (${context}):`, hubspotError);
      }
    };

    // Check + insert atomically to prevent double-click / fetch-retry races.
    // Identity = MAX(fingerprint, email, ip_address) — see lib/db.ts for
    // why all three are used now (incognito-bypass regression).
    //
    // Limit resolution, in order of precedence:
    //   1. BYPASS_USAGE_LIMIT=true           → unlimited (dev/local)
    //   2. ANALYZER_USAGE_LIMIT=<n>          → explicit override (UAT/tester)
    //   3. default                           → 2 rewrites per user (prod)
    const bypassLimit = process.env.BYPASS_USAGE_LIMIT === 'true';
    const configuredLimit = parseInt(process.env.ANALYZER_USAGE_LIMIT ?? '', 10);
    const effectiveLimit = bypassLimit
      ? Number.MAX_SAFE_INTEGER
      : (Number.isFinite(configuredLimit) && configuredLimit > 0 ? configuredLimit : 2);

    const { allowed, usageCountBefore } = await dbClient.createLeadIfUnderLimit({
      email,
      reportId,
      ipAddress,
      fingerprint,
      limit: effectiveLimit,
    });

    // Phase 3: Lock State — user already has 2 leads; this would be the
    // next attempt. Still sync to HubSpot because the user explicitly
    // submitted their email in the unlock modal; we just skip the expensive
    // vacancy rewrite and email attachment generation.
    if (!allowed) {
      await syncAnalyzerLeadToHubSpot(usageCountBefore + 1, "locked");

      return NextResponse.json({
        success: false,
        isLocked: true,
        message: "You have reached the limit of free audits."
      });
    }

    // The lead has been inserted inside the transaction.
    // usageCountBefore: 0 → 1st rewrite, 1 → 2nd rewrite.
    // Pass (usageCountBefore + 1) as the "Nth email" value for HubSpot + email template.
    // Generate optimization (pass locale for localized responses)
    const optimizationResult = await optimizeVacancy(report.vacancy_text, analysis, locale || 'nl');

    // Sync to HubSpot (with proper error handling).
    //
    // "scrape_bron" (Dutch: source/origin) is the existing custom
    // property on this HubSpot portal — same one the sales demo flow
    // writes to. Keeps all contacts tagged with where they came from,
    // segmentable in HubSpot views.
    await syncAnalyzerLeadToHubSpot(usageCountBefore + 1, "unlocked");

    // Send email with PDF attachment
    const emailResult = await sendOptimizedVacancyEmail({
      to: email,
      optimization: optimizationResult,
      reportId,
      usageCount: usageCountBefore + 1, // Pass the NEW total count
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
