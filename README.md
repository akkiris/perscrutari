# 🔍 Perscrutari

> A powerful CLI tool to find and analyze files by size, type, and lines of code.

**Perscrutari** (Latin for "to search" or "to investigate") is a command-line utility designed to help you discover large files, analyze code metrics, and manage your file system efficiently.

## ✨ Features

- Find files by size (minimum/maximum)
- Filter files by type (images, documents, code files, etc.)
- Count lines of code (excluding comments and blank lines)
- Detect duplicate files based on content
- Interactive mode for file management
- Export results to various formats

## 📦 Installation

### Global Installation

```bash
npm install -g perscrutari
```

### Local Installation

```bash
npm install perscrutari
```

## 🚀 Usage

### Basic Usage

```bash
# Show help
pers --help

# Find files larger than 10MB in current directory
pers --min-size 10MB

# Find large image files
pers --types img --min-size 5MB --count 20

# Find files with more than 1000 lines of code
pers --min-loc 1000 --types code

# Interactive mode to manage large files
pers --min-size 100MB --interactive

# Find duplicate files
pers --duplicates
```

### ⚙️ Command Options

| Option | Description | Example |
|--------|-------------|---------|
| `-w, --workdir <path>` | Directory to search | `--workdir /home/user/projects` |
| `--min-size <size>` | Minimum file size | `--min-size 10MB` |
| `--max-size <size>` | Maximum file size | `--max-size 1GB` |
| `-c, --count <number>` | Limit results to top N files | `--count 50` |
| `-t, --types <types>` | Filter by file types | `--types img,doc,code` |
| `--min-loc <number>` | Minimum lines of code | `--min-loc 500` |
| `--max-loc <number>` | Maximum lines of code | `--max-loc 5000` |
| `-d, --duplicates` | Show duplicate files | `--duplicates` |
| `-i, --interactive` | Enter interactive mode | `--interactive` |
| `-s, --sort <field>` | Sort by: size, loc, name | `--sort loc` |
| `-o, --output <file>` | Export results to file | `--output results.json` |

### 📂 File Type Categories

- **img**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.svg`, `.webp`, `.bmp`, `.ico`
- **doc**: `.pdf`, `.doc`, `.docx`, `.txt`, `.md`, `.odt`, `.rtf`
- **code**: `.js`, `.ts`, `.py`, `.java`, `.cpp`, `.c`, `.go`, `.rs`, `.php`
- **video**: `.mp4`, `.avi`, `.mov`, `.mkv`, `.flv`, `.wmv`
- **audio**: `.mp3`, `.wav`, `.flac`, `.aac`, `.ogg`, `.m4a`

## 💡 Examples

### Find all images larger than 5MB
```bash
pers --types img --min-size 5MB
```

### Find duplicate files in a specific directory
```bash
pers --workdir ~/Downloads --duplicates
```

### Find large code files with many lines
```bash
pers --types code --min-loc 1000 --min-size 100KB --count 20
```

### Interactive mode to clean up large files
```bash
pers --min-size 500MB --interactive
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

Built with Node.js and Commander.js

---

*✨ Created with AI*
