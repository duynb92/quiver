import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import { getDb } from '../db/database.js';
import { parseVariables } from '../template/parser.js';
import type { Prompt } from '../types.js';

export function editCommand(name: string): void {
  const db = getDb();
  const prompt = db.prepare('SELECT * FROM prompts WHERE name = ?').get(name) as Prompt | undefined;

  if (!prompt) {
    console.error(`No prompt found: '${name}'`);
    process.exit(1);
  }

  const editor = process.env.EDITOR || process.env.VISUAL || 'vi';
  const tmpFile = path.join(os.tmpdir(), `quiver-edit-${prompt.id}.txt`);

  fs.writeFileSync(tmpFile, prompt.content, 'utf8');

  const result = spawnSync(editor, [tmpFile], { stdio: 'inherit' });

  if (result.error) {
    console.error(`Error: Could not launch editor '${editor}': ${result.error.message}`);
    fs.unlinkSync(tmpFile);
    process.exit(3);
  }

  const newContent = fs.readFileSync(tmpFile, 'utf8');
  fs.unlinkSync(tmpFile);

  if (newContent === prompt.content) {
    console.log('No changes made.');
    return;
  }

  const newVars = parseVariables(newContent);

  db.prepare(
    `UPDATE prompts SET content = ?, variables = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(newContent, newVars.length > 0 ? JSON.stringify(newVars) : null, prompt.id);

  console.log(`Updated prompt '${name}'`);
  if (newVars.length > 0) {
    console.log(`Variables: ${newVars.map((v) => v.name).join(', ')}`);
  }
}
