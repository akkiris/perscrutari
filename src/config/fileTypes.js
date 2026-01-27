const FILE_TYPES = {
  img: {
    name: 'Images',
    extensions: [
      '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp',
      '.bmp', '.ico', '.tiff', '.tif', '.heic', '.heif',
      '.raw', '.cr2', '.nef', '.arw', '.dng', '.psd'
    ]
  },
  doc: {
    name: 'Documents',
    extensions: [
      '.pdf', '.doc', '.docx', '.txt', '.md', '.odt',
      '.rtf', '.tex', '.wpd', '.pages', '.epub', '.mobi',
      '.csv', '.xls', '.xlsx', '.ods', '.ppt', '.pptx',
      '.odp', '.key', '.numbers'
    ]
  },
  code: {
    name: 'Code Files',
    extensions: [
      '.js', '.jsx', '.ts', '.tsx', '.py', '.java',
      '.cpp', '.c', '.h', '.hpp', '.cs', '.go', '.rs',
      '.rb', '.php', '.swift', '.kt', '.scala', '.r',
      '.m', '.mm', '.pl', '.sh', '.bash', '.zsh',
      '.fish', '.html', '.htm', '.css', '.scss', '.sass',
      '.less', '.xml', '.json', '.yaml', '.yml', '.toml',
      '.ini', '.cfg', '.conf', '.sql', '.lua', '.vim',
      '.dart', '.ex', '.exs', '.erl', '.clj', '.cljs',
      '.fs', '.fsx', '.ml', '.hs', '.elm'
    ]
  },
  video: {
    name: 'Videos',
    extensions: [
      '.mp4', '.avi', '.mov', '.mkv', '.flv', '.wmv',
      '.webm', '.m4v', '.mpg', '.mpeg', '.3gp', '.ogv',
      '.f4v', '.vob', '.mts', '.m2ts', '.ts'
    ]
  },
  audio: {
    name: 'Audio',
    extensions: [
      '.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a',
      '.wma', '.opus', '.ape', '.alac', '.aiff', '.mid',
      '.midi', '.ra', '.rm', '.amr'
    ]
  },
  archive: {
    name: 'Archives',
    extensions: [
      '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2',
      '.xz', '.tgz', '.tbz2', '.tar.gz', '.tar.bz2',
      '.iso', '.dmg', '.pkg', '.deb', '.rpm'
    ]
  },
  executable: {
    name: 'Executables',
    extensions: [
      '.exe', '.dll', '.so', '.dylib', '.app', '.deb',
      '.rpm', '.msi', '.apk', '.jar', '.war', '.ear',
      '.bin', '.bat', '.cmd', '.com'
    ]
  },
  font: {
    name: 'Fonts',
    extensions: [
      '.ttf', '.otf', '.woff', '.woff2', '.eot', '.fon'
    ]
  },
  data: {
    name: 'Data Files',
    extensions: [
      '.db', '.sqlite', '.sqlite3', '.mdb', '.accdb',
      '.dat', '.log', '.bak', '.tmp', '.cache'
    ]
  }
};

class FileTypeDetector {
  static getFileType(extension) {
    const normalizedExt = extension.toLowerCase();

    for (const [typeKey, typeInfo] of Object.entries(FILE_TYPES)) {
      if (typeInfo.extensions.includes(normalizedExt)) {
        return {
          key: typeKey,
          name: typeInfo.name
        };
      }
    }

    return {
      key: 'other',
      name: 'Other'
    };
  }

  static getExtensionsForType(typeKey) {
    const typeInfo = FILE_TYPES[typeKey];
    return typeInfo ? typeInfo.extensions : [];
  }

  static getExtensionsForTypes(typeKeys) {
    if (!Array.isArray(typeKeys)) {
      typeKeys = [typeKeys];
    }

    const extensions = [];
    for (const typeKey of typeKeys) {
      const typeExtensions = this.getExtensionsForType(typeKey);
      extensions.push(...typeExtensions);
    }

    return extensions;
  }

  static getAllTypes() {
    return Object.keys(FILE_TYPES);
  }

  static getTypeName(typeKey) {
    const typeInfo = FILE_TYPES[typeKey];
    return typeInfo ? typeInfo.name : 'Unknown';
  }

  static isValidType(typeKey) {
    return FILE_TYPES.hasOwnProperty(typeKey);
  }

  static parseTypeString(typeString) {
    if (!typeString) {
      return [];
    }

    const types = typeString.split(',').map(t => t.trim().toLowerCase());
    const validTypes = types.filter(t => this.isValidType(t));

    if (validTypes.length === 0 && types.length > 0) {
      const availableTypes = this.getAllTypes().join(', ');
      throw new Error(
        `Invalid file type(s): ${types.join(', ')}\n` +
        `Available types: ${availableTypes}`
      );
    }

    return validTypes;
  }
}

module.exports = {
  FILE_TYPES,
  FileTypeDetector
};
