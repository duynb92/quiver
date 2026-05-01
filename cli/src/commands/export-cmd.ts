import fs from 'fs';
import { getDb } from '../db/database.js';
import type { Prompt } from '../types.js';

interface ExportOptions {
  format?: string;
  category?: string;
  tag?: string;
  output?: string;
}

export async function exportCommand(options: ExportOptions): Promise<void> {
  const format = options.format ?? 'json';
  if (format !== 'json' && format !== 'yaml') {
    console.error('Error: --format must be json or yaml');
    process.exit(2);
  }

  const db = getDb();
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
  const prompts = db.prepare(`SELECT * FROM prompts ${where} ORDER BY name`).all(...params) as Prompt[];

  const exportData = {
    version: '1.0',
    exported_at: new Date().toISOString(),
    prompts: prompts.map((p) => ({
      name: p.name,
      content: p.content,
      description: p.description,
      category: p.category,
      tags: p.tags ? p.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      variables: p.variables ? JSON.parse(p.variables) : [],
    })),
  };

  let output: string;
  if (format === 'yaml') {
    const { stringify } = await import('yaml');
    output = stringify(exportData);
  } else {
    output = JSON.stringify(exportData, null, 2);
  }

  if (options.output) {
    fs.writeFileSync(options.output, output, 'utf8');
    console.log(`Exported ${exportData.prompts.length} prompt(s) to ${options.output}`);
  } else {
    process.stdout.write(output + '\n');
  }
}
