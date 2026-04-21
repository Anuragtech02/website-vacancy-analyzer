CREATE TABLE "analysis_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"status" text NOT NULL,
	"progress_pct" integer DEFAULT 0 NOT NULL,
	"stage" text,
	"vacancy_text" text NOT NULL,
	"category" text NOT NULL,
	"locale" text NOT NULL,
	"email" text,
	"email_sent_at" timestamp,
	"report_id" text,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"started_at" timestamp,
	"finished_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "analysis_jobs" ADD CONSTRAINT "analysis_jobs_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "analysis_jobs_status_created_idx" ON "analysis_jobs" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "analysis_jobs_email_idx" ON "analysis_jobs" USING btree ("email");