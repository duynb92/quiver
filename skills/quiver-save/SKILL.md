---
name: quiver-save
description: Save a prompt for later reuse with optional tags, category, and template variables
argument-hint: <name> [prompt content]
allowed-tools: Bash, Read, AskUserQuestion
---

You are helping the user save a prompt to their local prompt library.

## Steps

1. **Parse the argument**: the first word is the prompt `name`, everything after is `content`.

2. **If no content was provided in the argument**, ask the user for it:
   > "What's the prompt content? (Tip: use `{{variable}}` or `{{variable:default}}` for template variables)"

3. **Save the prompt** by running:
   ```bash
   quiver save "<name>" --content "<content>" --json
   ```

4. **Parse the JSON response**:
   - On success: confirm the save with name, category, and tag info.
   - If exit code 2 and message says "already exists": tell the user and suggest `quiver edit <name>`.

5. **If variables were auto-detected** (the JSON response includes a non-empty `variables` array), list them clearly:
   ```
   Detected template variables:
   - language (default: TypeScript)
   - framework (no default)
   ```

6. **Optionally enrich metadata**: ask the user if they want to add tags, a category, or a description. If yes, re-run:
   ```bash
   quiver save "<name>" --content "<content>" --tags "<tags>" --category "<cat>" --description "<desc>" --json
   ```
   (Note: this will fail with "already exists" — instead use a DELETE + re-save approach if needed, or inform the user that `quiver edit` handles updates.)

7. **Present final confirmation** with a summary: name, variable count, tags, category.
