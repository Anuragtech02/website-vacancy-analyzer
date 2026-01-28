/**
 * Raw SQL database access for background workers
 * Separate from main db.ts to avoid circular dependencies
 */

import Database from 'better-sqlite3';

const dbPath = process.env.DATABASE_PATH || './database.db';
export const dbRaw = new Database(dbPath);

// Enable WAL mode for better concurrent access
dbRaw.pragma('journal_mode = WAL');

export default dbRaw;
