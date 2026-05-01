#!/bin/bash
# Shared shell helper functions used by quiver skills and scripts.

# Check that the quiver CLI is installed and reachable on PATH.
check_quiver_installed() {
  if ! command -v quiver &>/dev/null; then
    echo "Error: 'quiver' CLI not found on PATH." >&2
    echo "Install it with: npm install -g quiver" >&2
    echo "Or link it locally: cd cli && npm link" >&2
    return 1
  fi
}

# Print a consistent error message to stderr.
# Usage: quiver_error "Something went wrong"
quiver_error() {
  echo "Error: $1" >&2
}

# Safely escape a string for use as a shell argument.
# Usage: escaped=$(quiver_escape_arg "value with spaces")
quiver_escape_arg() {
  printf '%s' "$1" | sed "s/'/'\\\\''/g; s/^/'/; s/$/'/"
}
