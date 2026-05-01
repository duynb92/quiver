import { getDb } from '../db/database.js';
import { outputResult } from '../utils/format.js';

interface TagsOptions {
  json?: boolean;
}

export function tagsCommand(options: TagsOptions): void {
  const db = getDb();
  const rows = db
    .prepare(`SELECT tags FROM prompts WHERE tags IS NOT NULL AND tags != ''`)
    .all() as { tags: string }[];

  const counts = new Map<string, number>();
  for (const row of rows) {
    for (const tag of row.tags.split(',').map((t) => t.trim()).filter(Boolean)) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  const sorted = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }));

  if (options.json) {
    outputResult(sorted, true);
    return;
  }

  if (sorted.length === 0) {
    console.log('No tags found.');
    return;
  }

  for (const { tag, count } of sorted) {
    console.log(`${tag} (${count} prompt${count === 1 ? '' : 's'})`);
  }
}
