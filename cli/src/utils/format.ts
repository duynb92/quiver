import type { Prompt } from '../types.js';
import type { TemplateVariable } from '../template/parser.js';

interface Column {
  key: string;
  label: string;
  width?: number;
}

export function formatTable(rows: Record<string, unknown>[], columns: Column[]): string {
  if (rows.length === 0) return '(no results)';

  const widths = columns.map((col) => {
    const maxData = Math.max(...rows.map((r) => String(r[col.key] ?? '').length));
    return col.width ?? Math.max(col.label.length, maxData);
  });

  const header = columns.map((col, i) => col.label.padEnd(widths[i])).join('  ');
  const divider = widths.map((w) => '-'.repeat(w)).join('  ');

  const dataRows = rows.map((row) =>
    columns
      .map((col, i) => {
        let val = String(row[col.key] ?? '');
        if (col.width && val.length > col.width) val = val.slice(0, col.width - 3) + '...';
        return val.padEnd(widths[i]);
      })
      .join('  ')
  );

  return [header, divider, ...dataRows].join('\n');
}

export function formatPromptDetail(prompt: Prompt): string {
  const variables: TemplateVariable[] = prompt.variables ? JSON.parse(prompt.variables) : [];
  const varStr =
    variables.length === 0
      ? 'none'
      : variables
          .map((v) => `${v.name}${v.default ? ` (default: ${v.default})` : ' (no default)'}`)
          .join(', ');

  return [
    `Name:      ${prompt.name}`,
    `Category:  ${prompt.category}`,
    `Tags:      ${prompt.tags ?? 'none'}`,
    `Uses:      ${prompt.use_count}`,
    `Created:   ${prompt.created_at.slice(0, 10)}`,
    `Variables: ${varStr}`,
    prompt.description ? `\nDescription: ${prompt.description}` : '',
    '---',
    prompt.content,
  ]
    .filter((line) => line !== '')
    .join('\n');
}

export function outputResult(data: unknown, json: boolean): void {
  if (json) {
    console.log(JSON.stringify(data, null, 2));
  }
}
