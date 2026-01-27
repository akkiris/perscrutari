const fs = require('fs').promises;
const parser = require('@babel/parser');

class LocCounter {
  static async countLinesOfCode(filePath, extension) {
    try {
      const content = await fs.readFile(filePath, 'utf8');

      const language = this.detectLanguage(extension);

      if (language === 'javascript' || language === 'typescript') {
        return this.countJavaScriptLoc(content, language);
      } else if (language === 'python') {
        return this.countPythonLoc(content);
      } else if (language === 'c-style') {
        return this.countCStyleLoc(content);
      } else {
        return this.countGenericLoc(content);
      }
    } catch (error) {
      return null;
    }
  }

  static detectLanguage(extension) {
    const jsExtensions = ['.js', '.jsx', '.mjs', '.cjs'];
    const tsExtensions = ['.ts', '.tsx'];
    const pythonExtensions = ['.py', '.pyw'];
    const cStyleExtensions = [
      '.c', '.cpp', '.cc', '.cxx', '.h', '.hpp',
      '.java', '.cs', '.go', '.rs', '.swift', '.kt'
    ];

    if (jsExtensions.includes(extension)) return 'javascript';
    if (tsExtensions.includes(extension)) return 'typescript';
    if (pythonExtensions.includes(extension)) return 'python';
    if (cStyleExtensions.includes(extension)) return 'c-style';

    return 'generic';
  }

  static countJavaScriptLoc(content, language) {
    try {
      const plugins = language === 'typescript'
        ? ['typescript', 'jsx']
        : ['jsx', 'flow'];

      const ast = parser.parse(content, {
        sourceType: 'module',
        plugins: plugins,
        errorRecovery: true
      });

      const lines = content.split('\n');
      const commentLines = new Set();

      if (ast.comments) {
        ast.comments.forEach(comment => {
          for (let i = comment.loc.start.line; i <= comment.loc.end.line; i++) {
            commentLines.add(i);
          }
        });
      }

      let loc = 0;
      lines.forEach((line, index) => {
        const trimmed = line.trim();
        const lineNumber = index + 1;

        if (trimmed.length > 0 && !commentLines.has(lineNumber)) {
          loc++;
        }
      });

      return loc;
    } catch (error) {
      return this.countGenericLoc(content);
    }
  }

  static countPythonLoc(content) {
    const lines = content.split('\n');
    let loc = 0;
    let inMultilineString = false;
    let stringDelimiter = null;

    for (const line of lines) {
      const trimmed = line.trim();

      if (inMultilineString) {
        if (trimmed.includes(stringDelimiter)) {
          inMultilineString = false;
          stringDelimiter = null;
        }
        continue;
      }

      if (trimmed.startsWith('"""') || trimmed.startsWith("'''")) {
        const delimiter = trimmed.substring(0, 3);
        if (!trimmed.substring(3).includes(delimiter)) {
          inMultilineString = true;
          stringDelimiter = delimiter;
        }
        continue;
      }

      if (trimmed.length === 0) {
        continue;
      }

      if (trimmed.startsWith('#')) {
        continue;
      }

      loc++;
    }

    return loc;
  }

  static countCStyleLoc(content) {
    const lines = content.split('\n');
    let loc = 0;
    let inMultilineComment = false;

    for (const line of lines) {
      let trimmed = line.trim();

      if (inMultilineComment) {
        if (trimmed.includes('*/')) {
          inMultilineComment = false;
          trimmed = trimmed.substring(trimmed.indexOf('*/') + 2).trim();

          if (trimmed.length === 0) {
            continue;
          }
        } else {
          continue;
        }
      }

      if (trimmed.startsWith('/*')) {
        if (!trimmed.includes('*/')) {
          inMultilineComment = true;
          continue;
        }

        trimmed = trimmed.substring(trimmed.indexOf('*/') + 2).trim();
        if (trimmed.length === 0) {
          continue;
        }
      }

      if (trimmed.startsWith('//')) {
        continue;
      }

      if (trimmed.length === 0) {
        continue;
      }

      loc++;
    }

    return loc;
  }

  static countGenericLoc(content) {
    const lines = content.split('\n');
    let loc = 0;

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.length === 0) {
        continue;
      }

      if (trimmed.startsWith('//') ||
          trimmed.startsWith('#') ||
          trimmed.startsWith('/*') ||
          trimmed.startsWith('*') ||
          trimmed.startsWith('*/')) {
        continue;
      }

      loc++;
    }

    return loc;
  }

  static async analyzeFiles(files) {
    const results = await Promise.all(
      files.map(async (file) => {
        const loc = await this.countLinesOfCode(file.path, file.extension);
        return {
          ...file,
          loc
        };
      })
    );

    return results;
  }

  static filterByLoc(files, minLoc = null, maxLoc = null) {
    let filtered = files.filter(file => file.loc !== null && file.loc !== undefined);

    if (minLoc !== null) {
      filtered = filtered.filter(file => file.loc >= minLoc);
    }

    if (maxLoc !== null) {
      filtered = filtered.filter(file => file.loc <= maxLoc);
    }

    return filtered;
  }
}

module.exports = LocCounter;
