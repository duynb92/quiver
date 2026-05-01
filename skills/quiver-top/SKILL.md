---
name: quiver-top
description: Show the most frequently used prompts
argument-hint: [number]
allowed-tools: Bash
---

You are helping the user see their most-used prompts.

## Steps

1. **Parse the optional number argument** (default: 10).

2. **Fetch top prompts**:
   ```bash
   quiver top <n> --json
   ```

3. **Format as a numbered list**:
   ```
   1. code-review (47 uses) — Code review prompt
   2. explain-code (35 uses) — Explain code section by section
   3. refactor-extract (23 uses) — Extract code into reusable functions
   ```

4. **If no prompts exist**, suggest: "Run `/quiver-save <name>` to save your first prompt."
