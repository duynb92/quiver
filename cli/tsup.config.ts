import { defineConfig } from 'tsup';
import { readFileSync } from 'fs';

const { version } = JSON.parse(readFileSync('./package.json', 'utf8')) as { version: string };

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node20',
  banner: {
    js: '#!/usr/bin/env node',
  },
  define: {
    __VERSION__: JSON.stringify(version),
  },
  clean: true,
  splitting: false,
});
