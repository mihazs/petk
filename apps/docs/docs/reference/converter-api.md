---
title: Converter API Reference
sidebar_position: 3
---

# Converter API Reference

Complete reference for Petk's Markdown-to-YAML/JSON converter API. This document covers the converter's advanced capabilities, from basic document transformation to sophisticated multimodal content analysis.

## Overview

The Petk converter transforms Markdown documents into structured YAML or JSON format using advanced AST (Abstract Syntax Tree) analysis. It intelligently detects and preserves different content types while maintaining document structure and relationships.

## Core Conversion Features

### Supported Input Formats

- **Markdown** (`.md`, `.markdown`)
- **Markdown with Frontmatter** (YAML or TOML frontmatter)
- **Rich Markdown** (with embedded HTML, code blocks, tables)

### Supported Output Formats

- **YAML** (`.yml`, `.yaml`)
- **JSON** (`.json`)

### Advanced Content Detection

The converter automatically detects and categorizes:

- **Text Content**: Paragraphs, headings, emphasis
- **Code Blocks**: Language-specific code with syntax detection
- **Tables**: Structured tabular data with headers
- **Lists**: Ordered and unordered lists with nesting
- **Media**: Images, links, and embedded content
- **Metadata**: Frontmatter and document properties

## API Usage

### CLI Interface

Basic conversion using the command line:

```bash
# Simple conversion
petk convert input.md output.yaml

# With explicit format specification
petk convert --from markdown --to yaml input.md output.yml

# With schema validation
petk convert input.md output.yaml --schema schema.json
```

### Programmatic Usage

The converter can be used programmatically in Node.js applications:

```javascript
import { convertMarkdownToYaml, convertMarkdownToJson } from '@petk/converter';

// Basic conversion
const yamlResult = await convertMarkdownToYaml(markdownContent);
const jsonResult = await convertMarkdownToJson(markdownContent);

// With options
const result = await convertMarkdownToYaml(markdownContent, {
  preserveStructure: true,
  includeMetadata: true,
  schemaValidation: schemaConfig
});
```

## Conversion Options

### Core Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `preserveStructure` | boolean | Maintain document hierarchy and nesting | `true` |
| `includeMetadata` | boolean | Include document metadata and frontmatter | `true` |
| `detectMultimodal` | boolean | Enable multimodal content detection | `true` |
| `schemaValidation` | object | Schema validation configuration | `null` |

### Advanced Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `customParsers` | array | Custom content type parsers | `[]` |
| `outputFormat` | string | Detailed output format specification | `auto` |
| `errorHandling` | string | Error handling strategy (`strict`, `lenient`) | `strict` |
| `optimizeOutput` | boolean | Optimize output structure for readability | `true` |

## Multimodal Content Detection

### Content Type Categories

The converter intelligently categorizes content into distinct types:

#### Text Content
```yaml
content:
  - type: heading
    level: 1
    text: "Introduction"
  - type: paragraph
    text: "This is a sample paragraph with **bold** text."
    formatting:
      - type: emphasis
        style: strong
        text: "bold"
```

#### Code Blocks
```yaml
content:
  - type: code_block
    language: javascript
    content: |
      function hello() {
        console.log("Hello, World!");
      }
    metadata:
      syntax_highlighted: true
      line_count: 3
```

#### Tables
```yaml
content:
  - type: table
    headers: ["Name", "Age", "City"]
    rows:
      - ["Alice", "30", "New York"]
      - ["Bob", "25", "San Francisco"]
    metadata:
      column_count: 3
      row_count: 2
```

#### Lists
```yaml
content:
  - type: list
    ordered: false
    items:
      - text: "First item"
      - text: "Second item"
        subitems:
          - text: "Nested item"
```

#### Media Content
```yaml
content:
  - type: image
    src: "path/to/image.jpg"
    alt: "Description"
    title: "Image Title"
  - type: link
    href: "https://example.com"
    text: "Example Link"
```

## Schema Validation

### Basic Schema Configuration

