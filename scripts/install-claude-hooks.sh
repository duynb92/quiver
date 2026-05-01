#!/bin/bash
# Installs hooks/hooks.json into .claude/settings.json for Claude Code integration.
# Safe to run multiple times — merges hooks without duplicating them.
set -e

HOOKS_FILE="$(cd "$(dirname "$0")/.." && pwd)/hooks/hooks.json"
SETTINGS_FILE=".claude/settings.json"

if [ ! -f "$HOOKS_FILE" ]; then
  echo "Error: hooks/hooks.json not found at $HOOKS_FILE"
  exit 1
fi

mkdir -p .claude

# If settings.json doesn't exist, create it with just the hooks block
if [ ! -f "$SETTINGS_FILE" ]; then
  echo "Creating $SETTINGS_FILE with hooks..."
  node -e "
    const hooks = require('$HOOKS_FILE').hooks;
    const settings = { hooks: {} };
    for (const [event, cmds] of Object.entries(hooks)) {
      settings.hooks[event] = cmds.map(c => ({
        matcher: '',
        hooks: [{ type: 'command', command: c.command }]
      }));
    }
    require('fs').writeFileSync('$SETTINGS_FILE', JSON.stringify(settings, null, 2) + '\n');
  "
  echo "Done. Hooks written to $SETTINGS_FILE"
  exit 0
fi

# Merge hooks into existing settings.json
echo "Merging hooks into existing $SETTINGS_FILE..."
node -e "
  const fs = require('fs');
  const hooks = require('$HOOKS_FILE').hooks;
  const settings = JSON.parse(fs.readFileSync('$SETTINGS_FILE', 'utf8'));
  if (!settings.hooks) settings.hooks = {};

  for (const [event, cmds] of Object.entries(hooks)) {
    if (!settings.hooks[event]) settings.hooks[event] = [];
    for (const cmd of cmds) {
      const entry = { matcher: '', hooks: [{ type: 'command', command: cmd.command }] };
      // Avoid duplicates by checking if command already registered
      const alreadyExists = settings.hooks[event].some(h =>
        h.hooks && h.hooks.some(hh => hh.command === cmd.command)
      );
      if (!alreadyExists) settings.hooks[event].push(entry);
    }
  }

  fs.writeFileSync('$SETTINGS_FILE', JSON.stringify(settings, null, 2) + '\n');
"
echo "Done. Hooks merged into $SETTINGS_FILE"
