#!/bin/bash
# End-to-end verification script for the quiver Claude Code plugin.
# Run this after: cd cli && npm run build && npm link
# And after: bash scripts/install-claude-hooks.sh  (for hook registration)
set -e

PASS=0
FAIL=0

ok() { echo "  [PASS] $1"; PASS=$((PASS + 1)); }
fail() { echo "  [FAIL] $1"; FAIL=$((FAIL + 1)); }

require_cmd() {
  if ! command -v "$1" &>/dev/null; then
    echo "Error: '$1' not found. $2"
    exit 1
  fi
}

require_cmd quiver "Build and link the CLI first: cd cli && npm run build && npm link"
require_cmd jq "Install jq for JSON validation: brew install jq"

echo ""
echo "=== Quiver — End-to-End Plugin Test ==="
echo ""

# --- Setup: clean state ---
echo "--- Setup ---"
rm -f ~/.quiver/prompts.db
quiver init >/dev/null 2>&1 && ok "quiver init creates database" || fail "quiver init failed"

# --- quiver save ---
echo ""
echo "--- quiver save ---"
quiver save "code-review" \
  --content "Review this {{language:TypeScript}} code for {{review_type:security}} issues. Focus on {{framework}} specific patterns." \
  --tags "review,code-quality" \
  --category "development" \
  --description "Code review prompt" \
  --json | jq . >/dev/null && ok "quiver save code-review (JSON valid)" || fail "quiver save code-review"

quiver save "explain-code" \
  --content "Explain this code section by section. Use {{detail_level:simple}} language." \
  --tags "explain,learning" \
  --category "development" \
  --json | jq . >/dev/null && ok "quiver save explain-code (JSON valid)" || fail "quiver save explain-code"

# Duplicate name should fail with exit code 2
if quiver save "code-review" --content "duplicate" 2>/dev/null; then
  fail "quiver save duplicate should fail"
else
  ok "quiver save duplicate rejected (exit code $?)"
fi

# --- quiver show ---
echo ""
echo "--- quiver show ---"
quiver show "code-review" --json | jq -e '.name == "code-review"' >/dev/null && ok "quiver show returns correct prompt" || fail "quiver show failed"
quiver show "nonexistent-prompt" 2>/dev/null; [ $? -eq 1 ] && ok "quiver show nonexistent exits 1" || fail "quiver show nonexistent wrong exit code"

# --- quiver load ---
echo ""
echo "--- quiver load ---"
EXPANDED=$(quiver load "code-review" --set "language=Python" --set "framework=Django" --json)
echo "$EXPANDED" | jq . >/dev/null && ok "quiver load --json is valid JSON" || fail "quiver load JSON invalid"
echo "$EXPANDED" | jq -e '.expanded | contains("Python")' >/dev/null && ok "quiver load variable expansion (language=Python)" || fail "quiver load language variable not expanded"
echo "$EXPANDED" | jq -e '.expanded | contains("Django")' >/dev/null && ok "quiver load variable expansion (framework=Django)" || fail "quiver load framework variable not expanded"

# Verify use_count incremented
USE_COUNT=$(quiver show "code-review" --json | jq -r '.use_count')
[ "$USE_COUNT" -ge 1 ] && ok "quiver load increments use_count (now $USE_COUNT)" || fail "quiver load did not increment use_count"

quiver load "nonexistent-prompt" 2>/dev/null; [ $? -eq 1 ] && ok "quiver load nonexistent exits 1" || fail "quiver load nonexistent wrong exit code"

# --- quiver search ---
echo ""
echo "--- quiver search ---"
RESULTS=$(quiver search "review" --json)
echo "$RESULTS" | jq . >/dev/null && ok "quiver search --json is valid JSON" || fail "quiver search JSON invalid"
echo "$RESULTS" | jq -e 'length >= 1' >/dev/null && ok "quiver search returns results" || fail "quiver search returned no results"

quiver search "review" --category "development" --json | jq -e 'length >= 1' >/dev/null && ok "quiver search --category filter works" || fail "quiver search --category filter failed"
quiver search "review" --tag "review" --json | jq -e 'length >= 1' >/dev/null && ok "quiver search --tag filter works" || fail "quiver search --tag filter failed"

# --- quiver list ---
echo ""
echo "--- quiver list ---"
quiver list --json | jq -e 'length >= 2' >/dev/null && ok "quiver list returns all prompts" || fail "quiver list missing prompts"
quiver list --category "development" --json | jq -e 'length >= 1' >/dev/null && ok "quiver list --category filter works" || fail "quiver list --category filter failed"

# --- quiver top ---
echo ""
echo "--- quiver top ---"
quiver top 5 --json | jq -e 'length >= 1' >/dev/null && ok "quiver top returns prompts" || fail "quiver top failed"
quiver top 5 --json | jq . >/dev/null && ok "quiver top --json is valid JSON" || fail "quiver top JSON invalid"

# --- quiver delete ---
echo ""
echo "--- quiver delete ---"
quiver delete "explain-code" --force && ok "quiver delete --force works" || fail "quiver delete failed"
quiver show "explain-code" 2>/dev/null; [ $? -eq 1 ] && ok "deleted prompt is gone" || fail "deleted prompt still exists"

# --- Summary ---
echo ""
echo "=== Results ==="
echo "  Passed: $PASS"
echo "  Failed: $FAIL"
echo ""

if [ $FAIL -gt 0 ]; then
  echo "Some tests failed. Check output above."
  exit 1
else
  echo "All tests passed!"
  echo ""
  echo "Next steps for Claude Code plugin verification:"
  echo "  1. claude plugin install ./"
  echo "  2. Test /quiver-save, /quiver-load, /quiver-search, /quiver-list, /quiver-top, /quiver-show in Claude Code"
  echo "  3. Restart Claude Code session — verify SessionStart hook fires (quiver top 5 output visible)"
  exit 0
fi
