class SizeAnalyzer {
  static parseSize(sizeStr) {
    if (typeof sizeStr === 'number') {
      return sizeStr;
    }

    if (!sizeStr || typeof sizeStr !== 'string') {
      return null;
    }

    const units = {
      'b': 1,
      'kb': 1024,
      'mb': 1024 * 1024,
      'gb': 1024 * 1024 * 1024,
      'tb': 1024 * 1024 * 1024 * 1024
    };

    const match = sizeStr.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb|tb)?$/);

    if (!match) {
      throw new Error(`Invalid size format: ${sizeStr}. Use format like "10MB", "1.5GB", "500KB"`);
    }

    const value = parseFloat(match[1]);
    const unit = match[2] || 'b';

    return Math.floor(value * units[unit]);
  }

  static formatSize(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    if (bytes === null || bytes === undefined) return 'N/A';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  static filterBySize(files, minSize = null, maxSize = null) {
    let filtered = [...files];

    if (minSize !== null) {
      const minBytes = this.parseSize(minSize);
      filtered = filtered.filter(file => file.size >= minBytes);
    }

    if (maxSize !== null) {
      const maxBytes = this.parseSize(maxSize);
      filtered = filtered.filter(file => file.size <= maxBytes);
    }

    return filtered;
  }

  static sortBySize(files, ascending = false) {
    return [...files].sort((a, b) => {
      return ascending ? a.size - b.size : b.size - a.size;
    });
  }

  static getTotalSize(files) {
    return files.reduce((total, file) => total + (file.size || 0), 0);
  }

  static getSizeStatistics(files) {
    if (!files || files.length === 0) {
      return {
        total: 0,
        average: 0,
        min: 0,
        max: 0,
        count: 0
      };
    }

    const sizes = files.map(f => f.size || 0);
    const total = sizes.reduce((sum, size) => sum + size, 0);

    return {
      total,
      average: total / files.length,
      min: Math.min(...sizes),
      max: Math.max(...sizes),
      count: files.length
    };
  }
}

module.exports = SizeAnalyzer;
