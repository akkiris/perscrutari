const { FileTypeDetector } = require('../config/fileTypes');

class TypeAnalyzer {
  static analyzeFile(file) {
    const typeInfo = FileTypeDetector.getFileType(file.extension);

    return {
      ...file,
      type: typeInfo.key,
      typeName: typeInfo.name
    };
  }

  static analyzeFiles(files) {
    return files.map(file => this.analyzeFile(file));
  }

  static filterByTypes(files, types) {
    if (!types || types.length === 0) {
      return files;
    }

    const typeKeys = Array.isArray(types) ? types : [types];
    const allowedExtensions = FileTypeDetector.getExtensionsForTypes(typeKeys);

    return files.filter(file =>
      allowedExtensions.includes(file.extension.toLowerCase())
    );
  }

  static groupByType(files) {
    const groups = {};

    files.forEach(file => {
      const typeInfo = FileTypeDetector.getFileType(file.extension);
      const typeKey = typeInfo.key;

      if (!groups[typeKey]) {
        groups[typeKey] = {
          typeName: typeInfo.name,
          files: [],
          totalSize: 0,
          count: 0
        };
      }

      groups[typeKey].files.push(file);
      groups[typeKey].totalSize += file.size;
      groups[typeKey].count++;
    });

    return groups;
  }

  static getTypeStatistics(files) {
    const groups = this.groupByType(files);
    const stats = [];

    for (const [typeKey, typeData] of Object.entries(groups)) {
      stats.push({
        type: typeKey,
        typeName: typeData.typeName,
        count: typeData.count,
        totalSize: typeData.totalSize,
        averageSize: typeData.totalSize / typeData.count
      });
    }

    stats.sort((a, b) => b.totalSize - a.totalSize);

    return stats;
  }
}

module.exports = TypeAnalyzer;
