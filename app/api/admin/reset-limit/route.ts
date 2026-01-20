import { NextRequest, NextResponse } from "next/server";
import { dbClient } from "@/lib/db";
import { getClientIP } from "@/lib/fingerprint";

/**
 * Admin endpoint to reset usage limits for the current user
 *
 * Automatically extracts IP address and fingerprint from the request.
 * Just visit this URL from the user's browser:
 *
 * GET /api/admin/reset-limit?secret=YOUR_SECRET_KEY
 *
 * Optional: You can also manually specify an email to reset:
 * GET /api/admin/reset-limit?email=user@example.com&secret=YOUR_SECRET_KEY
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const secret = searchParams.get("secret");
    const manualEmail = searchParams.get("email");

    // Verify admin secret (set in environment variables)
    const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY;

    if (!ADMIN_SECRET) {
      return NextResponse.json(
        { error: "Admin functionality not configured" },
        { status: 500 }
      );
    }

    if (!secret || secret !== ADMIN_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid secret key" },
        { status: 401 }
      );
    }

    // Extract IP and fingerprint from request headers
    const ipAddress = getClientIP(req);
    const fingerprint = req.headers.get("x-fingerprint");

    // Delete leads matching the criteria
    const deletedCount = await dbClient.deleteLeadsByIdentity({
      email: manualEmail || undefined,
      ipAddress: ipAddress || undefined,
      fingerprint: fingerprint || undefined,
    });

    const identifiers = [];
    if (manualEmail) identifiers.push(`email: ${manualEmail}`);
    if (ipAddress) identifiers.push(`IP: ${ipAddress}`);
    if (fingerprint) identifiers.push(`fingerprint: ${fingerprint}`);

    return NextResponse.json({
      success: true,
      message: `Successfully reset usage limit for current user`,
      deletedLeads: deletedCount,
      identifiers: identifiers.length > 0 ? identifiers.join(", ") : "No identifiers found",
      note: "This reset was based on the request's IP address and fingerprint"
    });

  } catch (error) {
    console.error("Reset Limit Error:", error);
    return NextResponse.json(
      { error: "Failed to reset limit" },
      { status: 500 }
    );
  }
}

// Also support POST for programmatic access with manual override
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { secret, email: manualEmail } = body;

    // Verify admin secret
    const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY;

    if (!ADMIN_SECRET) {
      return NextResponse.json(
        { error: "Admin functionality not configured" },
        { status: 500 }
      );
    }

    if (!secret || secret !== ADMIN_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid secret key" },
        { status: 401 }
      );
    }

    // Extract IP and fingerprint from request headers
    const ipAddress = getClientIP(req);
    const fingerprint = req.headers.get("x-fingerprint");

    const deletedCount = await dbClient.deleteLeadsByIdentity({
      email: manualEmail || undefined,
      ipAddress: ipAddress || undefined,
      fingerprint: fingerprint || undefined,
    });

    const identifiers = [];
    if (manualEmail) identifiers.push(`email: ${manualEmail}`);
    if (ipAddress) identifiers.push(`IP: ${ipAddress}`);
    if (fingerprint) identifiers.push(`fingerprint: ${fingerprint}`);

    return NextResponse.json({
      success: true,
      message: `Successfully reset usage limit`,
      deletedLeads: deletedCount,
      identifiers: identifiers.length > 0 ? identifiers.join(", ") : "No identifiers found",
    });

  } catch (error) {
    console.error("Reset Limit Error:", error);
    return NextResponse.json(
      { error: "Failed to reset limit" },
      { status: 500 }
    );
  }
}
