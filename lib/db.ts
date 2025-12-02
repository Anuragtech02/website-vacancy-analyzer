import { drizzle } from 'drizzle-orm/d1';
import { reports, leads } from './db/schema';
import { eq } from 'drizzle-orm';

export async function getDb(env: any) {
  if (!env?.MainDB) {
    // In local development with 'next dev', env might be undefined or missing MainDB.
    // We can throw a more helpful error or return null if we want to handle it gracefully,
    // but for now, let's ensure we don't crash the import.
    throw new Error("MainDB binding not found. Ensure you have configured the D1 binding in Cloudflare Pages settings.");
  }
  return drizzle(env.MainDB, { schema: { reports, leads } });
}

export const dbClient = {
  createReport: async (id: string, vacancyText: string, analysisJson: string, env: any) => {
    const db = await getDb(env);
    await db.insert(reports).values({
      id,
      vacancy_text: vacancyText,
      analysis_json: analysisJson,
    });
  },

  getReport: async (id: string, env: any) => {
    const db = await getDb(env);
    const result = await db.select().from(reports).where(eq(reports.id, id)).get();
    return result;
  },

  createLead: async (email: string, reportId: string, env: any) => {
    const db = await getDb(env);
    await db.insert(leads).values({
      email,
      report_id: reportId,
    });
  }
};
