---
title: CLI Reference
sidebar_position: 1
---

# CLI Reference

Complete command-line interface reference for Petk. This document provides detailed information about all available commands, options, and usage patterns.

## Global Options

These options are available for all Petk commands:

| Option | Short | Description |
|--------|-------|-------------|
| `--help` | `-h` | Show help information |
| `--version` | `-V` | Display version number |
| `--verbose` | `-v` | Enable verbose output |
| `--quiet` | `-q` | Suppress non-error output |
| `--config <file>` | `-c` | Specify configuration file |

## Commands

### `petk process`

Process template files with Petk directives.

**Syntax:**
```bash
petk process [options] <input> [output]
```

**Arguments:**
- `<input>` - Input file or directory to process
- `[output]` - Output file or directory (optional, defaults to stdout or input location)

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `--output <path>` | Specify output location | Same as input |
| `--format <type>` | Output format (markdown, html, text) | `markdown` |
| `--recursive` | Process directories recursively | `false` |
| `--watch` | Watch for file changes and reprocess | `false` |
| `--include <pattern>` | Include files matching pattern | `**/*.md` |
| `--exclude <pattern>` | Exclude files matching pattern | `node_modules/**` |

**Examples:**
```bash
# Process a single file
petk process template.md

# Process with specific output
petk process input.md output.md

# Process directory recursively
petk process ./templates/ --recursive

# Watch for changes
petk process template.md --watch

# Custom file patterns
petk process ./docs/ --include "**/*.{md,mdx}" --exclude "**/draft/**"
```

### `petk convert`

Convert between different file formats.

**Syntax:**
```bash
petk convert [options] <input> <output>
```

**Arguments:**
- `<input>` - Input file to convert
- `<output>` - Output file path

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `--from <format>` | Source format (auto-detected if not specified) | `auto` |
| `--to <format>` | Target format (inferred from output extension if not specified) | `auto` |
| `--schema <file>` | YAML schema validation file | None |
| `--preserve-structure` | Maintain original file structure in conversion | `true` |

**Supported Formats:**
- `markdown` (`.md`, `.markdown`)
- `yaml` (`.yml`, `.yaml`)
- `json` (`.json`)
- `html` (`.html`, `.htm`)

**Examples:**
```bash
# Convert Markdown to YAML
petk convert document.md document.yaml

# Convert with explicit formats
petk convert --from markdown --to yaml input.md output.yml

# Convert with schema validation
petk convert data.md data.yaml --schema schema.json
```

### `petk init`

Initialize a new Petk project or configuration.

**Syntax:**
```bash
petk init [options] [directory]
```

**Arguments:**
- `[directory]` - Target directory (defaults to current directory)

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `--template <name>` | Use a specific template | `basic` |
| `--force` | Overwrite existing files | `false` |
| `--minimal` | Create minimal configuration | `false` |

**Available Templates:**
- `basic` - Basic Petk configuration
- `docs` - Documentation-focused setup
- `blog` - Blog/content site configuration
- `advanced` - Full-featured configuration with examples

**Examples:**
```bash
# Initialize in current directory
petk init

# Initialize new project
petk init my-project

# Use specific template
petk init --template docs my-docs

# Minimal setup
petk init --minimal
```

### `petk validate`

Validate template files and configuration.

**Syntax:**
```bash
petk validate [options] <input>
```

**Arguments:**
- `<input>` - File or directory to validate

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `--schema <file>` | Custom schema for validation | Built-in schema |
| `--strict` | Enable strict validation mode | `false` |
| `--fix` | Automatically fix common issues | `false` |

**Examples:**
```bash
# Validate single file
petk validate template.md

# Validate directory
petk validate ./templates/

# Strict validation with auto-fix
petk validate ./docs/ --strict --fix
```

### `petk serve`

Start a development server with live reload.

**Syntax:**
```bash
petk serve [options] [directory]
```

**Arguments:**
- `[directory]` - Directory to serve (defaults to current directory)

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `--port <number>` | Server port | `3000` |
| `--host <address>` | Server host | `localhost` |
| `--open` | Open browser automatically | `false` |
| `--livereload` | Enable live reload | `true` |

**Examples:**
```bash
# Start development server
petk serve

# Custom port and host
petk serve --port 8080 --host 0.0.0.0

# Serve specific directory
petk serve ./dist/ --open
```

## Configuration

### Configuration File

Petk looks for configuration in the following files (in order):
1. `petk.config.js`
2. `petk.config.json`
3. `.petkrc`
4. `petk` field in `package.json`

### Configuration Options

```javascript
// petk.config.js
module.exports = {
  // Input/output configuration
  input: './src',
  output: './dist',
  
  // Processing options
  recursive: true,
  include: ['**/*.md', '**/*.mdx'],
  exclude: ['**/node_modules/**', '**/draft/**'],
  
  // Template engine settings
  engine: {
    syntax: 'petk',
    variables: {
      site: {
        title: 'My Site',
        url: 'https://example.com'
      }
    }
  },
  
  // Output formatting
  format: {
    type: 'markdown',
    preserveLineBreaks: true,
    trimWhitespace: true
  },
  
  // Plugin configuration
  plugins: [
    '@petk/plugin-syntax-highlighting',
    '@petk/plugin-table-of-contents'
  ]
};
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PETK_CONFIG` | Path to configuration file | Auto-discover |
| `PETK_LOG_LEVEL` | Log level (debug, info, warn, error) | `info` |
| `PETK_CACHE_DIR` | Cache directory location | `~/.petk/cache` |
| `PETK_NO_COLOR` | Disable colored output | `false` |

## Exit Codes

| Code | Description |
|------|-------------|
| `0` | Success |
| `1` | General error |
| `2` | Configuration error |
| `3` | Input/output error |
| `4` | Validation error |
| `5` | Template processing error |

## Advanced Usage

### Batch Processing

Process multiple files with different configurations:

```bash
# Process multiple file types
petk process "**/*.{md,mdx}" --output ./dist/

# Chain commands
petk process src/ --output temp/ && petk convert temp/*.md dist/ --to html
```

### Integration with Build Tools

```bash
# NPM scripts integration
npm run build:docs && petk process ./docs/ --output ./public/docs/

# CI/CD pipeline
petk validate ./content/ --strict && petk process ./content/ --output ./dist/
```

### Custom Directives

Petk supports custom directive processors through plugins. See the Plugin Development Guide for more information.

## Troubleshooting

For common issues and solutions, see [Common Issues](../problems/common-issues).

For additional help:
- Use `petk <command> --help` for command-specific help
- Check the [GitHub Issues](https://github.com/mihazs/petk/issues) for known problems
- Join our [Discord community](https://discord.gg/petk) for support