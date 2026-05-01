#!/bin/bash
set -e

echo "Installing quiver..."

if ! command -v node &> /dev/null; then
  echo "Error: Node.js is required. Install from https://nodejs.org"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLUGIN_NAME="quiver"
PLUGIN_ID="quiver@local"
CLAUDE_DIR="$HOME/.claude"

npm install -g "$SCRIPT_DIR/cli"

quiver init

# Install Claude Code plugin if claude is available
if [ -d "$CLAUDE_DIR" ]; then
  echo "Installing Claude Code plugin..."

  # Copy plugin files into the plugins cache
  INSTALL_PATH="$CLAUDE_DIR/plugins/cache/local/$PLUGIN_NAME/1.0.0"
  mkdir -p "$INSTALL_PATH"
  cp -r "$SCRIPT_DIR/.claude-plugin" "$INSTALL_PATH/"
  cp -r "$SCRIPT_DIR/skills" "$INSTALL_PATH/"

  # Register the plugin in installed_plugins.json
  INSTALLED_JSON="$CLAUDE_DIR/plugins/installed_plugins.json"
  INSTALLED_AT="$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")"

  if command -v python3 &> /dev/null; then
    python3 - <<PYEOF
import json, sys

path = "$INSTALLED_JSON"
with open(path) as f:
    data = json.load(f)

entry = {
    "scope": "user",
    "installPath": "$INSTALL_PATH",
    "version": "1.0.0",
    "installedAt": "$INSTALLED_AT",
    "lastUpdated": "$INSTALLED_AT"
}

data.setdefault("plugins", {})["$PLUGIN_ID"] = [entry]

with open(path, "w") as f:
    json.dump(data, f, indent=2)
    f.write("\n")
PYEOF
  else
    echo "Warning: python3 not found — skipping installed_plugins.json update."
  fi

  # Enable plugin in settings.json
  SETTINGS_JSON="$CLAUDE_DIR/settings.json"
  if command -v python3 &> /dev/null && [ -f "$SETTINGS_JSON" ]; then
    python3 - <<PYEOF
import json

path = "$SETTINGS_JSON"
with open(path) as f:
    cfg = json.load(f)

cfg.setdefault("enabledPlugins", {})["$PLUGIN_ID"] = True

with open(path, "w") as f:
    json.dump(cfg, f, indent=2)
    f.write("\n")
PYEOF
    echo "Plugin enabled in $SETTINGS_JSON"
  fi

  echo "Claude Code plugin installed. Restart Claude Code to activate /quiver-* commands."
else
  echo "Claude Code not detected — skipping plugin installation."
  echo "To install manually, copy the skills/ directory to ~/.claude/skills/"
fi

echo "Done! Run 'quiver --help' to get started."
