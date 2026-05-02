import fs from 'fs';
import path from 'path';
import os from 'os';

const PLUGIN_KEY = 'quiver@local';

interface InstalledPluginsJson {
  version: number;
  plugins: Record<string, unknown>;
  [key: string]: unknown;
}

interface SettingsJson {
  enabledPlugins?: Record<string, boolean>;
  [key: string]: unknown;
}

function readJson<T>(filePath: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

function writeJson(filePath: string, data: unknown): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

export function uninstallSkillsCommand(options: { claude?: boolean }): void {
  if (!options.claude) {
    console.error('Specify a target: --claude');
    process.exit(1);
  }

  const claudeDir = path.join(os.homedir(), '.claude');
  const installedPluginsPath = path.join(claudeDir, 'plugins/installed_plugins.json');

  const installedPlugins = readJson<InstalledPluginsJson>(installedPluginsPath, {
    version: 2,
    plugins: {},
  });

  const entry = (installedPlugins.plugins[PLUGIN_KEY] as Array<{ installPath: string }> | undefined)?.[0];
  if (!entry) {
    console.log('Quiver skills are not installed.');
    process.exit(0);
  }

  // Remove install directory
  if (fs.existsSync(entry.installPath)) {
    fs.rmSync(entry.installPath, { recursive: true });
  }

  // Remove from installed_plugins.json
  delete installedPlugins.plugins[PLUGIN_KEY];
  writeJson(installedPluginsPath, installedPlugins);

  // Remove from settings.json enabledPlugins
  const settingsPath = path.join(claudeDir, 'settings.json');
  const settings = readJson<SettingsJson>(settingsPath, {});
  if (settings.enabledPlugins) {
    delete settings.enabledPlugins[PLUGIN_KEY];
    writeJson(settingsPath, settings);
  }

  // Remove hooks if present
  const hooksPath = path.join(claudeDir, 'hooks/quiver.json');
  if (fs.existsSync(hooksPath)) {
    fs.unlinkSync(hooksPath);
  }

  console.log('Quiver skills removed. Restart Claude Code to complete uninstall.');
}
