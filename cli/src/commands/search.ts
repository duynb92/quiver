import { getDb } from '../db/database.js';
import { searchPrompts } from '../search/ranker.js';
import { formatTable, outputResult } from '../utils/format.js';

interface SearchOptions {
  tag?: string;
  category?: string;
  limit?: string;
  json?: boolean;
}

export function searchCommand(query: string, options: SearchOptions): void {
  const db = getDb();
  const limit = options.limit ? parseInt(options.limit, 10) : 20;

  let results;
  try {
    results = searchPrompts(db, query, {
      tag: options.tag,
      category: options.category,
      limit,
    });
  } catch {
    console.error(`Search error: invalid query '${query}'`);
    process.exit(2);
  }

  if (options.json) {
    outputResult(results, true);
    return;
  }

  if (results.length === 0) {
    console.log(`No prompts found matching '${query}'`);
    return;
  }

  const rows = results.map((p, i) => ({
    '#': i + 1,
    Name: p.name,
    Category: p.category,
    Tags: p.tags ?? '',
    Uses: p.use_count,
    Preview: p.content.slice(0, 50),
  }));

  console.log(
    formatTable(rows, [
      { key: '#', label: '#', width: 3 },
      { key: 'Name', label: 'Name', width: 20 },
      { key: 'Category', label: 'Category', width: 12 },
      { key: 'Tags', label: 'Tags', width: 20 },
      { key: 'Uses', label: 'Uses', width: 5 },
      { key: 'Preview', label: 'Preview', width: 50 },
    ])
  );
}
