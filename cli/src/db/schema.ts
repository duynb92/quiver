export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS prompts (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  content     TEXT NOT NULL,
  description TEXT,
  category    TEXT DEFAULT 'general',
  tags        TEXT,
  variables   TEXT,
  use_count   INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE VIRTUAL TABLE IF NOT EXISTS prompts_fts USING fts5(
  name, content, description, tags, category,
  content='prompts', content_rowid='rowid'
);

CREATE TRIGGER IF NOT EXISTS prompts_ai AFTER INSERT ON prompts BEGIN
  INSERT INTO prompts_fts(rowid, name, content, description, tags, category)
  VALUES (new.rowid, new.name, new.content, new.description, new.tags, new.category);
END;

CREATE TRIGGER IF NOT EXISTS prompts_ad AFTER DELETE ON prompts BEGIN
  INSERT INTO prompts_fts(prompts_fts, rowid, name, content, description, tags, category)
  VALUES ('delete', old.rowid, old.name, old.content, old.description, old.tags, old.category);
END;

CREATE TRIGGER IF NOT EXISTS prompts_au AFTER UPDATE ON prompts BEGIN
  INSERT INTO prompts_fts(prompts_fts, rowid, name, content, description, tags, category)
  VALUES ('delete', old.rowid, old.name, old.content, old.description, old.tags, old.category);
  INSERT INTO prompts_fts(rowid, name, content, description, tags, category)
  VALUES (new.rowid, new.name, new.content, new.description, new.tags, new.category);
END;

CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_use_count ON prompts(use_count DESC);
`;