```javascript
const schemaConfig = {
  type: "object",
  properties: {
    title: { type: "string" },
    content: { 
      type: "array",
      items: { type: "object" }
    }
  },
  required: ["title", "content"]
};

const result = await convertMarkdownToYaml(markdown, {
  schemaValidation: schemaConfig
});
```

### Custom Schema Validation

```javascript
const customSchema = {
  type: "object",
  properties: {
    metadata: {
      type: "object",
      properties: {
        author: { type: "string" },
        date: { type: "string", format: "date" },
        tags: { 
          type: "array", 
          items: { type: "string" }
        }
      }
    },
    sections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          heading: { type: "string" },
          content: { type: "array" }
        }
      }
    }
  }
};
```

## Document Structure Preservation

### Hierarchical Content Organization

The converter maintains document hierarchy through intelligent nesting:

**Input Markdown:**
```markdown
# Main Section

## Subsection A
Content for subsection A.

### Detail 1
Detailed information.

## Subsection B
Content for subsection B.
```

**Output YAML:**
```yaml
document:
  title: "Main Section"
  sections:
    - heading: "Subsection A"
      level: 2
      content:
        - type: paragraph
          text: "Content for subsection A."
        - heading: "Detail 1"
          level: 3
          content:
            - type: paragraph
              text: "Detailed information."
    - heading: "Subsection B"
      level: 2
      content:
        - type: paragraph
          text: "Content for subsection B."
```

### Frontmatter Integration

Frontmatter is automatically detected and preserved:

**Input Markdown:**
```markdown
---
title: "Document Title"
author: "John Doe"
date: "2024-01-15"
tags: ["documentation", "api"]
---

# Content
Document content here.
```

**Output YAML:**
```yaml
metadata:
  title: "Document Title"
  author: "John Doe"
  date: "2024-01-15"
  tags: ["documentation", "api"]
content:
  - type: heading
    level: 1
    text: "Content"
  - type: paragraph
    text: "Document content here."
```

## Error Handling and Diagnostics

### Error Types

The converter provides detailed error reporting for various scenarios:

#### Parse Errors
```javascript
{
  type: "ParseError",
  message: "Invalid Markdown syntax at line 15",
  line: 15,
  column: 8,
  context: "Malformed table structure"
}
```

#### Schema Validation Errors
```javascript
{
  type: "ValidationError",
  message: "Schema validation failed",
  errors: [
    {
      path: "content.0.type",
      message: "Required property missing",
      expectedType: "string"
    }
  ]
}
```

#### Conversion Errors
```javascript
{
  type: "ConversionError",
  message: "Unable to convert content type",
  contentType: "unknown_block",
  suggestion: "Use custom parser for this content type"
}
```

### Error Recovery

The converter includes robust error recovery mechanisms:

```javascript
const result = await convertMarkdownToYaml(markdown, {
  errorHandling: "lenient",
  fallbackStrategies: {
    unknownContent: "preserve_as_text",
    malformedTable: "convert_to_list",
    invalidCode: "treat_as_text"
  }
});

// Check for warnings
if (result.warnings.length > 0) {
  console.log("Conversion warnings:", result.warnings);
}
```

## Advanced Features

### Custom Content Parsers

Extend the converter with custom parsers for specialized content:

```javascript
const customParsers = [
  {
    name: "math_block",
    pattern: /^\$\$[\s\S]*?\$\$/,
    parse: (content) => ({
      type: "math",
      latex: content.slice(2, -2).trim(),
      rendered: true
    })
  },
  {
    name: "callout_box",
    pattern: /^> \[!(INFO|WARNING|ERROR)\]/,
    parse: (content) => {
      const type = content.match(/\[!(.*?)\]/)[1];
      return {
        type: "callout",
        level: type.toLowerCase(),
        content: content.replace(/^> \[!.*?\]\s*/, '')
      };
    }
  }
];

const result = await convertMarkdownToYaml(markdown, {
  customParsers: customParsers
});
```

### Pipeline Processing

The converter uses a multi-stage pipeline for processing:

