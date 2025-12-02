import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import { reports, leads } from './db/schema';
import { eq } from 'drizzle-orm';

// Define the DB type based on the schema
export type DbClientType = ReturnType<typeof drizzleD1<typeof import('./db/schema')>> | ReturnType<typeof drizzleSqlite<typeof import('./db/schema')>>;

let localDb: ReturnType<typeof drizzleSqlite<typeof import('./db/schema')>> | null = null;

export async function getDb(env?: any) {
  if (env?.DB) {
    return drizzleD1(env.DB, { schema: { reports, leads } });
  }

  if (!localDb) {
    const Database = (await import('better-sqlite3')).default;
    const sqlite = new Database('local.db');
    localDb = drizzleSqlite(sqlite, { schema: { reports, leads } });
  }
  return localDb;
}

export const dbClient = {
  createReport: async (id: string, vacancyText: string, analysisJson: string, env?: any) => {
    const db = await getDb(env);
    await db.insert(reports).values({
      id,
      vacancy_text: vacancyText,
      analysis_json: analysisJson,
    });
  },

  getReport: async (id: string, env?: any) => {
    const db = await getDb(env);
    const result = await db.select().from(reports).where(eq(reports.id, id)).get();
    return result;
  },

  createLead: async (email: string, reportId: string, env?: any) => {
    const db = await getDb(env);
    await db.insert(leads).values({
      email,
      report_id: reportId,
    });
  }
};
