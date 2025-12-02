CREATE TABLE `leads` (
	`email` text NOT NULL,
	`report_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`vacancy_text` text NOT NULL,
	`analysis_json` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
