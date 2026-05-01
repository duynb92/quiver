import Database from 'better-sqlite3';
import fs from 'fs';
import { getDataDir, getDbPath } from '../utils/config.js';
import { SCHEMA_SQL } from './schema.js';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  const dataDir = getDataDir();
  fs.mkdirSync(dataDir, { recursive: true });

  db = new Database(getDbPath());
  db.pragma('journal_mode = WAL');
  db.exec(SCHEMA_SQL);

  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
