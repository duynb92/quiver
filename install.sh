#!/bin/bash
set -e

echo "Installing quiver..."

if ! command -v node &> /dev/null; then
  echo "Error: Node.js is required. Install from https://nodejs.org"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

npm install -g "$SCRIPT_DIR/cli"

quiver init


echo "Done! Run 'quiver --help' to get started."
