import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { reports, leads } from "./db/schema";
import { eq } from "drizzle-orm";

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

  createLead: async (email: string, reportId: string) => {
    await db.insert(leads).values({
      email,
      report_id: reportId,
    });
  },
};
