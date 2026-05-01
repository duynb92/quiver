import { getDb } from '../db/database.js';
import { expandTemplate } from '../template/expander.js';
import { findByName } from '../search/ranker.js';
import { outputResult } from '../utils/format.js';
import type { TemplateVariable } from '../template/parser.js';

interface LoadOptions {
  set?: string[];
  raw?: boolean;
  json?: boolean;
}

export function loadCommand(query: string, options: LoadOptions): void {
  const db = getDb();
  const prompt = findByName(db, query);

  if (!prompt) {
    console.error(`No prompt matching '${query}'`);
    process.exit(1);
  }

  db.prepare('UPDATE prompts SET use_count = use_count + 1 WHERE id = ?').run(prompt.id);

  if (options.raw) {
    if (options.json) {
      outputResult({ name: prompt.name, content: prompt.content }, true);
    } else {
      console.log(prompt.content);
    }
    return;
  }

  const variables: TemplateVariable[] = prompt.variables ? JSON.parse(prompt.variables) : [];
  const overrides: Record<string, string> = {};

  for (const flag of options.set ?? []) {
    const eqIdx = flag.indexOf('=');
    if (eqIdx === -1) continue;
    overrides[flag.slice(0, eqIdx)] = flag.slice(eqIdx + 1);
  }

  const { text, warnings } = expandTemplate(prompt.content, variables, overrides);

  for (const w of warnings) console.warn(`Warning: ${w}`);

  if (options.json) {
    outputResult(
      {
        name: prompt.name,
        expanded: text,
        original: prompt.content,
        variables,
        warnings,
      },
      true
    );
  } else {
    console.log(text);
  }
}
