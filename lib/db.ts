import { drizzle } from 'drizzle-orm/d1';
import { reports, leads } from './db/schema';
import { eq } from 'drizzle-orm';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export function getDb() {
  const ctx = getCloudflareContext();
  const binding = (ctx.env as { MainDB: D1Database }).MainDB;

  if (!binding) {
    throw new Error("MainDB binding not found. Ensure you have configured the D1 binding in Cloudflare Pages settings.");
  }
  return drizzle(binding, { schema: { reports, leads } });
}

export const dbClient = {
  createReport: async (id: string, vacancyText: string, analysisJson: string) => {
    const db = getDb();
    await db.insert(reports).values({
      id,
      vacancy_text: vacancyText,
      analysis_json: analysisJson,
    });
  },

  getReport: async (id: string) => {
    const db = getDb();
    const result = await db.select().from(reports).where(eq(reports.id, id)).get();
    return result;
  },

  createLead: async (email: string, reportId: string) => {
    const db = getDb();
    await db.insert(leads).values({
      email,
      report_id: reportId,
    });
  }
};
