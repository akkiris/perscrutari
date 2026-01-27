const FileScanner = require('../analyzers/fileScanner');
const SizeAnalyzer = require('../analyzers/sizeAnalyzer');
const TypeAnalyzer = require('../analyzers/typeDetector');
const LocCounter = require('../analyzers/locCounter');
const { FileTypeDetector } = require('../config/fileTypes');
const FileFilter = require('../utils/filters');
const Formatter = require('../utils/formatter');
const chalk = require('chalk');

class SearchCommand {
  static async execute(options) {
    try {
      console.log(chalk.blue.bold('\n🔍 Perscrutari - Scanning files...\n'));

      const workdir = options.workdir || process.cwd();
      console.log(chalk.gray(`Working directory: ${workdir}\n`));

      const scanner = new FileScanner(workdir);

      console.log(chalk.cyan('Scanning directory...'));
      let files = await scanner.scanFiles();
      console.log(chalk.gray(`Found ${files.length} files\n`));

      if (options.types) {
        console.log(chalk.cyan('Filtering by file type...'));
        const types = FileTypeDetector.parseTypeString(options.types);
        files = TypeAnalyzer.filterByTypes(files, types);
        console.log(chalk.gray(`${files.length} files after type filtering\n`));
      }

      if (options.minSize || options.maxSize) {
        console.log(chalk.cyan('Filtering by size...'));
        files = SizeAnalyzer.filterBySize(files, options.minSize, options.maxSize);
        console.log(chalk.gray(`${files.length} files after size filtering\n`));
      }

      const needsLoc = options.minLoc || options.maxLoc || options.sort === 'loc';
      if (needsLoc) {
        console.log(chalk.cyan('Counting lines of code...'));
        files = await LocCounter.analyzeFiles(files);
        console.log(chalk.gray('LOC analysis complete\n'));

        if (options.minLoc || options.maxLoc) {
          console.log(chalk.cyan('Filtering by lines of code...'));
          files = LocCounter.filterByLoc(files, options.minLoc, options.maxLoc);
          console.log(chalk.gray(`${files.length} files after LOC filtering\n`));
        }
      }

      const sortField = options.sort || 'size';
      files = FileFilter.sortFiles(files, sortField, false);

      if (options.count) {
        files = FileFilter.limitResults(files, options.count);
      }

      if (files.length === 0) {
        console.log(chalk.yellow('No files found matching the criteria.'));
        return;
      }

      console.log(Formatter.formatTable(files, { showLoc: needsLoc }));
      console.log(Formatter.formatSummary(files));

      if (options.output) {
        await this.exportResults(files, options.output);
      }

      console.log();
    } catch (error) {
      console.error(Formatter.formatError(error.message));
      process.exit(1);
    }
  }

  static async exportResults(files, outputPath) {
    const fs = require('fs').promises;
    const path = require('path');

    try {
      const ext = path.extname(outputPath).toLowerCase();
      let content;

      if (ext === '.json') {
        content = Formatter.formatJson(files);
      } else if (ext === '.csv') {
        content = this.formatCsv(files);
      } else {
        content = Formatter.formatJson(files);
      }

      await fs.writeFile(outputPath, content, 'utf8');
      console.log(Formatter.formatSuccess(`Results exported to ${outputPath}`));
    } catch (error) {
      console.error(Formatter.formatError(`Failed to export results: ${error.message}`));
    }
  }

  static formatCsv(files) {
    const headers = ['Path', 'Name', 'Size (Bytes)', 'Size (Formatted)', 'Extension', 'Modified'];
    const rows = files.map(file => [
      file.path,
      file.name,
      file.size,
      SizeAnalyzer.formatSize(file.size),
      file.extension,
      file.modified.toISOString()
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }
}

module.exports = SearchCommand;
