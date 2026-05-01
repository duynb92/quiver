import { program } from 'commander';
import { initCommand } from './commands/init.js';
import { saveCommand } from './commands/save.js';
import { loadCommand } from './commands/load.js';
import { searchCommand } from './commands/search.js';
import { listCommand } from './commands/list.js';
import { topCommand } from './commands/top.js';
import { showCommand } from './commands/show.js';
import { deleteCommand } from './commands/delete.js';

program
  .name('pm')
  .version('1.0.0')
  .description('Prompt manager CLI — save, search, and reuse prompts');

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

program.parse();
