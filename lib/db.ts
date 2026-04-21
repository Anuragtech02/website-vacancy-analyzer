import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { reports, leads } from "./db/schema";
import { eq, count, or } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL!;

// Connection pool for serverless/server environments
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

const db = drizzle(client, { schema: { reports, leads } });

export const dbClient = {
  createReport: async (
    id: string,
    vacancyText: string,
    analysisJson: string
  ) => {
    await db.insert(reports).values({
      id,
      vacancy_text: vacancyText,
      analysis_json: analysisJson,
    });
  },

  getReport: async (id: string) => {
    const result = await db
      .select()
      .from(reports)
      .where(eq(reports.id, id))
      .limit(1);
    return result[0] || null;
  },

  createLead: async (email: string, reportId: string, ipAddress?: string, fingerprint?: string) => {
    await db.insert(leads).values({
      email,
      report_id: reportId,
      ip_address: ipAddress || null,
      fingerprint: fingerprint || null,
    });
  },

  countLeadsByEmail: async (email: string) => {
    const result = await db
      .select({ count: count() })
      .from(leads)
      .where(eq(leads.email, email));
    return result[0]?.count || 0;
  },

  // Count leads by browser fingerprint only. IP is intentionally NOT used here
  // because office/VPN/NAT networks share IPs across many users; including IP
  // in the OR caused legitimate users to be blocked by a colleague's usage.
  countLeadsByFingerprint: async (fingerprint?: string) => {
    if (!fingerprint) return 0;
    const result = await db
      .select({ count: count() })
      .from(leads)
      .where(eq(leads.fingerprint, fingerprint));
    return result[0]?.count || 0;
  },

  // Atomically checks count + inserts lead in a single transaction to prevent
  // double-click / fetch-retry races past the usage limit guard.
  createLeadIfUnderLimit: async (params: {
    email: string;
    reportId: string;
    ipAddress?: string;
    fingerprint?: string;
    limit: number;
  }): Promise<{ allowed: boolean; usageCountBefore: number }> => {
    return await db.transaction(async (tx) => {
      const fpCountResult = params.fingerprint
        ? await tx.select({ count: count() }).from(leads).where(eq(leads.fingerprint, params.fingerprint))
        : [{ count: 0 }];
      const emCountResult = await tx.select({ count: count() }).from(leads).where(eq(leads.email, params.email));

      const fpCount = Number(fpCountResult[0]?.count ?? 0);
      const emCount = Number(emCountResult[0]?.count ?? 0);
      const usageCountBefore = Math.max(fpCount, emCount);

      if (usageCountBefore >= params.limit) {
        return { allowed: false, usageCountBefore };
      }

      await tx.insert(leads).values({
        email: params.email,
        report_id: params.reportId,
        ip_address: params.ipAddress || null,
        fingerprint: params.fingerprint || null,
      });

      return { allowed: true, usageCountBefore };
    });
  },

  // Delete leads by identity (for admin reset functionality)
  deleteLeadsByIdentity: async (params: {
    email?: string;
    ipAddress?: string;
    fingerprint?: string;
  }) => {
    const { email, ipAddress, fingerprint } = params;

    if (!email && !ipAddress && !fingerprint) return 0;

    const conditions = [];
    if (email) conditions.push(eq(leads.email, email));
    if (ipAddress) conditions.push(eq(leads.ip_address, ipAddress));
    if (fingerprint) conditions.push(eq(leads.fingerprint, fingerprint));

    // Use OR to match any provided criteria (delete all leads matching any identifier)
    const result = await db
      .delete(leads)
      .where(or(...conditions))
      .returning();

    return result.length;
  },
};
