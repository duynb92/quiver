---
name: quiver-search
description: Search saved prompts by keyword, tag, or category
argument-hint: <query> [--tag <tag>] [--category <cat>]
allowed-tools: Bash
---

You are helping the user search their saved prompt library.

## Steps

1. **Parse the argument** for the query string and any `--tag` or `--category` flags.

2. **Run the search**:
   ```bash
   quiver search "<query>" [--tag "<tag>"] [--category "<cat>"] --json
   ```

3. **Parse the JSON results** and format as a markdown table:

   | # | Name | Category | Tags | Uses | Preview |
   |---|------|----------|------|------|---------|
   | 1 | code-review | development | review, quality | 47 | Review this {{language}}... |

   Truncate the Preview column to ~50 characters.

4. **If no results**:
   - Suggest broadening the search (e.g. remove tag/category filters).
   - Offer to run `quiver list --json` to show all available prompts.
