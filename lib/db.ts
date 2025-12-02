import { drizzle } from 'drizzle-orm/d1';
import { reports, leads } from './db/schema';
import { eq } from 'drizzle-orm';

export async function getDb(env: any) {
  // In OpenNext with nodejs_compat, bindings are often available on process.env
  // However, for D1, we might need to pass the binding explicitly from the request context if process.env doesn't work.
  // But let's try to support both passed env and process.env fallback.
  const binding = env?.MainDB || (process.env.MainDB as unknown as any);
  
  if (!binding) {
    throw new Error("MainDB binding not found. Ensure you have configured the D1 binding in Cloudflare Pages settings.");
  }
  return drizzle(binding, { schema: { reports, leads } });
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
