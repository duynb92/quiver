import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb, insertPrompt } from './helpers.js';
import { findByName } from '../src/search/ranker.js';
import { expandTemplate } from '../src/template/expander.js';
import type Database from 'better-sqlite3';
import type { Prompt } from '../src/types.js';
import type { TemplateVariable } from '../src/template/parser.js';

let db: Database.Database;

beforeEach(() => {
  db = createTestDb();
  insertPrompt(db, {
    name: 'code-review',
    content: 'Review this {{language:TypeScript}} code.',
    category: 'development',
    tags: 'review',
  });
});

describe('findByName', () => {
  it('finds prompt by exact name', () => {
    const p = findByName(db, 'code-review');
    expect(p).not.toBeNull();
    expect(p!.name).toBe('code-review');
  });

  it('finds prompt by prefix', () => {
    const p = findByName(db, 'code-rev');
    expect(p).not.toBeNull();
    expect(p!.name).toBe('code-review');
  });

  it('finds prompt by contains match', () => {
    const p = findByName(db, 'review');
    expect(p).not.toBeNull();
  });

  it('returns null for non-existent prompt', () => {
    const p = findByName(db, 'does-not-exist-xyz');
    expect(p).toBeNull();
  });
});

describe('load: use_count increment', () => {
  it('increments use_count on load', () => {
    const before = db.prepare('SELECT use_count FROM prompts WHERE name = ?').get('code-review') as { use_count: number };
    db.prepare('UPDATE prompts SET use_count = use_count + 1 WHERE name = ?').run('code-review');
    const after = db.prepare('SELECT use_count FROM prompts WHERE name = ?').get('code-review') as { use_count: number };
    expect(after.use_count).toBe(before.use_count + 1);
  });
});

describe('load: variable expansion', () => {
  it('expands variables with overrides', () => {
    const p = findByName(db, 'code-review')!;
    const vars: TemplateVariable[] = p.variables ? JSON.parse(p.variables) : [];
    const { text } = expandTemplate(p.content, vars, { language: 'Python' });
    expect(text).toBe('Review this Python code.');
  });

  it('uses defaults when no overrides provided', () => {
    const p = findByName(db, 'code-review')!;
    const vars: TemplateVariable[] = p.variables ? JSON.parse(p.variables) : [];
    const { text } = expandTemplate(p.content, vars, {});
    expect(text).toBe('Review this TypeScript code.');
  });
});
