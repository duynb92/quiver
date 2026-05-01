import readline from 'readline';
import { getDb } from '../db/database.js';
import { formatPromptDetail } from '../utils/format.js';
import type { Prompt } from '../types.js';

interface DeleteOptions {
  force?: boolean;
}

export async function deleteCommand(name: string, options: DeleteOptions): Promise<void> {
  const db = getDb();
  const prompt = db.prepare('SELECT * FROM prompts WHERE name = ?').get(name) as Prompt | undefined;

  if (!prompt) {
    console.error(`No prompt found: '${name}'`);
    process.exit(1);
  }

  if (!options.force) {
    console.log(formatPromptDetail(prompt));
    console.log('');

    const confirmed = await confirm(`Delete prompt '${name}'? [y/N] `);
    if (!confirmed) {
      console.log('Aborted.');
      return;
    }
  }

  db.prepare('DELETE FROM prompts WHERE name = ?').run(name);
  console.log(`Deleted prompt '${name}'`);
}

function confirm(question: string): Promise<boolean> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}
