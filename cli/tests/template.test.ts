import { describe, it, expect } from 'vitest';
import { parseVariables } from '../src/template/parser.js';
import { expandTemplate } from '../src/template/expander.js';

describe('parseVariables', () => {
  it('returns empty array for empty string', () => {
    expect(parseVariables('')).toEqual([]);
  });

  it('returns empty array for content without variables', () => {
    expect(parseVariables('Hello world')).toEqual([]);
  });

  it('extracts a single variable with no default', () => {
    const vars = parseVariables('Hello {{name}}');
    expect(vars).toHaveLength(1);
    expect(vars[0]).toMatchObject({ name: 'name', default: '' });
  });

  it('extracts a variable with a default value', () => {
    const vars = parseVariables('Hello {{lang:TypeScript}}');
    expect(vars).toHaveLength(1);
    expect(vars[0]).toMatchObject({ name: 'lang', default: 'TypeScript' });
  });

  it('extracts multiple variables', () => {
    const vars = parseVariables('{{lang:TypeScript}} {{framework}}');
    expect(vars).toHaveLength(2);
    expect(vars[0]).toMatchObject({ name: 'lang', default: 'TypeScript' });
    expect(vars[1]).toMatchObject({ name: 'framework', default: '' });
  });

  it('deduplicates repeated variables', () => {
    const vars = parseVariables('{{name}} and {{name}} again');
    expect(vars).toHaveLength(1);
    expect(vars[0].name).toBe('name');
  });

  it('handles colons in default values', () => {
    const vars = parseVariables('{{url:http://example.com}}');
    expect(vars).toHaveLength(1);
    expect(vars[0]).toMatchObject({ name: 'url', default: 'http://example.com' });
  });
});

describe('expandTemplate', () => {
  it('expands using stored defaults when no overrides', () => {
    const vars = [{ name: 'name', default: 'World', description: '' }];
    const result = expandTemplate('Hello {{name:World}}', vars, {});
    expect(result.text).toBe('Hello World');
    expect(result.warnings).toHaveLength(0);
  });

  it('overrides take priority over defaults', () => {
    const vars = [{ name: 'name', default: 'World', description: '' }];
    const result = expandTemplate('Hello {{name:World}}', vars, { name: 'Claude' });
    expect(result.text).toBe('Hello Claude');
    expect(result.warnings).toHaveLength(0);
  });

  it('warns when variable has no value or default', () => {
    const vars = [{ name: 'name', default: '', description: '' }];
    const result = expandTemplate('Hello {{name}}', vars, {});
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain('name');
    expect(result.text).toBe('Hello ');
  });

  it('handles mix of overrides and defaults', () => {
    const vars = [
      { name: 'lang', default: 'TypeScript', description: '' },
      { name: 'framework', default: '', description: '' },
    ];
    const result = expandTemplate('{{lang}} with {{framework}}', vars, { framework: 'React' });
    expect(result.text).toBe('TypeScript with React');
    expect(result.warnings).toHaveLength(0);
  });
});
