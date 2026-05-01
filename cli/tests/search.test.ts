import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDb, insertPrompt } from './helpers.js';
import { searchPrompts } from '../src/search/ranker.js';
import type Database from 'better-sqlite3';

let db: Database.Database;

beforeEach(() => {
  db = createTestDb();
  insertPrompt(db, {
    name: 'code-review',
    content: 'Review this TypeScript code for security issues.',
    category: 'development',
    tags: 'review,quality',
    use_count: 10,
  });
  insertPrompt(db, {
    name: 'write-tests',
    content: 'Generate unit tests for this code.',
    category: 'development',
    tags: 'testing,quality',
    use_count: 5,
  });
  insertPrompt(db, {
    name: 'summarize',
    content: 'Summarize the following text in 3 sentences.',
    category: 'writing',
    tags: 'summary',
    use_count: 2,
  });
});

describe('searchPrompts', () => {
  it('returns results for a matching query', () => {
    const results = searchPrompts(db, 'code');
    expect(results.length).toBeGreaterThan(0);
  });

  it('filters by tag', () => {
    const results = searchPrompts(db, 'code', { tag: 'review' });
    expect(results.every((r) => r.tags?.includes('review'))).toBe(true);
  });

  it('filters by category', () => {
    const results = searchPrompts(db, 'text', { category: 'writing' });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => r.category === 'writing')).toBe(true);
  });

  it('respects limit option', () => {
    const results = searchPrompts(db, 'code', { limit: 1 });
    expect(results.length).toBeLessThanOrEqual(1);
  });
});
