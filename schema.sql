CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  vacancy_text TEXT NOT NULL,
  analysis_json TEXT NOT NULL,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  report_id TEXT NOT NULL,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (report_id) REFERENCES reports(id)
);
