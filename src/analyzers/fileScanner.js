const fs = require('fs').promises;
const path = require('path');
const fg = require('fast-glob');

class FileScanner {
  constructor(workdir = process.cwd()) {
    this.workdir = workdir;
  }

  async scanFiles(options = {}) {
    try {
      const stats = await fs.stat(this.workdir);
      if (!stats.isDirectory()) {
        throw new Error(`${this.workdir} is not a directory`);
      }

      const files = await this.getAllFiles();
      return files;
    } catch (error) {
      throw new Error(`Failed to scan directory: ${error.message}`);
    }
  }

  async getAllFiles() {
    try {
      const pattern = path.join(this.workdir, '**/*').replace(/\\/g, '/');

      const files = await fg(pattern, {
        dot: false,
        onlyFiles: true,
        followSymbolicLinks: false,
        stats: true,
        ignore: [
          '**/node_modules/**',
          '**/.git/**',
          '**/dist/**',
          '**/build/**',
          '**/.cache/**'
        ]
      });

      const fileInfos = await Promise.all(
        files.map(async (entry) => {
          try {
            return {
              path: entry.path,
              name: path.basename(entry.path),
              directory: path.dirname(entry.path),
              size: entry.stats.size,
              extension: path.extname(entry.path).toLowerCase(),
              modified: entry.stats.mtime,
              created: entry.stats.birthtime
            };
          } catch (error) {
            return null;
          }
        })
      );

      return fileInfos.filter(info => info !== null);
    } catch (error) {
      throw new Error(`Error scanning files: ${error.message}`);
    }
  }

  async getFileInfo(filePath) {
    try {
      const stats = await fs.stat(filePath);

      return {
        path: filePath,
        name: path.basename(filePath),
        directory: path.dirname(filePath),
        size: stats.size,
        extension: path.extname(filePath).toLowerCase(),
        modified: stats.mtime,
        created: stats.birthtime
      };
    } catch (error) {
      throw new Error(`Error getting file info for ${filePath}: ${error.message}`);
    }
  }
}

module.exports = FileScanner;
