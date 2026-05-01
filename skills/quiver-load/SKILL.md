---
name: quiver-load
description: Load and expand a saved prompt, with optional variable overrides
argument-hint: <search query> [--set var=value ...]
allowed-tools: Bash, AskUserQuestion
---

You are helping the user load and expand a saved prompt from their local prompt library.

## Steps

1. **Parse the argument** for the query string and any `--set key=value` flags.

2. **Load the prompt**:
   ```bash
   quiver load "<query>" [--set "var=value" ...] --json
   ```

3. **If the command fails (exit code 1 — not found)**:
   - Run a fallback search:
     ```bash
     quiver search "<query>" --json --limit 5
     ```
   - If results are found, present them and ask the user to pick one (use the selected name to re-run step 2).
   - If no results, inform the user: "No prompts matching `<query>` were found."

4. **If the response includes warnings** (unset variables with no default):
   - Ask the user for values for each missing variable.
   - Re-run `quiver load` with the additional `--set` flags.

5. **Present the expanded prompt text** clearly, formatted as a markdown code block or quoted block.

6. **Tell the user** the prompt is ready to use — they can copy it or continue the conversation using its content directly.
