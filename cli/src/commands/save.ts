import fs from 'fs';
import { nanoid } from 'nanoid';
import { getDb } from '../db/database.js';
import { parseVariables } from '../template/parser.js';
import { outputResult } from '../utils/format.js';

interface SaveOptions {
  content?: string;
  file?: string;
  stdin?: boolean;
  tags?: string;
  category?: string;
  description?: string;
  var?: string[];
  json?: boolean;
}

export async function saveCommand(name: string, options: SaveOptions): Promise<void> {
  let content: string;

  if (options.content) {
    content = options.content;
  } else if (options.file) {
    if (!fs.existsSync(options.file)) {
      console.error(`Error: File not found: ${options.file}`);
      process.exit(2);
    }
    content = fs.readFileSync(options.file, 'utf8');
  } else if (options.stdin) {
    content = fs.readFileSync('/dev/stdin', 'utf8');
  } else {
    console.error(
      'Error: No content provided. Use --content, --file, or --stdin.\n' +
        'Example: pm save my-prompt --content "Hello {{name}}"'
    );
    process.exit(2);
  }

  const detectedVars = parseVariables(content);
  const varOverrides = new Map<string, string>();

  for (const varFlag of options.var ?? []) {
    const eqIdx = varFlag.indexOf('=');
    if (eqIdx === -1) continue;
    varOverrides.set(varFlag.slice(0, eqIdx), varFlag.slice(eqIdx + 1));
  }

  const mergedVars = detectedVars.map((v) => ({
    ...v,
    default: varOverrides.has(v.name) ? varOverrides.get(v.name)! : v.default,
  }));

  const db = getDb();
  const id = nanoid(12);

  try {
    db.prepare(
      `INSERT INTO prompts (id, name, content, description, category, tags, variables)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      name,
      content,
      options.description ?? null,
      options.category ?? 'general',
      options.tags ?? null,
      mergedVars.length > 0 ? JSON.stringify(mergedVars) : null
    );
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('UNIQUE constraint failed')) {
      console.error(`Error: Prompt '${name}' already exists. Use 'pm edit ${name}' to modify.`);
      process.exit(2);
    }
    throw err;
  }

  const prompt = db.prepare('SELECT * FROM prompts WHERE id = ?').get(id);

  if (options.json) {
    outputResult(prompt, true);
  } else {
    console.log(`Saved prompt '${name}'`);
    if (mergedVars.length > 0) {
      console.log(`Variables detected: ${mergedVars.map((v) => v.name).join(', ')}`);
    }
    if (options.tags) console.log(`Tags: ${options.tags}`);
    if (options.category) console.log(`Category: ${options.category}`);
  }
}
