import { describe, it, expect, beforeEach } from 'vitest';
import { nanoid } from 'nanoid';
import { createTestDb, insertPrompt } from './helpers.js';
import { parseVariables } from '../src/template/parser.js';
import type Database from 'better-sqlite3';
import type { Prompt } from '../src/types.js';

let db: Database.Database;

beforeEach(() => {
  db = createTestDb();
});

describe('save (database layer)', () => {
  it('saves a prompt and retrieves it', () => {
    const p = insertPrompt(db, { name: 'test', content: 'Hello world' });
    expect(p.name).toBe('test');
    expect(p.content).toBe('Hello world');
  });

  it('auto-detects variables on save', () => {
    const content = 'Hello {{name:World}}';
    const vars = parseVariables(content);
    const p = insertPrompt(db, { name: 'var-test', content, variables: JSON.stringify(vars) });
    const parsed = JSON.parse(p.variables!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toMatchObject({ name: 'name', default: 'World' });
  });

  it('rejects duplicate names', () => {
    insertPrompt(db, { name: 'dup', content: 'first' });
    expect(() => insertPrompt(db, { name: 'dup', content: 'second' })).toThrow();
  });

  it('saves with category and tags', () => {
    const p = insertPrompt(db, {
      name: 'tagged',
      content: 'Tagged prompt',
      category: 'development',
      tags: 'test,quality',
    });
    expect(p.category).toBe('development');
    expect(p.tags).toBe('test,quality');
  });
});
