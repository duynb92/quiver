# Data Storage

All data lives locally at `~/.quiver/`:

```
~/.quiver/
├── prompts.db    # SQLite database (all prompts and metadata)
└── config.json   # Settings (editor, default category)
```

**Backup**: copy `~/.quiver/prompts.db` — that's everything.  
**Migrate**: use `quiver export` on the old machine and `quiver import` on the new one.

## Database Details

- Engine: SQLite with FTS5 full-text search
- IDs: 12-character nanoid
- Writes: WAL mode for concurrent-safe access

## Schema Overview

```sql
CREATE TABLE prompts (
  id          TEXT PRIMARY KEY,      -- nanoid, 12 chars
  name        TEXT NOT NULL UNIQUE,
  content     TEXT NOT NULL,
  description TEXT,
  category    TEXT DEFAULT 'general',
  tags        TEXT,                  -- comma-separated: "refactor,python"
  variables   TEXT,                  -- JSON array of {name, default, description}
  use_count   INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);
```

Full-text search is powered by an FTS5 virtual table that indexes `name`, `content`, `description`, `tags`, and `category`, kept in sync via triggers.
