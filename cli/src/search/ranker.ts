import type Database from 'better-sqlite3';
import type { Prompt } from '../types.js';

interface SearchOptions {
  tag?: string;
  category?: string;
  limit?: number;
}

export function searchPrompts(
  db: Database.Database,
  query: string,
  options: SearchOptions = {}
): Prompt[] {
  const limit = options.limit ?? 20;
  const conditions: string[] = ['prompts_fts MATCH ?'];
  const params: unknown[] = [query];

  if (options.tag) {
    conditions.push(`(',' || p.tags || ',') LIKE '%,' || ? || ',%'`);
    params.push(options.tag);
  }
  if (options.category) {
    conditions.push('p.category = ?');
    params.push(options.category);
  }

  params.push(limit);

  const sql = `
    SELECT p.*, fts.rank
    FROM prompts_fts fts
    JOIN prompts p ON p.rowid = fts.rowid
    WHERE ${conditions.join(' AND ')}
    ORDER BY fts.rank
    LIMIT ?
  `;

  return db.prepare(sql).all(...params) as Prompt[];
}

export function findByName(db: Database.Database, query: string): Prompt | null {
  // 1. Exact match
  const exact = db.prepare('SELECT * FROM prompts WHERE name = ?').get(query) as Prompt | undefined;
  if (exact) return exact;

  // 2. Prefix match
  const prefix = db
    .prepare('SELECT * FROM prompts WHERE name LIKE ? || \'%\'')
    .get(query) as Prompt | undefined;
  if (prefix) return prefix;

  // 3. Contains match
  const contains = db
    .prepare('SELECT * FROM prompts WHERE name LIKE \'%\' || ? || \'%\'')
    .get(query) as Prompt | undefined;
  if (contains) return contains;

  // 4. FTS fallback
  try {
    const results = searchPrompts(db, query, { limit: 1 });
    return results[0] ?? null;
  } catch {
    return null;
  }
}
