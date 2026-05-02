#!/bin/bash
set -e

echo "Installing Quiver..."

# Check Node.js
if ! command -v node &>/dev/null; then
  echo "Error: Node.js >= 20 is required. See https://nodejs.org"
  exit 1
fi

NODE_MAJOR=$(node -e "process.stdout.write(process.versions.node.split('.')[0])")
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "Error: Node.js >= 20 required (found $(node --version))"
  exit 1
fi

# Install CLI from npm
npm install -g @duynb/quiver

# Initialize database
quiver init

# Offer Claude Code skill install
if command -v claude &>/dev/null && [ -d "$HOME/.claude" ]; then
  echo ""
  # Use /dev/tty so this works when piped via curl | bash
  read -r -p "Claude Code detected. Install Quiver skills? [Y/n] " response </dev/tty
  response="${response:-Y}"
  if [[ "$response" =~ ^[Yy]$ ]]; then
    quiver install-skills --claude
  fi
fi

echo ""
echo "Done! Run 'quiver --help' to get started."
