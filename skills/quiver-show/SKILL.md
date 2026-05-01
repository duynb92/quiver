---
name: quiver-show
description: Show full details of a saved prompt
argument-hint: <name>
allowed-tools: Bash
---

You are helping the user view the full details of a saved prompt.

## Steps

1. **Run the show command**:
   ```bash
   quiver show "<name>" --json
   ```

2. **If not found (exit code 1)**, inform the user and suggest running `/quiver-search <name>` to find similar prompts.

3. **Format the full prompt detail** as:
   ```
   **Name**: code-review
   **Category**: development
   **Tags**: review, quality
   **Uses**: 47
   **Created**: 2025-01-15
   **Variables**:
     - language (default: TypeScript)
     - framework (no default)

   ---
   Review this {{language:TypeScript}} code for {{review_type:security}} issues.
   Focus on {{framework}} specific patterns.
   ```

4. **Offer next steps**: suggest `/quiver-load <name>` to expand the prompt with variable values.
