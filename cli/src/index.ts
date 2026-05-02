import { program } from 'commander';

declare const __VERSION__: string;
import { initCommand } from './commands/init.js';
import { saveCommand } from './commands/save.js';
import { loadCommand } from './commands/load.js';
import { searchCommand } from './commands/search.js';
import { listCommand } from './commands/list.js';
import { topCommand } from './commands/top.js';
import { showCommand } from './commands/show.js';
import { deleteCommand } from './commands/delete.js';
import { exportCommand } from './commands/export-cmd.js';
import { importCommand } from './commands/import-cmd.js';
import { editCommand } from './commands/edit.js';
import { tagsCommand } from './commands/tags.js';
import { categoriesCommand } from './commands/categories.js';
import { installSkillsCommand } from './commands/install-skills.js';
import { uninstallSkillsCommand } from './commands/uninstall-skills.js';

program
  .name('quiver')
  .version(__VERSION__)
  .description('Quiver — save, search, and reuse prompts');

program
  .command('init')
  .description('Initialize database and config')
  .action(initCommand);

program
  .command('save <name>')
  .description('Save a new prompt')
  .option('--content <text>', 'Prompt content inline')
  .option('--file <path>', 'Read content from file')
  .option('--stdin', 'Read content from stdin')
  .option('--tags <tags>', 'Comma-separated tags')
  .option('--category <category>', 'Category name')
  .option('--description <desc>', 'Short description')
  .option('--var <name=default>', 'Variable default (repeatable)', (v, acc: string[]) => [...acc, v], [] as string[])
  .option('--json', 'Output as JSON')
  .action(saveCommand);

program
  .command('load <query>')
  .description('Load and expand a prompt')
  .option('--set <var=value>', 'Override a variable (repeatable)', (v, acc: string[]) => [...acc, v], [] as string[])
  .option('--raw', 'No variable expansion')
  .option('--json', 'Output as JSON')
  .action(loadCommand);

program
  .command('search <query>')
  .description('Full-text search across all prompts')
  .option('--tag <tag>', 'Filter by tag')
  .option('--category <category>', 'Filter by category')
  .option('--limit <n>', 'Max results (default: 20)')
  .option('--json', 'Output as JSON')
  .action(searchCommand);

program
  .command('list')
  .description('List all prompts sorted by usage frequency')
  .option('--category <category>', 'Filter by category')
  .option('--tag <tag>', 'Filter by tag')
  .option('--limit <n>', 'Max results (default: 50)')
  .option('--json', 'Output as JSON')
  .option('--sort <field>', 'Sort field (default: use_count)')
  .action(listCommand);

program
  .command('top [n]')
  .description('Show top N most-used prompts (default: 10)')
  .option('--json', 'Output as JSON')
  .action(topCommand);

program
  .command('show <name>')
  .description('Show full prompt details')
  .option('--json', 'Output as JSON')
  .action(showCommand);

program
  .command('delete <name>')
  .description('Delete a prompt')
  .option('--force', 'Skip confirmation')
  .action(deleteCommand);

program
  .command('export')
  .description('Export prompts to JSON or YAML')
  .option('--format <fmt>', 'Output format: json or yaml (default: json)')
  .option('--category <category>', 'Filter by category')
  .option('--tag <tag>', 'Filter by tag')
  .option('--output <file>', 'Write to file instead of stdout')
  .action(exportCommand);

program
  .command('import <file>')
  .description('Import prompts from a JSON or YAML file')
  .option('--overwrite', 'Overwrite existing prompts with same name')
  .option('--dry-run', 'Preview changes without writing')
  .action(importCommand);

program
  .command('edit <name>')
  .description('Open a prompt in $EDITOR')
  .action(editCommand);

program
  .command('tags')
  .description('List all tags with prompt counts')
  .option('--json', 'Output as JSON')
  .action(tagsCommand);

program
  .command('categories')
  .description('List all categories with prompt counts')
  .option('--json', 'Output as JSON')
  .action(categoriesCommand);

program
  .command('install-skills')
  .description('Install Quiver skills into an AI coding assistant')
  .option('--claude', 'Install skills for Claude Code')
  .option('--hooks', 'Also install session hooks')
  .action(installSkillsCommand);

program
  .command('uninstall-skills')
  .description('Remove Quiver skills from an AI coding assistant')
  .option('--claude', 'Remove skills from Claude Code')
  .action(uninstallSkillsCommand);

program.parse();
