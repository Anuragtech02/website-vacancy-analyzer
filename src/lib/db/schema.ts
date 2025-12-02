import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const reports = sqliteTable("reports", {
  id: text("id").primaryKey(),
  vacancy_text: text("vacancy_text").notNull(),
  analysis_json: text("analysis_json").notNull(),
  created_at: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const leads = sqliteTable("leads", {
  email: text("email").notNull(),
  report_id: text("report_id").notNull(),
  created_at: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});
