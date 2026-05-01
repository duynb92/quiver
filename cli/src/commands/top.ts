import { getDb } from '../db/database.js';
import { outputResult } from '../utils/format.js';
import type { Prompt } from '../types.js';

interface TopOptions {
  json?: boolean;
}

export function topCommand(nArg: string | undefined, options: TopOptions): void {
  const n = nArg ? parseInt(nArg, 10) : 10;
  const db = getDb();

  const results = db
    .prepare('SELECT * FROM prompts ORDER BY use_count DESC LIMIT ?')
    .all(n) as Prompt[];

  if (options.json) {
    outputResult(results, true);
    return;
  }

  if (results.length === 0) {
    console.log('No prompts saved yet.');
    return;
  }

  results.forEach((p, i) => {
    const preview = p.description ?? p.content.slice(0, 60);
    console.log(`${i + 1}. ${p.name} (${p.use_count} uses) — ${preview}`);
  });
}
