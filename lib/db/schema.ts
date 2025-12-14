import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const reports = pgTable("reports", {
  id: text("id").primaryKey(),
  vacancy_text: text("vacancy_text").notNull(),
  analysis_json: text("analysis_json").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const leads = pgTable("leads", {
  email: text("email").notNull(),
  report_id: text("report_id")
    .notNull()
    .references(() => reports.id),
  created_at: timestamp("created_at").notNull().defaultNow(),
});
