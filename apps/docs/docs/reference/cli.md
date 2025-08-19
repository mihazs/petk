---
title: CLI Reference
sidebar_position: 1
---

# CLI Reference

Complete command-line interface reference for Petk. This document provides detailed information about all available commands, options, and usage patterns based on the current implementation status.

## Global Options

These options are available for all Petk commands:

| Option | Short | Description |
|--------|-------|-------------|
| `--help` | `-h` | Show help information |
| `--version` | `-V` | Display version number |
| `--verbose` | `-v` | Enable verbose output |
| `--quiet` | `-q` | Suppress non-error output |
| `--config <file>` | `-c` | Specify configuration file |

## Implemented Commands

### `petk process`

**Status:** ✅ Fully Implemented

Process template files with Petk directives using the template engine.

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

**Template Engine Features:**
- **Variable Substitution**: Replace `{{variable}}` with values from config or CLI
- **Include Blocks**: Embed content from other files using `<!--{ include: "path/to/file.md" }-->`
- **Conditional Blocks**: Show/hide content based on conditions
- **Loop Blocks**: Repeat content for arrays of data
- **Advanced Glob Patterns**: Complex file inclusion with sorting options
- **Deterministic Sampling**: Consistent random file selection
- **Recursive Resolution**: Handle nested includes with cycle detection

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

**Status:** ✅ Fully Implemented

Convert Markdown files to YAML or JSON format using the advanced converter.

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

**Converter Features:**
- **Intelligent Parsing**: Advanced Markdown AST analysis
- **Multimodal Detection**: Automatic detection of code blocks, tables, lists, and media
- **Structure Preservation**: Maintains document hierarchy and relationships
- **Schema Validation**: Optional YAML schema validation
- **Error Recovery**: Robust error handling with detailed diagnostics
- **Metadata Extraction**: Extracts frontmatter and document properties

**Supported Formats:**
- `markdown` (`.md`, `.markdown`) - Input format
- `yaml` (`.yml`, `.yaml`) - Output format
- `json` (`.json`) - Output format

**Examples:**
```bash
# Convert Markdown to YAML
petk convert document.md document.yaml

# Convert with explicit formats
petk convert --from markdown --to yaml input.md output.yml

# Convert with schema validation
petk convert data.md data.yaml --schema schema.json
```

## Planned Commands

The following commands are planned for future releases but not yet implemented:

### `petk init` 

**Status:** 🚧 Planned

Initialize a new Petk project or configuration.

**Note:** This command is currently a placeholder. Implementation is planned for future releases.

### `petk validate`

**Status:** 🚧 Planned

Validate template files and configuration.

**Note:** This command is currently a placeholder. Implementation is planned for future releases.

### `petk serve`

**Status:** 🚧 Planned

Start a development server with live reload.

**Note:** This command is currently a placeholder. Implementation is planned for future releases.

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
  }
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

### Template Processing Examples

**Basic Variable Substitution:**
```markdown
# Welcome to {{site.title}}

This site is hosted at {{site.url}}.
```

**File Inclusion:**
```markdown
<!-- Include entire file -->
<!--{ include: "shared/header.md" }-->

<!-- Include with variables -->
<!--{ include: "templates/card.md", title: "My Card", content: "Card content" }-->
```

**Complex Glob Patterns:**
```markdown
<!-- Include all markdown files, sorted by last modified -->
<!--{ 
  include: "posts/**/*.md",
  order_by: "last_updated_desc",
  limit: 10
}-->
```

### Conversion Examples

**Markdown to YAML Conversion:**
```bash
# Convert blog post to structured data
petk convert blog-post.md blog-post.yaml

# Convert with custom schema validation
petk convert content.md output.yaml --schema content-schema.json
```

### Integration with Build Tools

```bash
# NPM scripts integration
npm run build:docs && petk process ./docs/ --output ./public/docs/

# Process templates then convert to YAML
petk process src/templates/ --output temp/ && petk convert temp/*.md dist/
```

## Implementation Status

| Command | Status | Core Features | Advanced Features |
|---------|--------|---------------|-------------------|
| `process` | ✅ Complete | Template processing, variable substitution | Advanced globbing, deterministic sampling |
| `convert` | ✅ Complete | Markdown to YAML/JSON conversion | Multimodal detection, schema validation |
| `init` | 🚧 Planned | Project initialization | Template selection |
| `validate` | 🚧 Planned | Template validation | Schema validation |
| `serve` | 🚧 Planned | Development server | Live reload |

## Troubleshooting

### Common Issues

**Template Processing Errors:**
- Ensure all included files exist and are accessible
- Check for circular include dependencies
- Verify variable names and syntax

**Conversion Errors:**
- Validate input Markdown syntax
- Check file permissions for input/output files
- Ensure output directory exists

For additional help:
- Use `petk <command> --help` for command-specific help
- Check the [GitHub Issues](https://github.com/mihazs/petk/issues) for known problems
- Review the [Template Syntax Reference](./template-syntax) for template engine details

## Development Status

Petk is actively developed with a focus on prompt engineering workflows. The core template processing and conversion functionality is complete and production-ready. Additional commands and features are planned based on user feedback and requirements.