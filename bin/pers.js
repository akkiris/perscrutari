#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const SearchCommand = require('../src/commands/search');
const DuplicatesCommand = require('../src/commands/duplicates');
const InteractiveCommand = require('../src/commands/interactive');
const program = new Command();

program
  .name('pers')
  .description('Perscrutari - A powerful CLI tool to find and analyze files')
  .version('0.1.0');

program
  .option('-w, --workdir <path>', 'Directory to search', process.cwd())
  .option('--min-size <size>', 'Minimum file size (e.g., 10MB, 1GB)')
  .option('--max-size <size>', 'Maximum file size (e.g., 100MB, 5GB)')
  .option('-c, --count <number>', 'Limit results to top N files', parseInt)
  .option('-t, --types <types>', 'Filter by file types (comma-separated: img,doc,code)')
  .option('--min-loc <number>', 'Minimum lines of code', parseInt)
  .option('--max-loc <number>', 'Maximum lines of code', parseInt)
  .option('-d, --duplicates', 'Show duplicate files')
  .option('-i, --interactive', 'Enter interactive mode')
  .option('-s, --sort <field>', 'Sort by: size, loc, name', 'size')
  .option('-o, --output <file>', 'Export results to file')
  .action(async (options) => {
    if (options.duplicates) {
      await DuplicatesCommand.execute(options);
      return;
    }

    if (options.interactive) {
      await InteractiveCommand.execute(options);
      return;
    }

    await SearchCommand.execute(options);
  });

program.parse(process.argv);

// Show help if no arguments provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
