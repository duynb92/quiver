---
name: quiver-list
description: List all saved prompts, sorted by usage frequency
argument-hint: [--category <cat>] [--tag <tag>]
allowed-tools: Bash
---

You are helping the user list all their saved prompts.

## Steps

1. **Parse the argument** for any `--category` or `--tag` filter flags.

2. **Fetch the list**:
   ```bash
   quiver list [--category "<cat>"] [--tag "<tag>"] --json
   ```

3. **Format results as a markdown table**:

   | # | Name | Category | Tags | Uses | Description |
   |---|------|----------|------|------|-------------|
   | 1 | code-review | development | review, quality | 47 | Code review prompt |

4. **Include total count** at the bottom: `Total: N prompts`

5. **If no prompts exist**, suggest: "Run `/quiver-save <name>` to save your first prompt."
