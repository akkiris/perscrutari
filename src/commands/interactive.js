const FileScanner = require('../analyzers/fileScanner');
const SizeAnalyzer = require('../analyzers/sizeAnalyzer');
const TypeAnalyzer = require('../analyzers/typeDetector');
const LocCounter = require('../analyzers/locCounter');
const { FileTypeDetector } = require('../config/fileTypes');
const FileFilter = require('../utils/filters');
const Formatter = require('../utils/formatter');
const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs').promises;
const path = require('path');

class InteractiveCommand {
  static async execute(options) {
    try {
      console.log(chalk.blue.bold('\n🔍 Perscrutari - Interactive Mode\n'));

      const workdir = options.workdir || process.cwd();
      console.log(chalk.gray(`Working directory: ${workdir}\n`));

      const scanner = new FileScanner(workdir);

      console.log(chalk.cyan('Scanning directory...'));
      let files = await scanner.scanFiles();
      console.log(chalk.gray(`Found ${files.length} files\n`));

      if (options.types) {
        const types = FileTypeDetector.parseTypeString(options.types);
        files = TypeAnalyzer.filterByTypes(files, types);
      }

      if (options.minSize || options.maxSize) {
        files = SizeAnalyzer.filterBySize(files, options.minSize, options.maxSize);
      }

      const needsLoc = options.minLoc || options.maxLoc;
      if (needsLoc) {
        console.log(chalk.cyan('Counting lines of code...'));
        files = await LocCounter.analyzeFiles(files);

        if (options.minLoc || options.maxLoc) {
          files = LocCounter.filterByLoc(files, options.minLoc, options.maxLoc);
        }
      }

      const sortField = options.sort || 'size';
      files = FileFilter.sortFiles(files, sortField, false);

      if (files.length === 0) {
        console.log(chalk.yellow('No files found matching the criteria.'));
        return;
      }

      console.log(chalk.green(`\nFound ${files.length} files. Entering interactive mode...\n`));

      await this.interactiveLoop(files);

    } catch (error) {
      console.error(Formatter.formatError(error.message));
      process.exit(1);
    }
  }

