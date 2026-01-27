const Table = require('cli-table3');
const chalk = require('chalk');
const SizeAnalyzer = require('../analyzers/sizeAnalyzer');

class Formatter {
  static formatTable(files, options = {}) {
    if (!files || files.length === 0) {
      return chalk.yellow('No files found matching the criteria.');
    }

    const showLoc = options.showLoc || false;

    const headers = ['#', 'File Path', 'Size'];
    const colWidths = [5, 60, 15];

    if (showLoc) {
      headers.push('LOC');
      colWidths.push(10);
    }

    const table = new Table({
      head: headers.map(h => chalk.cyan.bold(h)),
      colWidths: colWidths,
      wordWrap: true,
      style: {
        head: [],
        border: ['grey']
      }
    });

    files.forEach((file, index) => {
      const row = [
        chalk.gray(index + 1),
        this.truncatePath(file.path, 58),
        chalk.green(SizeAnalyzer.formatSize(file.size))
      ];

      if (showLoc && file.loc !== undefined) {
        row.push(chalk.blue(file.loc.toLocaleString()));
      }

      table.push(row);
    });

    return table.toString();
  }

  static formatSummary(files, options = {}) {
    const stats = SizeAnalyzer.getSizeStatistics(files);

    const summary = [
      chalk.bold('\nSummary:'),
      `  ${chalk.cyan('Total Files:')} ${stats.count.toLocaleString()}`,
      `  ${chalk.cyan('Total Size:')} ${chalk.green(SizeAnalyzer.formatSize(stats.total))}`,
      `  ${chalk.cyan('Average Size:')} ${SizeAnalyzer.formatSize(stats.average)}`,
      `  ${chalk.cyan('Largest File:')} ${SizeAnalyzer.formatSize(stats.max)}`,
      `  ${chalk.cyan('Smallest File:')} ${SizeAnalyzer.formatSize(stats.min)}`
    ];

    return summary.join('\n');
  }

  static formatList(files, options = {}) {
    if (!files || files.length === 0) {
      return chalk.yellow('No files found.');
    }

    const lines = files.map((file, index) => {
      const size = chalk.green(SizeAnalyzer.formatSize(file.size).padEnd(12));
      const loc = file.loc !== undefined
        ? chalk.blue(`${file.loc} LOC`.padEnd(12))
        : '';

      return `${chalk.gray((index + 1) + '.')} ${size} ${loc} ${file.path}`;
    });

    return lines.join('\n');
  }

  static formatJson(files) {
    return JSON.stringify(files, null, 2);
  }

  static truncatePath(filePath, maxLength = 60) {
    if (filePath.length <= maxLength) {
      return filePath;
    }

    const parts = filePath.split(/[/\\]/);
    if (parts.length <= 2) {
      return '...' + filePath.slice(-(maxLength - 3));
    }

    const fileName = parts[parts.length - 1];
    const firstPart = parts[0];

    if (fileName.length + firstPart.length + 5 > maxLength) {
      return firstPart + '/.../' + fileName.slice(-(maxLength - firstPart.length - 8));
    }

    let truncated = firstPart + '/.../' + fileName;
    let middleIndex = parts.length - 2;

    while (truncated.length < maxLength && middleIndex > 0) {
      const testPath = firstPart + '/.../' + parts.slice(middleIndex).join('/');
      if (testPath.length > maxLength) break;
      truncated = testPath;
      middleIndex--;
    }

    return truncated;
  }

  static formatProgress(current, total) {
    const percentage = Math.floor((current / total) * 100);
    const barLength = 30;
    const filled = Math.floor((percentage / 100) * barLength);
    const empty = barLength - filled;

    const bar = '█'.repeat(filled) + '░'.repeat(empty);

    return `${chalk.cyan(bar)} ${chalk.yellow(percentage + '%')} (${current}/${total})`;
  }

  static formatError(message) {
    return chalk.red.bold('✗ Error: ') + chalk.red(message);
  }

  static formatSuccess(message) {
    return chalk.green.bold('✓ ') + chalk.green(message);
  }

  static formatWarning(message) {
    return chalk.yellow.bold('⚠ Warning: ') + chalk.yellow(message);
  }

  static formatInfo(message) {
    return chalk.blue.bold('ℹ ') + chalk.blue(message);
  }
}

module.exports = Formatter;
