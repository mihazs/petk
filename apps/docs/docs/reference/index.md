---
sidebar_position: 3
---

# Reference Documentation

This section provides comprehensive technical reference material for Petk. Use this when you need to look up specific APIs, configuration options, or technical specifications.

## API Reference

### CLI Commands
- **`petk process`** - Process templates with various options and flags
- **`petk validate`** - Validate template syntax and configuration
- **`petk config`** - Manage configuration files and settings
- **`petk convert`** - Convert Markdown to YAML format

### Template Engine API
- **Template Processing** - Core template engine functions and methods
- **Include Directives** - Dynamic content inclusion syntax and options
- **Variable Handling** - Variable resolution and substitution
- **Filter Functions** - Built-in template filters and transformations

### Converter API
- **Markdown Parser** - Markdown-to-AST conversion functions
- **YAML Generator** - AST-to-YAML serialization methods
- **Schema Validation** - Output format validation and verification
- **Custom Processors** - Extension points for custom processing

## Configuration Reference

### Project Configuration
- **`config.yaml`** - Main project configuration file format
- **Environment Variables** - Supported environment variable overrides
- **File Discovery** - Configuration file resolution and precedence
- **Validation Rules** - Configuration validation constraints

### Template Configuration
- **Frontmatter** - Template metadata and configuration options
- **Global Variables** - Project-wide variable definitions
- **Include Patterns** - File inclusion and exclusion patterns
- **Processing Options** - Template processing behavior settings

### Build Integration
- **Turborepo Configuration** - Monorepo build system integration
- **Package Scripts** - Standard npm/pnpm script definitions
- **CI/CD Variables** - Environment-specific configuration options
- **Output Specifications** - Build artifact and output configuration

## Technical Specifications

### File Formats
- **Template Syntax** - Complete template language specification
- **YAML Schema** - Output format schema definitions
- **Markdown Extensions** - Supported Markdown syntax and extensions
- **Configuration Schema** - JSON Schema for configuration validation

### Architecture Reference
- **Package Structure** - Monorepo package organization and dependencies
- **Module Exports** - Public API surface and module interfaces
- **Type Definitions** - TypeScript type definitions and interfaces
- **Error Codes** - Standardized error codes and messages

### Performance Specifications
- **Memory Usage** - Memory consumption guidelines and limits
- **Processing Speed** - Performance benchmarks and expectations
- **File Size Limits** - Maximum supported file and template sizes
- **Concurrency** - Parallel processing capabilities and limitations

## Command Line Interface

### Global Options
```bash
petk [command] [options]

Global Options:
  --config, -c    Configuration file path
  --verbose, -v   Enable verbose logging
  --help, -h      Show help information
  --version       Show version information
```

### Command Specifications
```bash
# Process templates
petk process [template] [options]
  --output, -o    Output directory
  --dry-run      Preview without writing files
  --watch, -w    Watch for file changes

# Validate syntax
petk validate [file] [options]
  --schema       Schema validation mode
  --strict       Strict validation rules

# Convert files
petk convert [input] [options]
  --format       Output format (yaml|json)
  --preserve     Preserve original formatting
```

## Package Information

### Core Packages
- **`@petk/engine`** - Template processing engine
- **`@petk/converter`** - Markdown-to-YAML converter
- **`@petk/cli`** - Command-line interface
- **`@petk/utils`** - Shared utility functions

### Dependencies
- **Node.js** - Minimum version 18.0.0
- **TypeScript** - Version 5.0.0 or higher
- **Required Dependencies** - Core runtime dependencies list
- **Optional Dependencies** - Enhanced functionality dependencies

---

**Need examples?** Check our [Learning](../learning/) section for step-by-step tutorials, or visit [Problems](../problems/) for specific implementation solutions.