import { getDb } from '../db/database.js';
import { formatTable, outputResult } from '../utils/format.js';
import type { Prompt } from '../types.js';

interface ListOptions {
  category?: string;
  tag?: string;
  limit?: string;
  json?: boolean;
  sort?: string;
}

export function listCommand(options: ListOptions): void {
  const db = getDb();
  const limit = options.limit ? parseInt(options.limit, 10) : 50;
  const sort = options.sort ?? 'use_count';

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (options.category) {
    conditions.push('category = ?');
    params.push(options.category);
  }
  if (options.tag) {
    conditions.push(`(',' || tags || ',') LIKE '%,' || ? || ',%'`);
    params.push(options.tag);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderCol = ['use_count', 'name', 'created_at', 'updated_at'].includes(sort)
    ? sort
    : 'use_count';

  params.push(limit);
  const results = db
    .prepare(`SELECT * FROM prompts ${where} ORDER BY ${orderCol} DESC LIMIT ?`)
    .all(...params) as Prompt[];

  if (options.json) {
    outputResult(results, true);
    return;
  }

  if (results.length === 0) {
    console.log('No prompts found.');
    return;
  }

  const rows = results.map((p) => ({
    Name: p.name,
    Category: p.category,
    Tags: p.tags ?? '',
    Uses: p.use_count,
    Preview: p.content.slice(0, 40),
  }));

  console.log(
    formatTable(rows, [
      { key: 'Name', label: 'Name', width: 20 },
      { key: 'Category', label: 'Category', width: 12 },
      { key: 'Tags', label: 'Tags', width: 20 },
      { key: 'Uses', label: 'Uses', width: 5 },
      { key: 'Preview', label: 'Preview', width: 40 },
    ])
  );
}