  static async interactiveLoop(files) {
    let continueLoop = true;

    while (continueLoop) {
      const answer = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            { name: '📋 View file list', value: 'view' },
            { name: '🔍 View file details', value: 'details' },
            { name: '🗑️  Delete files', value: 'delete' },
            { name: '📊 Show statistics', value: 'stats' },
            { name: '💾 Export to file', value: 'export' },
            { name: '❌ Exit', value: 'exit' }
          ]
        }
      ]);

      switch (answer.action) {
        case 'view':
          await this.viewFileList(files);
          break;
        case 'details':
          await this.viewFileDetails(files);
          break;
        case 'delete':
          await this.deleteFiles(files);
          break;
        case 'stats':
          await this.showStatistics(files);
          break;
        case 'export':
          await this.exportFiles(files);
          break;
        case 'exit':
          continueLoop = false;
          console.log(chalk.blue('\nExiting interactive mode. Goodbye!\n'));
          break;
      }
    }
  }

  static async viewFileList(files) {
    const pageSize = 20;
    const totalPages = Math.ceil(files.length / pageSize);

    let currentPage = 0;
    let continueViewing = true;

    while (continueViewing) {
      const start = currentPage * pageSize;
      const end = Math.min(start + pageSize, files.length);
      const pageFiles = files.slice(start, end);

      console.log(chalk.cyan(`\nShowing files ${start + 1}-${end} of ${files.length} (Page ${currentPage + 1}/${totalPages})\n`));
      console.log(Formatter.formatTable(pageFiles, { showLoc: false }));

      if (totalPages > 1) {
        const answer = await inquirer.prompt([
          {
            type: 'list',
            name: 'navigation',
            message: 'Navigation:',
            choices: [
              currentPage > 0 ? { name: '⬅️  Previous page', value: 'prev' } : null,
              currentPage < totalPages - 1 ? { name: '➡️  Next page', value: 'next' } : null,
              { name: '🔙 Back to menu', value: 'back' }
            ].filter(Boolean)
          }
        ]);

        if (answer.navigation === 'prev') {
          currentPage--;
        } else if (answer.navigation === 'next') {
          currentPage++;
        } else {
          continueViewing = false;
        }
      } else {
        await inquirer.prompt([
          {
            type: 'input',
            name: 'continue',
            message: 'Press Enter to return to menu...'
          }
        ]);
        continueViewing = false;
      }
    }
  }

  static async viewFileDetails(files) {
    const choices = files.slice(0, 50).map((file, index) => ({
      name: `${SizeAnalyzer.formatSize(file.size).padEnd(12)} ${file.name}`,
      value: index
    }));

    choices.push({ name: '🔙 Back to menu', value: -1 });

    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'fileIndex',
        message: 'Select a file to view details:',
        choices,
        pageSize: 15
      }
    ]);

    if (answer.fileIndex === -1) return;

    const file = files[answer.fileIndex];

    console.log(chalk.cyan('\n📄 File Details:\n'));
    console.log(`  ${chalk.bold('Path:')} ${file.path}`);
    console.log(`  ${chalk.bold('Name:')} ${file.name}`);
    console.log(`  ${chalk.bold('Size:')} ${SizeAnalyzer.formatSize(file.size)} (${file.size.toLocaleString()} bytes)`);
    console.log(`  ${chalk.bold('Extension:')} ${file.extension}`);
    console.log(`  ${chalk.bold('Directory:')} ${file.directory}`);
    console.log(`  ${chalk.bold('Modified:')} ${file.modified.toLocaleString()}`);
    console.log(`  ${chalk.bold('Created:')} ${file.created.toLocaleString()}`);

    if (file.loc !== undefined) {
      console.log(`  ${chalk.bold('Lines of Code:')} ${file.loc.toLocaleString()}`);
    }

    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: '\nPress Enter to continue...'
      }
    ]);
  }

  static async deleteFiles(files) {
    const choices = files.slice(0, 100).map((file, index) => ({
      name: `${SizeAnalyzer.formatSize(file.size).padEnd(12)} ${file.path}`,
      value: index
    }));

    const answer = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'fileIndexes',
        message: 'Select files to delete (use space to select, enter to confirm):',
        choices,
        pageSize: 15
      }
    ]);

    if (answer.fileIndexes.length === 0) {
      console.log(chalk.yellow('\nNo files selected.'));
      return;
    }

    const selectedFiles = answer.fileIndexes.map(index => files[index]);
    const totalSize = selectedFiles.reduce((sum, f) => sum + f.size, 0);

    console.log(chalk.yellow(`\n⚠️  You are about to delete ${selectedFiles.length} file(s):`));
    console.log(chalk.yellow(`   Total size: ${SizeAnalyzer.formatSize(totalSize)}\n`));

    selectedFiles.forEach(file => {
      console.log(`   - ${file.path}`);
    });

    const confirm = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message: chalk.red('\nAre you sure you want to delete these files? This cannot be undone!'),
        default: false
      }
    ]);

    if (confirm.confirmed) {
      let deletedCount = 0;
      let failedCount = 0;

      for (const file of selectedFiles) {
        try {
          await fs.unlink(file.path);
          console.log(chalk.green(`✓ Deleted: ${file.path}`));
          deletedCount++;
        } catch (error) {
          console.log(chalk.red(`✗ Failed to delete: ${file.path} - ${error.message}`));
          failedCount++;
        }
      }

      console.log(chalk.green(`\n✓ Deleted ${deletedCount} file(s)`));
      if (failedCount > 0) {
        console.log(chalk.red(`✗ Failed to delete ${failedCount} file(s)`));
      }
    } else {
      console.log(chalk.gray('\nDeletion cancelled.'));
    }
  }

  static async showStatistics(files) {
    const stats = SizeAnalyzer.getSizeStatistics(files);

    console.log(chalk.cyan('\n📊 File Statistics:\n'));
    console.log(`  ${chalk.bold('Total Files:')} ${stats.count.toLocaleString()}`);
    console.log(`  ${chalk.bold('Total Size:')} ${SizeAnalyzer.formatSize(stats.total)}`);
    console.log(`  ${chalk.bold('Average Size:')} ${SizeAnalyzer.formatSize(stats.average)}`);
    console.log(`  ${chalk.bold('Largest File:')} ${SizeAnalyzer.formatSize(stats.max)}`);
    console.log(`  ${chalk.bold('Smallest File:')} ${SizeAnalyzer.formatSize(stats.min)}`);

    const typeStats = TypeAnalyzer.getTypeStatistics(files);
    if (typeStats.length > 0) {
      console.log(chalk.cyan('\n📁 File Types:\n'));
      typeStats.forEach(typeStat => {
        console.log(`  ${chalk.bold(typeStat.typeName)}:`);
        console.log(`    Count: ${typeStat.count}`);
        console.log(`    Total Size: ${SizeAnalyzer.formatSize(typeStat.totalSize)}`);
        console.log(`    Average Size: ${SizeAnalyzer.formatSize(typeStat.averageSize)}\n`);
      });
    }

    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: 'Press Enter to continue...'
      }
    ]);
  }

  static async exportFiles(files) {
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'filename',
        message: 'Enter output filename (e.g., results.json or results.csv):',
        default: 'interactive-results.json'
      }
    ]);

    try {
      const ext = path.extname(answer.filename).toLowerCase();
      let content;

      if (ext === '.json') {
        content = JSON.stringify(files, null, 2);
      } else if (ext === '.csv') {
        const headers = ['Path', 'Name', 'Size (Bytes)', 'Size (Formatted)', 'Extension', 'Modified'];
        const rows = files.map(file => [
          file.path,
          file.name,
          file.size,
          SizeAnalyzer.formatSize(file.size),
          file.extension,
          file.modified.toISOString()
        ]);

        content = [headers, ...rows]
          .map(row => row.map(cell => `"${cell}"`).join(','))
          .join('\n');
      } else {
        content = JSON.stringify(files, null, 2);
      }

      await fs.writeFile(answer.filename, content, 'utf8');
      console.log(chalk.green(`\n✓ Results exported to ${answer.filename}`));
    } catch (error) {
      console.log(chalk.red(`\n✗ Failed to export: ${error.message}`));
    }
  }
}

module.exports = InteractiveCommand;
