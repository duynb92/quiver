# Command Reference

## `quiver init`

Initialize the database and config file. Safe to run multiple times.

```bash
quiver init
```

---

## `quiver save <name>`

Save a new prompt. Content can come from an inline string, a file, or stdin.

```bash
quiver save <name> [options]

Options:
  --content <text>        Inline prompt content
  --file <path>           Read content from a file
  --stdin                 Read content from stdin
  --tags <t1,t2>          Comma-separated tags
  --category <category>   Category name (default: general)
  --description <desc>    Short description
  --var <name=default>    Override a variable default (repeatable)
  --json                  Output result as JSON
```

**Examples:**

```bash
# Inline content
quiver save debug-error --content "Debug this error: {{error}}. Language: {{language:Python}}."

# From a file
quiver save long-prompt --file ./my-prompt.txt --tags "writing"

# From stdin
cat prompt.txt | quiver save piped-prompt --stdin

# With metadata
quiver save refactor \
  --content "Refactor this {{language:TypeScript}} code to use {{pattern:the repository pattern}}." \
  --tags "refactor,architecture" \
  --category "development" \
  --description "General-purpose refactoring prompt"
```

---

## `quiver load <query>`

Load a prompt and expand its template variables.

```bash
quiver load <query> [options]

Options:
  --set <var=value>   Override a variable (repeatable)
  --raw               Return raw content without variable expansion
  --json              Output as JSON (includes original, expanded, variables, warnings)
```

**Lookup order**: exact name → name prefix → name contains → full-text search

```bash
# Load by exact name
quiver load code-review

# Load by partial name (prefix match)
quiver load code   # matches "code-review"

# Override variables
quiver load code-review --set language=Go --set focus="performance"

# Raw content (no expansion)
quiver load code-review --raw

# Machine-readable output
quiver load code-review --json
```

---

## `quiver search <query>`

Full-text search across all prompts. Results are ranked by relevance + usage frequency.

```bash
quiver search <query> [options]

Options:
  --tag <tag>           Filter by tag
  --category <cat>      Filter by category
  --limit <n>           Max results (default: 20)
  --json                Output as JSON
```

```bash
quiver search "refactor"
quiver search "review" --tag code-quality
quiver search "explain" --category learning --limit 5
```

---

## `quiver list`

List all prompts, sorted by usage frequency.

```bash
quiver list [options]

Options:
  --category <cat>   Filter by category
  --tag <tag>        Filter by tag
  --limit <n>        Max results (default: 50)
  --sort <field>     Sort field (default: use_count)
  --json             Output as JSON
```

---

## `quiver top [n]`

Show the N most-used prompts (default: 10).

```bash
quiver top
quiver top 5
quiver top 20 --json
```

---

## `quiver show <name>`

Show full details of a prompt: content, variables, tags, category, use count.

```bash
quiver show code-review
quiver show code-review --json
```

---

## `quiver edit <name>`

Open a prompt in `$EDITOR`. Variables are re-detected after editing.

```bash
quiver edit code-review
```

---

## `quiver delete <name>`

Delete a prompt. Prompts for confirmation unless `--force` is passed.

```bash
quiver delete old-prompt
quiver delete old-prompt --force
```

---

## `quiver export`

Export prompts to JSON or YAML for sharing or backup.

```bash
quiver export [options]

Options:
  --format <fmt>      json or yaml (default: json)
  --category <cat>    Filter by category
  --tag <tag>         Filter by tag
  --output <file>     Write to file instead of stdout
```

```bash
# Export everything to stdout
quiver export

# Export to file
quiver export --output backup.json

# Export specific category as YAML
quiver export --format yaml --category development --output dev-prompts.yaml
```

---

## `quiver import <file>`

Import prompts from a JSON or YAML file. Format is auto-detected from the file extension.

```bash
quiver import <file> [options]

Options:
  --overwrite   Overwrite existing prompts with the same name
  --dry-run     Preview what would happen without writing
```

```bash
quiver import backup.json
quiver import dev-prompts.yaml --overwrite
quiver import shared-prompts.json --dry-run
```

---

## `quiver tags`

List all tags with prompt counts.

```bash
quiver tags
quiver tags --json
```

---

## `quiver categories`

List all categories with prompt counts.

```bash
quiver categories
quiver categories --json
```

---

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Not found |
| 2 | User error (invalid arguments) |
| 3 | System error |

All commands support `--json` for machine-readable output.
