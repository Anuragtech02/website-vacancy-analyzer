CREATE TABLE "leads" (
	"email" text NOT NULL,
	"report_id" text NOT NULL,
	"ip_address" text,
	"fingerprint" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" text PRIMARY KEY NOT NULL,
	"vacancy_text" text NOT NULL,
	"analysis_json" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE no action ON UPDATE no action;