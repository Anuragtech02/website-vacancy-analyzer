import { pgTable, text, timestamp, integer, index } from "drizzle-orm/pg-core";

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
  ip_address: text("ip_address"),
  fingerprint: text("fingerprint"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

// analysis_jobs — the single source of truth for one run of vacancy
// analysis end to end. Created on POST /api/analyze (non-blocking), picked
// up by the worker process via pg-boss, updated with progress as Gemini
// streams tokens, and finally resolved to a report_id (or an error
// message) on completion. If the user attaches an email mid-run, it
// lives in the `email` column and is sent after the report is saved.
//
// Rows stay for 30 days post-finished for diagnostics; a separate
// housekeeping pass can delete older ones.
export const analysisJobs = pgTable(
  "analysis_jobs",
  {
    id: text("id").primaryKey(),                           // nanoid(12)
    status: text("status").notNull(),                      // 'pending' | 'running' | 'done' | 'failed'
    progress_pct: integer("progress_pct").notNull().default(0),  // 0..100 for the loader
    stage: text("stage"),                                  // 'parse' | 'bias' | 'tone' | 'structure' | 'benefits' | 'rewrite'
    vacancy_text: text("vacancy_text").notNull(),
    category: text("category").notNull(),
    locale: text("locale").notNull(),
    // 'v1' (old design, /{locale}/report/{id}) or 'v2' (new design, /{locale}/v2/report/{id}).
    // Captured on enqueue from the submitting landing page so the completion email
    // can route the user back to the UI they came from. Bug pre-fix: everything
    // hardcoded to /v2/, so a user who ran the analysis on /{locale} got sent to
    // the unfamiliar v2 layout after clicking the email link.
    ui_version: text("ui_version").notNull().default("v2"),
    email: text("email"),                                  // NULL until attached
    email_sent_at: timestamp("email_sent_at"),             // NULL until notified
    report_id: text("report_id").references(() => reports.id), // NULL until done
    error_message: text("error_message"),                  // NULL unless failed
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow(),
    started_at: timestamp("started_at"),
    finished_at: timestamp("finished_at"),
  },
  (t) => ({
    by_status_created: index("analysis_jobs_status_created_idx").on(t.status, t.created_at),
    by_email: index("analysis_jobs_email_idx").on(t.email),
  }),
);
