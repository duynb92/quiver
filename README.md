# Quiver

**Save, search, and reuse prompts — without leaving your AI CLI.**

Quiver is a local-first prompt manager CLI that integrates directly into Claude Code as a plugin. Save prompts with template variables, search them instantly with full-text search, and load them with one command. Your most-used prompts float to the top automatically.

---

## Why Quiver?

If you use Claude Code daily, you've probably noticed you retype the same prompts constantly:

> "Review this code for security issues."  
> "Write tests for this function in TypeScript."  
> "Refactor this to use the repository pattern."

Quiver solves this. Save a prompt once, load it everywhere — with template variables that adapt it to each use.

---

## Features

- **Template variables** — `{{language:TypeScript}}` syntax with inline defaults
- **Full-text search** — FTS5-powered BM25 ranking across all prompt fields
- **Smart ranking** — frequently-used prompts surface above rarely-used ones
- **Claude Code plugin** — slash commands (`/quiver-save`, `/quiver-load`, etc.) built in
- **Import / export** — share prompt libraries as JSON or YAML
- **Tags and categories** — organize prompts however you like
- **Local-first** — all data in `~/.quiver/prompts.db`, no cloud, no accounts

---

## Installation

**Requirements**: Node.js 20+

```bash
# Clone and install
git clone https://github.com/duynb92/quiver.git
cd quiver
bash install.sh
```

The install script:
1. Installs the `quiver` CLI globally via npm
2. Initializes the local database at `~/.quiver/prompts.db`
3. Installs the Claude Code plugin

Verify the install:

```bash
quiver --version   # 1.0.0
quiver --help
```

### Install Claude Code Plugin Only

If you already have the CLI installed:

```bash
claude plugin install /path/to/quiver
```

---

## Quick Start

```bash
# Save your first prompt with template variables
quiver save code-review \
  --content "Review this {{language:TypeScript}} code for {{focus:security issues}}." \
  --tags "review,code-quality" \
  --category "development"

# Load it with defaults (no --set flags needed)
quiver load code-review

# Load with variable overrides
quiver load code-review --set language=Python --set focus="memory leaks"

# Search across all your prompts
quiver search "review"

# See your most-used prompts
quiver top 5
```

See [docs/template-variables.md](docs/template-variables.md) for the full variable syntax and [docs/commands.md](docs/commands.md) for all commands and options.

---

## Claude Code Plugin

Installing the plugin adds slash commands to Claude Code so you can manage prompts without leaving the conversation.

### Slash Commands

| Command | Description |
|---------|-------------|
| `/quiver-save <name> [content]` | Save a prompt; Claude asks for content if omitted |
| `/quiver-load <query>` | Load and expand a prompt; prompts for missing variables |
| `/quiver-search <query>` | Search prompts and display results as a table |
| `/quiver-list` | List all prompts |
| `/quiver-top [n]` | Show the most-used prompts |
| `/quiver-show <name>` | Show full prompt details |

### Auto-Suggestion

The `prompt-suggest` skill activates automatically when your current task closely matches a saved prompt. Claude will suggest it: *"I found a saved prompt that might help: **code-review** — want me to load it?"*

---

## Development

```bash
cd cli
npm install
npm run dev      # watch mode
npm test         # run tests
npm run build    # production build
npm run lint     # type check
```

### Project Structure

```
quiver/
├── cli/                    # Core CLI (TypeScript)
│   ├── src/
│   │   ├── commands/       # One file per command
│   │   ├── db/             # SQLite connection and schema
│   │   ├── search/         # FTS5 ranking logic
│   │   ├── template/       # {{variable}} parser and expander
│   │   └── utils/          # Config and output formatting
│   └── tests/
├── docs/
│   ├── commands.md         # Full command reference
│   ├── template-variables.md
│   └── data-storage.md
├── skills/                 # Claude Code slash command definitions
├── hooks/
│   └── hooks.json          # SessionStart hook
├── .claude-plugin/
│   └── plugin.json         # Claude Code plugin manifest
└── install.sh
```

## License

MIT — see [LICENSE](LICENSE).
