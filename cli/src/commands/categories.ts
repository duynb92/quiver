import { getDb } from '../db/database.js';
import { outputResult } from '../utils/format.js';

interface CategoriesOptions {
  json?: boolean;
}

export function categoriesCommand(options: CategoriesOptions): void {
  const db = getDb();
  const rows = db
    .prepare(`SELECT category, COUNT(*) as count FROM prompts GROUP BY category ORDER BY count DESC`)
    .all() as { category: string; count: number }[];

  if (options.json) {
    outputResult(rows, true);
    return;
  }

  if (rows.length === 0) {
    console.log('No categories found.');
    return;
  }

  for (const { category, count } of rows) {
    console.log(`${category} (${count} prompt${count === 1 ? '' : 's'})`);
  }
}
