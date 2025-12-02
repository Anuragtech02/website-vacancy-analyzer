import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DB_PATH = 'local.db';

let db: Database.Database;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    // Enable WAL mode for better performance
    db.pragma('journal_mode = WAL');
    
    // Initialize schema if needed
    const schemaPath = path.join(process.cwd(), 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf-8');
      db.exec(schema);
    }
  }
  return db;
}

export interface Report {
  id: string;
  vacancy_text: string;
  analysis_json: string; // JSON string
  created_at: number;
}

export interface Lead {
  id: number;
  email: string;
  report_id: string;
  created_at: number;
}

export const dbClient = {
  createReport: (id: string, vacancyText: string, analysisJson: string) => {
    const stmt = getDb().prepare('INSERT INTO reports (id, vacancy_text, analysis_json) VALUES (?, ?, ?)');
    stmt.run(id, vacancyText, analysisJson);
  },

  getReport: (id: string): Report | undefined => {
    const stmt = getDb().prepare('SELECT * FROM reports WHERE id = ?');
    return stmt.get(id) as Report | undefined;
  },

  createLead: (email: string, reportId: string) => {
    const stmt = getDb().prepare('INSERT INTO leads (email, report_id) VALUES (?, ?)');
    stmt.run(email, reportId);
  }
};
