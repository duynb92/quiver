import Database from 'better-sqlite3';
import { SCHEMA_SQL } from '../src/db/schema.js';
import type { Prompt } from '../src/types.js';
import { nanoid } from 'nanoid';
import { parseVariables } from '../src/template/parser.js';

export function createTestDb(): Database.Database {
  const db = new Database(':memory:');
  db.pragma('journal_mode = WAL');
  db.exec(SCHEMA_SQL);
  return db;
}

export function insertPrompt(
  db: Database.Database,
  data: Partial<Prompt> & { name: string; content: string }
): Prompt {
  const id = data.id ?? nanoid(12);
  const vars = data.variables ?? JSON.stringify(parseVariables(data.content));

  db.prepare(
    `INSERT INTO prompts (id, name, content, description, category, tags, variables, use_count)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    data.name,
    data.content,
    data.description ?? null,
    data.category ?? 'general',
    data.tags ?? null,
    vars,
    data.use_count ?? 0
  );

  return db.prepare('SELECT * FROM prompts WHERE id = ?').get(id) as Prompt;
}
