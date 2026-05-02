import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

declare const __VERSION__: string;

const PLUGIN_KEY = 'quiver@local';

interface InstalledPluginsJson {
  version: number;
  plugins: Record<string, Array<{
    scope: string;
    installPath: string;
    version: string;
    installedAt: string;
    lastUpdated: string;
  }>>;
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
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function copyDirRecursive(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

export function installSkillsCommand(options: { claude?: boolean; hooks?: boolean }): void {
  if (!options.claude) {
    console.error('Specify a target: --claude');
    process.exit(1);
  }

  const claudeDir = path.join(os.homedir(), '.claude');
  if (!fs.existsSync(claudeDir)) {
    console.error(
      `Claude Code config directory not found at ${claudeDir}. Is Claude Code installed?`
    );
    process.exit(1);
  }

  // Resolve skills source relative to this bundled file (dist/index.js → ../skills/).
  // In development (monorepo), skills live two levels up from dist/ — try both.
  const distDir = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.join(distDir, '../skills'),   // production: <pkg>/dist/ → <pkg>/skills/
    path.join(distDir, '../../skills'), // development: cli/dist/ → skills/
  ];
  const skillsSource = candidates.find((p) => fs.existsSync(p));
  if (!skillsSource) {
    console.error(
      `Skills directory not found (tried: ${candidates.join(', ')}). Try reinstalling @duynb92/quiver.`
    );
    process.exit(1);
  }
  const hooksSource = path.join(path.dirname(skillsSource), 'hooks/hooks.json');

  const version = __VERSION__;
  const installPath = path.join(claudeDir, 'plugins/cache/local/quiver', version);

  // Copy skills
  const skillsDest = path.join(installPath, 'skills');
  if (fs.existsSync(skillsDest)) {
    fs.rmSync(skillsDest, { recursive: true });
  }
  copyDirRecursive(skillsSource, skillsDest);

  // Write .claude-plugin/plugin.json
  const pluginManifest = {
    name: 'quiver',
    description: 'Save, search, and reuse prompts with template variables',
    version,
  };
  writeJson(path.join(installPath, '.claude-plugin/plugin.json'), pluginManifest);

  // Update installed_plugins.json
  const installedPluginsPath = path.join(claudeDir, 'plugins/installed_plugins.json');
  const installedPlugins = readJson<InstalledPluginsJson>(installedPluginsPath, {
    version: 2,
    plugins: {},
  });
  const now = new Date().toISOString();
  const existing = installedPlugins.plugins[PLUGIN_KEY]?.[0];
  installedPlugins.plugins[PLUGIN_KEY] = [
    {
      scope: 'user',
      installPath,
      version,
      installedAt: existing?.installedAt ?? now,
      lastUpdated: now,
    },
  ];
  writeJson(installedPluginsPath, installedPlugins);

  // Update settings.json enabledPlugins
  const settingsPath = path.join(claudeDir, 'settings.json');
  const settings = readJson<SettingsJson>(settingsPath, {});
  settings.enabledPlugins = { ...(settings.enabledPlugins ?? {}), [PLUGIN_KEY]: true };
  writeJson(settingsPath, settings);

  // Optionally install hooks
  if (options.hooks && fs.existsSync(hooksSource)) {
    const hooksDest = path.join(claudeDir, 'hooks/quiver.json');
    fs.mkdirSync(path.dirname(hooksDest), { recursive: true });
    fs.copyFileSync(hooksSource, hooksDest);
    console.log('Hooks installed.');
  }

  console.log(`Quiver skills installed for Claude Code (v${version}).`);
  console.log('Restart Claude Code to activate the /quiver-* commands.');
}
