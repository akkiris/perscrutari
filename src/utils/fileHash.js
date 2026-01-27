const fs = require('fs');
const crypto = require('crypto');
const { promisify } = require('util');
const stream = require('stream');
const pipeline = promisify(stream.pipeline);

class FileHasher {
  static async hashFile(filePath, algorithm = 'md5') {
    try {
      const hash = crypto.createHash(algorithm);
      const input = fs.createReadStream(filePath);

      await pipeline(input, hash);

      return hash.digest('hex');
    } catch (error) {
      throw new Error(`Failed to hash file ${filePath}: ${error.message}`);
    }
  }

  static async hashFiles(files, algorithm = 'md5') {
    const results = await Promise.all(
      files.map(async (file) => {
        try {
          const hash = await this.hashFile(file.path, algorithm);
          return {
            ...file,
            hash
          };
        } catch (error) {
          return {
            ...file,
            hash: null,
            hashError: error.message
          };
        }
      })
    );

    return results;
  }

  static findDuplicates(files) {
    const hashMap = new Map();
    const duplicates = [];

    files.forEach(file => {
      if (!file.hash) {
        return;
      }

      if (!hashMap.has(file.hash)) {
        hashMap.set(file.hash, []);
      }

      hashMap.get(file.hash).push(file);
    });

    hashMap.forEach((fileList, hash) => {
      if (fileList.length > 1) {
        duplicates.push({
          hash,
          count: fileList.length,
          totalSize: fileList.reduce((sum, f) => sum + f.size, 0),
          wastedSpace: fileList.reduce((sum, f) => sum + f.size, 0) - fileList[0].size,
          files: fileList
        });
      }
    });

    duplicates.sort((a, b) => b.wastedSpace - a.wastedSpace);

    return duplicates;
  }

  static async findDuplicatesInFiles(files, algorithm = 'md5') {
    const hashedFiles = await this.hashFiles(files, algorithm);
    return this.findDuplicates(hashedFiles);
  }

  static getDuplicateStatistics(duplicateGroups) {
    const totalGroups = duplicateGroups.length;
    const totalDuplicateFiles = duplicateGroups.reduce((sum, group) => sum + group.count, 0);
    const totalWastedSpace = duplicateGroups.reduce((sum, group) => sum + group.wastedSpace, 0);

    return {
      totalGroups,
      totalDuplicateFiles,
      totalWastedSpace,
      uniqueFiles: duplicateGroups.length
    };
  }
}

module.exports = FileHasher;
