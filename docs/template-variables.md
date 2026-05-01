# Template Variables

Quiver uses a `{{variable}}` syntax for reusable placeholders.

## Syntax

```
{{variable_name}}              # required — warns if no value at load time
{{variable_name:default}}      # optional — uses default if no --set flag provided
```

## Example

Save a prompt with variables:

```bash
quiver save explain-code \
  --content "Explain this {{language:TypeScript}} code. Use {{style:simple}} language. Focus on {{aspect:the overall structure}}." \
  --category "learning"
```

Load with all defaults:

```bash
quiver load explain-code
# → Explain this TypeScript code. Use simple language. Focus on the overall structure.
```

Load with overrides:

```bash
quiver load explain-code --set language=Rust --set style=technical
# → Explain this Rust code. Use technical language. Focus on the overall structure.
```

Variables are **auto-detected** when you save — no need to declare them separately. Quiver parses `{{...}}` patterns and stores them with their defaults.

## Resolution Priority

When loading a prompt, variables are resolved in this order (highest to lowest):

1. `--set` flags passed at load time
2. Stored defaults from when the prompt was saved
3. Inline defaults in the template (`{{var:default}}`)
4. Empty string — triggers a warning
