import os from 'os';
import path from 'path';

export function getDataDir(): string {
  return path.join(os.homedir(), '.quiver');
}

export function getDbPath(): string {
  return path.join(getDataDir(), 'prompts.db');
}

export function getConfigPath(): string {
  return path.join(getDataDir(), 'config.json');
}
