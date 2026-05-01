import { getDb } from '../db/database.js';
import { findByName } from '../search/ranker.js';
import { formatPromptDetail, outputResult } from '../utils/format.js';
import type { Prompt } from '../types.js';
import type { TemplateVariable } from '../template/parser.js';

interface ShowOptions {
  json?: boolean;
}

export function showCommand(name: string, options: ShowOptions): void {
  const db = getDb();

  let prompt = db.prepare('SELECT * FROM prompts WHERE name = ?').get(name) as Prompt | undefined;
  if (!prompt) {
    prompt = findByName(db, name) ?? undefined;
  }

  if (!prompt) {
    console.error(`No prompt found: '${name}'`);
    process.exit(1);
  }

  if (options.json) {
    const variables: TemplateVariable[] = prompt.variables ? JSON.parse(prompt.variables) : [];
    outputResult({ ...prompt, variables }, true);
    return;
  }

  console.log(formatPromptDetail(prompt));
}
