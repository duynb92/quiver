import fs from 'fs';
import { getDb } from '../db/database.js';
import { getConfigPath, getDataDir, getDbPath } from '../utils/config.js';

export function initCommand(): void {
  const db = getDb();

  const configPath = getConfigPath();
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(
      configPath,
      JSON.stringify({ defaultCategory: 'general', editor: '$EDITOR' }, null, 2)
    );
  }

  const count = (db.prepare('SELECT COUNT(*) as n FROM prompts').get() as { n: number }).n;
  console.log(`Database initialized at: ${getDbPath()}`);
  console.log(`Data directory: ${getDataDir()}`);
  console.log(`Existing prompts: ${count}`);
}
