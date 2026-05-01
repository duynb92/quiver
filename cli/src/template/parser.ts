export interface TemplateVariable {
  name: string;
  default: string;
  description: string;
}

export function parseVariables(content: string): TemplateVariable[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const seen = new Set<string>();
  const variables: TemplateVariable[] = [];

  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    const colonIndex = match[1].indexOf(':');
    const name = colonIndex === -1 ? match[1].trim() : match[1].slice(0, colonIndex).trim();
    const defaultVal = colonIndex === -1 ? '' : match[1].slice(colonIndex + 1);

    if (!seen.has(name)) {
      seen.add(name);
      variables.push({ name, default: defaultVal, description: '' });
    }
  }

  return variables;
}