```javascript
const pipelineConfig = {
  stages: [
    "parse_markdown",      // Convert to AST
    "detect_content_types", // Identify content categories  
    "apply_transformations", // Custom transformations
    "validate_schema",     // Schema validation
    "optimize_structure",  // Structure optimization
    "generate_output"      // Final format generation
  ],
  customStages: {
    "custom_processing": (ast) => {
      // Custom processing logic
      return modifiedAst;
    }
  }
};
```

### Batch Conversion

Convert multiple documents efficiently:

```javascript
import { batchConvert } from '@petk/converter';

const files = [
  'docs/intro.md',
  'docs/api.md',
  'docs/examples.md'
];

const results = await batchConvert(files, {
  outputFormat: 'yaml',
  preserveStructure: true,
  parallel: true,
  maxConcurrent: 3
});

// Process results
results.forEach((result, index) => {
  if (result.success) {
    console.log(`Converted ${files[index]} successfully`);
  } else {
    console.error(`Failed to convert ${files[index]}:`, result.error);
  }
});
```

## Performance Optimization

### Caching and Memory Management

```javascript
const converter = new MarkdownConverter({
  caching: {
    enabled: true,
    maxSize: 100, // Cache up to 100 documents
    ttl: 300000   // 5 minute TTL
  },
  memory: {
    maxMemoryUsage: '512MB',
    garbageCollection: 'aggressive'
  }
});
```

### Streaming for Large Documents

```javascript
import { createConversionStream } from '@petk/converter';

const stream = createConversionStream({
  format: 'yaml',
  chunkSize: '1MB'
});

fs.createReadStream('large-document.md')
  .pipe(stream)
  .pipe(fs.createWriteStream('output.yaml'));
```

## Integration Examples

### Express.js API Endpoint

```javascript
import express from 'express';
import { convertMarkdownToYaml } from '@petk/converter';

const app = express();

app.post('/convert', async (req, res) => {
  try {
    const { markdown, options } = req.body;
    const result = await convertMarkdownToYaml(markdown, options);
    
    res.json({
      success: true,
      data: result.content,
      metadata: result.metadata
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});
```

### Build Tool Integration

```javascript
// webpack.config.js
const MarkdownConverterPlugin = require('@petk/converter/webpack-plugin');

module.exports = {
  plugins: [
    new MarkdownConverterPlugin({
      input: 'src/docs/**/*.md',
      output: 'dist/api-docs.yaml',
      options: {
        preserveStructure: true,
        includeMetadata: true
      }
    })
  ]
};
```

### GitHub Actions Workflow

```yaml
name: Convert Documentation
on: [push]

jobs:
  convert:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install -g petk
      - run: |
          find docs/ -name "*.md" -exec petk convert {} {}.yaml \;
      - run: |
          petk convert README.md api-docs.json --schema schema.json
```

## Troubleshooting

### Common Issues

**Large Document Performance:**
```bash
# Use streaming for large files
petk convert large-doc.md output.yaml --stream --chunk-size 1MB
```

**Complex Table Conversion:**
```bash
# Enable table optimization
petk convert tables.md output.yaml --optimize-tables --preserve-formatting
```

**Custom Content Types:**
```bash
# Use lenient parsing for unknown content
petk convert mixed-content.md output.yaml --error-handling lenient
```

### Debug Mode

Enable detailed logging for troubleshooting:

```bash
# CLI debug mode
DEBUG=petk:converter petk convert input.md output.yaml

# Programmatic debug mode
const result = await convertMarkdownToYaml(markdown, {
  debug: true,
  verboseLogging: true
});
```

## Migration from Other Converters

### From Pandoc

```bash
# Pandoc
pandoc input.md -o output.yaml

# Petk equivalent
petk convert input.md output.yaml --preserve-structure
```

### From remark

```javascript
// remark
import { remark } from 'remark';
import remarkYaml from 'remark-yaml';

const result = remark().use(remarkYaml).process(markdown);

// Petk equivalent
import { convertMarkdownToYaml } from '@petk/converter';

const result = await convertMarkdownToYaml(markdown, {
  preserveStructure: true,
  detectMultimodal: true
});
```

This converter API provides powerful, flexible document transformation capabilities for modern documentation workflows and content management systems.