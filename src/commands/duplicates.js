const FileScanner = require('../analyzers/fileScanner');
const SizeAnalyzer = require('../analyzers/sizeAnalyzer');
const TypeAnalyzer = require('../analyzers/typeDetector');
const { FileTypeDetector } = require('../config/fileTypes');
const FileFilter = require('../utils/filters');
const FileHasher = require('../utils/fileHash');
const Formatter = require('../utils/formatter');
const Table = require('cli-table3');
const chalk = require('chalk');

class DuplicatesCommand {
  static async execute(options) {
    try {
      console.log(chalk.blue.bold('\n🔍 Perscrutari - Finding Duplicate Files...\n'));

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

      if (files.length === 0) {
        console.log(chalk.yellow('No files found to check for duplicates.'));
        return;
      }

      console.log(chalk.cyan('Calculating file hashes...'));
      const duplicateGroups = await FileHasher.findDuplicatesInFiles(files);

      if (duplicateGroups.length === 0) {
        console.log(chalk.green('\n✓ No duplicate files found!\n'));
        return;
      }

      console.log(chalk.yellow(`\nFound ${duplicateGroups.length} groups of duplicate files:\n`));

      this.displayDuplicateGroups(duplicateGroups, options);

      const stats = FileHasher.getDuplicateStatistics(duplicateGroups);
      this.displayDuplicateStatistics(stats);

      if (options.output) {
        await this.exportDuplicates(duplicateGroups, options.output);
      }

      console.log();
    } catch (error) {
      console.error(Formatter.formatError(error.message));
      process.exit(1);
    }
  }

  static displayDuplicateGroups(duplicateGroups, options = {}) {
    const limit = options.count || duplicateGroups.length;
    const groups = duplicateGroups.slice(0, limit);

    groups.forEach((group, index) => {
      console.log(chalk.bold(`\nGroup ${index + 1}:`));
      console.log(chalk.gray(`  Hash: ${group.hash}`));
      console.log(chalk.gray(`  Copies: ${group.count}`));
      console.log(chalk.yellow(`  Wasted Space: ${SizeAnalyzer.formatSize(group.wastedSpace)}`));
      console.log(chalk.gray(`  File Size: ${SizeAnalyzer.formatSize(group.files[0].size)}`));
      console.log(chalk.cyan('\n  Files:'));

      group.files.forEach((file, fileIndex) => {
        const marker = fileIndex === 0 ? chalk.green('[ORIGINAL]') : chalk.red('[DUPLICATE]');
        console.log(`    ${marker} ${file.path}`);
      });
    });
  }

  static displayDuplicateStatistics(stats) {
    console.log(chalk.bold('\n📊 Duplicate Statistics:'));
    console.log(`  ${chalk.cyan('Total duplicate groups:')} ${stats.totalGroups}`);
    console.log(`  ${chalk.cyan('Total duplicate files:')} ${stats.totalDuplicateFiles}`);
    console.log(`  ${chalk.cyan('Total wasted space:')} ${chalk.red(SizeAnalyzer.formatSize(stats.totalWastedSpace))}`);
  }

  static async exportDuplicates(duplicateGroups, outputPath) {
    const fs = require('fs').promises;
    const path = require('path');

    try {
      const ext = path.extname(outputPath).toLowerCase();
      let content;

      if (ext === '.json') {
        content = JSON.stringify(duplicateGroups, null, 2);
      } else if (ext === '.csv') {
        content = this.formatDuplicatesCsv(duplicateGroups);
      } else {
        content = JSON.stringify(duplicateGroups, null, 2);
      }

      await fs.writeFile(outputPath, content, 'utf8');
      console.log(Formatter.formatSuccess(`Duplicate report exported to ${outputPath}`));
    } catch (error) {
      console.error(Formatter.formatError(`Failed to export duplicates: ${error.message}`));
    }
  }

  static formatDuplicatesCsv(duplicateGroups) {
    const rows = [];
    rows.push(['Group', 'Hash', 'File Path', 'Size (Bytes)', 'Is Duplicate', 'Wasted Space']);

    duplicateGroups.forEach((group, groupIndex) => {
      group.files.forEach((file, fileIndex) => {
        rows.push([
          groupIndex + 1,
          group.hash,
          file.path,
          file.size,
          fileIndex > 0 ? 'Yes' : 'No',
          fileIndex > 0 ? file.size : 0
        ]);
      });
    });

    return rows.map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }
}

module.exports = DuplicatesCommand;
