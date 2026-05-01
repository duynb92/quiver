import type { TemplateVariable } from './parser.js';

export interface ExpandResult {
  text: string;
  warnings: string[];
}

export function expandTemplate(
  content: string,
  variables: TemplateVariable[],
  overrides: Record<string, string>
): ExpandResult {
  const warnings: string[] = [];
  const defaultMap = new Map(variables.map((v) => [v.name, v.default]));

  const text = content.replace(/\{\{([^}]+)\}\}/g, (_, raw: string) => {
    const colonIndex = raw.indexOf(':');
    const name = colonIndex === -1 ? raw.trim() : raw.slice(0, colonIndex).trim();
    const inlineDefault = colonIndex === -1 ? undefined : raw.slice(colonIndex + 1);

    if (name in overrides) return overrides[name];

    const storedDefault = defaultMap.get(name);
    if (storedDefault !== undefined && storedDefault !== '') return storedDefault;

    if (inlineDefault !== undefined && inlineDefault !== '') return inlineDefault;

    warnings.push(`Variable '{{${name}}}' has no value or default`);
    return '';
  });

  return { text, warnings };
}
