class FileFilter {
  static filterByExtensions(files, extensions) {
    if (!extensions || extensions.length === 0) {
      return files;
    }

    const normalizedExtensions = extensions.map(ext =>
      ext.toLowerCase().startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`
    );

    return files.filter(file =>
      normalizedExtensions.includes(file.extension)
    );
  }

  static filterByName(files, pattern) {
    if (!pattern) {
      return files;
    }

    const regex = new RegExp(pattern, 'i');
    return files.filter(file => regex.test(file.name));
  }

  static filterByPath(files, pattern) {
    if (!pattern) {
      return files;
    }

    const regex = new RegExp(pattern, 'i');
    return files.filter(file => regex.test(file.path));
  }

  static filterByDateRange(files, startDate = null, endDate = null) {
    let filtered = [...files];

    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter(file => file.modified >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      filtered = filtered.filter(file => file.modified <= end);
    }

    return filtered;
  }

  static limitResults(files, count) {
    if (!count || count <= 0) {
      return files;
    }

    return files.slice(0, count);
  }

  static sortFiles(files, field = 'size', ascending = false) {
    const sorted = [...files].sort((a, b) => {
      let aVal, bVal;

      switch (field) {
        case 'size':
          aVal = a.size || 0;
          bVal = b.size || 0;
          break;
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          return ascending
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        case 'modified':
          aVal = a.modified;
          bVal = b.modified;
          break;
        case 'loc':
          aVal = a.loc || 0;
          bVal = b.loc || 0;
          break;
        default:
          aVal = a.size || 0;
          bVal = b.size || 0;
      }

      return ascending ? aVal - bVal : bVal - aVal;
    });

    return sorted;
  }

  static applyFilters(files, options = {}) {
    let filtered = [...files];

    if (options.extensions && options.extensions.length > 0) {
      filtered = this.filterByExtensions(filtered, options.extensions);
    }

    if (options.namePattern) {
      filtered = this.filterByName(filtered, options.namePattern);
    }

    if (options.pathPattern) {
      filtered = this.filterByPath(filtered, options.pathPattern);
    }

    if (options.startDate || options.endDate) {
      filtered = this.filterByDateRange(filtered, options.startDate, options.endDate);
    }

    if (options.sortBy) {
      filtered = this.sortFiles(filtered, options.sortBy, options.ascending);
    }

    if (options.limit) {
      filtered = this.limitResults(filtered, options.limit);
    }

    return filtered;
  }
}

module.exports = FileFilter;
