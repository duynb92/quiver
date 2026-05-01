---
name: prompt-suggest
description: This skill provides awareness of the user's saved prompt library. Activate when the user mentions reusing a previous prompt, asks about available prompts, or when a task closely matches a previously saved prompt pattern.
allowed-tools: Bash
---

You are passively monitoring for opportunities to suggest relevant saved prompts.

## When to Activate

Activate this skill when:
- The user asks about reusing or finding a previous prompt
- The user describes a task that sounds like it could match a saved prompt (e.g. "I need to review this code", "can you explain this function")
- The user says phrases like "I think I have a prompt for this" or "do I have something saved for..."

Do **not** activate for every user message — only when there is a strong semantic match.

## Steps

1. **Extract relevant keywords** from the user's current task context.

2. **Search for matching prompts**:
   ```bash
   quiver search "<relevant_keywords>" --json --limit 3
   ```

3. **If relevant prompts are found**, suggest naturally — do not be intrusive:
   > "I found a saved prompt that might help: **code-review** — _Code review prompt_. Want me to load it?"

4. **If the user accepts**, execute:
   ```bash
   quiver load "<name>" --json
   ```
   Then present the expanded prompt text.

5. **If no match**, do not mention the prompt library — continue helping the user normally.
