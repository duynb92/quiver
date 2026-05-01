import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
import { getDb } from '../db/database.js';

interface ImportOptions {
  overwrite?: boolean;
  dryRun?: boolean;
}

interface ExportedPrompt {
  name: string;
  content: string;
  description?: string | null;
  category?: string;
  tags?: string[];
  variables?: unknown[];
}

interface ExportFile {
  version?: string;
  prompts: ExportedPrompt[];
}

export async function importCommand(file: string, options: ImportOptions): Promise<void> {
  if (!fs.existsSync(file)) {
    console.error(`Error: File not found: ${file}`);
    process.exit(2);
  }

  const ext = path.extname(file).toLowerCase();
  const raw = fs.readFileSync(file, 'utf8');

  let data: ExportFile;
  if (ext === '.yaml' || ext === '.yml') {
    const { parse } = await import('yaml');
    data = parse(raw) as ExportFile;
  } else {
    data = JSON.parse(raw) as ExportFile;
  }

  if (!Array.isArray(data.prompts)) {
    console.error('Error: Invalid import file — missing "prompts" array');
    process.exit(2);
  }

  const db = getDb();
  let imported = 0;
  let updated = 0;
  let skipped = 0;

  for (const p of data.prompts) {
    const tags = Array.isArray(p.tags) ? p.tags.join(',') : (p.tags ?? null);
    const variables = p.variables && p.variables.length > 0 ? JSON.stringify(p.variables) : null;

    const existing = db.prepare('SELECT id FROM prompts WHERE name = ?').get(p.name);

    if (existing) {
      if (options.overwrite) {
        if (!options.dryRun) {
          db.prepare(
            `UPDATE prompts SET content = ?, description = ?, category = ?, tags = ?, variables = ?, updated_at = datetime('now') WHERE name = ?`
          ).run(p.content, p.description ?? null, p.category ?? 'general', tags, variables, p.name);
        }
        updated++;
        console.log(`${options.dryRun ? '[dry-run] ' : ''}Updated: ${p.name}`);
      } else {
        skipped++;
        console.warn(`Skipped (already exists): ${p.name}`);
      }
    } else {
      if (!options.dryRun) {
        db.prepare(
          `INSERT INTO prompts (id, name, content, description, category, tags, variables) VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).run(nanoid(12), p.name, p.content, p.description ?? null, p.category ?? 'general', tags, variables);
      }
      imported++;
      console.log(`${options.dryRun ? '[dry-run] ' : ''}Imported: ${p.name}`);
    }
  }

  console.log(
    `\n${options.dryRun ? '[dry-run] ' : ''}Done: ${imported} imported, ${updated} updated, ${skipped} skipped`
  );
}
