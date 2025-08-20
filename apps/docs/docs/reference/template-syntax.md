---
title: Template Syntax Reference
sidebar_position: 2
---

# Template Syntax Reference

Complete reference for Petk's template engine syntax and directives. This document covers all available template features, from basic variable substitution to advanced file inclusion patterns.

## Overview

Petk uses a powerful template engine that processes Markdown files with embedded directives. The engine supports variable substitution, file inclusion, conditional logic, loops, and advanced file globbing patterns.

## Basic Syntax

### Variable Substitution

Variables are enclosed in double curly braces and can be simple values or nested objects:

```markdown
# Welcome to {{site.title}}

This project is maintained by {{author.name}} ({{author.email}}).
Current version: {{version}}
```

**Configuration Example:**
```javascript
// petk.config.js
module.exports = {
  engine: {
    variables: {
      site: {
        title: "My Project",
        url: "https://example.com"
      },
      author: {
        name: "John Doe",
        email: "john@example.com"
      },
      version: "1.0.0"
    }
  }
};
```

## Directive Blocks

Directives are embedded in markdown code blocks using YAML syntax:

````markdown
```{petk:include}
path: shared/header.md
```
````

### Include Directive

The most powerful feature for embedding content from other files.

#### Basic File Inclusion

````markdown
```{petk:include}
path: shared/header.md
```

```{petk:include}
path: templates/card.md
title: My Card
content: Card description
```
````

#### Advanced Glob Patterns

Include multiple files using glob patterns with sorting and filtering:

````markdown
```{petk:include}
glob: posts/**/*.md
order_by: alphabetical_asc
```

```{petk:include}
glob: blog/**/*.md
order_by: last_updated_desc
limit: 5
```

```{petk:include}
glob: examples/**/*.md
order_by: random
seed: 12345
limit: 3
```
````

#### Sorting Options

| Sort Method | Description |
|------------|-------------|
| `alphabetical_asc` | Sort files alphabetically A-Z |
| `alphabetical_desc` | Sort files alphabetically Z-A |
| `last_updated_asc` | Sort by modification date, oldest first |
| `last_updated_desc` | Sort by modification date, newest first |
| `random` | Random order (use with `seed` for deterministic results) |

#### Include Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `include` | string | File path or glob pattern | Required |
| `order_by` | string | Sorting method | `alphabetical_asc` |
| `limit` | number | Maximum files to include | No limit |
| `seed` | number | Random seed for deterministic sampling | Random |

### Conditional Directive

Show or hide content based on conditions:

````markdown
```{petk:if}
condition: environment === 'development'
```
This content only appears in development mode.

```{petk:if}
condition: user.role === 'admin'
```
# Admin Panel
Administrative content here.
````

### Variable Directive

Define and use variables within templates:

````markdown
```{petk:var}
name: user_count
value: 42
```
````

**Configuration Example:**
```javascript
module.exports = {
  engine: {
    variables: {
      users: [
        { name: "Alice", email: "alice@example.com", role: "admin" },
        { name: "Bob", email: "bob@example.com", role: "user" }
      ]
    }
  }
};
```

## Advanced Features

### Recursive File Inclusion

The template engine automatically handles nested includes with cycle detection:

````markdown
# Main Document
```{petk:include}
path: sections/intro.md
```

## Introduction
```{petk:include}
path: shared/welcome.md
```
This creates a nested inclusion hierarchy.
````

**Cycle Detection:** The engine prevents infinite loops by detecting circular include dependencies and reporting clear error messages.

### Complex Glob Patterns

Advanced file selection using glob patterns:

````markdown
```{petk:include}
glob: "**/*.md"
exclude: "**/draft/**"
```

```{petk:include}
glob: "{docs,guides,tutorials}/**/*.{md,mdx}"
```

```{petk:include}
glob: "content/**/*.md"
order_by: "last_updated_desc"
limit: 10
exclude: "{drafts,archive}/**"
```
````

### Deterministic Sampling

Generate consistent random selections using seeds:

````markdown
```{petk:include}
glob: "examples/**/*.md"
order_by: "random"
seed: 42
limit: 3
```
````

This is useful for:
- Consistent documentation builds
- Reproducible example selections
- Testing with stable random samples

### Variable Context in Includes

Pass variables to included files for dynamic content:

````markdown
```{petk:include}
path: "templates/feature.md"
name: "Authentication"
status: "stable"
version: "2.1.0"
```
````

**templates/feature.md:**
````markdown
## {{name}} Feature

**Status:** {{status}}  
**Version:** {{version}}

This feature provides...
````

## Configuration Integration

### Engine Configuration

Configure the template engine in your Petk configuration:

```javascript
// petk.config.js
module.exports = {
  engine: {
    // Global variables available to all templates
    variables: {
      site: {
        title: "My Documentation",
        version: "1.0.0"
      },
      build: {
        date: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development"
      }
    },
    
    // Template processing options
    options: {
      preserveLineBreaks: true,
      trimWhitespace: false
    }
  }
};
```

### CLI Variable Override

Override configuration variables via CLI:

```bash
# Set variables via CLI
petk process template.md --variable site.title="Override Title"

# Multiple variables
petk process docs/ --variable version=2.0.0 --variable env=production
```

## Error Handling

The template engine provides detailed error reporting:

### Common Errors

**Missing Variable:**
```
Error: Variable 'user.name' not found in template context
At: line 15, column 8 in 'templates/profile.md'
```

**Circular Include:**
```
Error: Circular include dependency detected
Path: main.md -> intro.md -> welcome.md -> main.md
```

**File Not Found:**
```
Error: Include file not found: 'missing-file.md'
Referenced in: 'templates/layout.md' at line 10
```

### Best Practices

1. **Always Define Variables:** Ensure all variables used in templates are defined in configuration
2. **Use Absolute Paths:** Prefer absolute paths for includes to avoid confusion
3. **Test Include Paths:** Verify all included files exist before processing
4. **Limit Recursion:** Keep include hierarchies manageable to avoid complexity

## Performance Considerations

### Glob Pattern Optimization

````markdown
```{petk:include}
glob: "docs/api/**/*.md"
```

```{petk:include}
glob: "**/**/**/*.md"
```
````

### Caching

The template engine caches file reads and glob results for better performance during:
- Watch mode operations
- Repeated processing of the same files
- Large directory traversals

### Memory Management

For large projects:
- Use `limit` parameter with glob patterns
- Process directories incrementally rather than all at once
- Consider excluding large directories with `exclude` patterns

## Integration Examples

### Documentation Site

````markdown
```{petk:include}
path: "shared/header.md"
title: "{{site.title}}"
version: "{{version}}"
```

# \{\{page.title\}\}

```{petk:include}
glob: "content/**/*.md"
order_by: "alphabetical_asc"
```

```{petk:include}
path: "shared/footer.md"
```
````

### Blog Generation

````markdown
# Latest Posts

```{petk:include}
glob: "posts/**/*.md"
order_by: "last_updated_desc"
limit: 5
```

# Archive

```{petk:include}
glob: "posts/**/*.md"
order_by: "last_updated_desc"
```
````

### Code Documentation

````markdown
# API Reference

```{petk:include}
glob: "api-docs/**/*.md"
order_by: "alphabetical_asc"
```

# Examples

```{petk:include}
glob: "examples/**/*.md"
order_by: "random"
seed: 1234
limit: 3
```
````

## Migration from Other Template Engines

### From Handlebars

```handlebars
<!-- Handlebars -->
{{#each users}}
  <li>{{name}} - {{email}}</li>
{{/each}}
```

**Petk equivalent:**
````markdown
```{petk:for}
user: users
```
- {{user.name}} - {{user.email}}
```{petk:endfor}
```
`````

### From Jekyll/Liquid

```liquid
<!-- Jekyll/Liquid -->
{% include header.html title="My Site" %}
{% for post in site.posts limit:5 %}
  {{ post.title }}
{% endfor %}
```

````markdown
```{petk:include}
path: "shared/header.md"
title: "My Site"
```

```{petk:include}
glob: "posts/**/*.md"
limit: 5
```
````

## Debugging Templates

### Verbose Mode

Use verbose output to debug template processing:

```bash
petk process template.md --verbose
```

### Template Validation

Validate template syntax before processing:

```bash
petk validate template.md
```

### Common Debug Techniques

1. **Check Variable Context:** Verify all variables are properly defined
2. **Test Includes Individually:** Process included files separately to isolate issues
3. **Validate Glob Patterns:** Use shell glob expansion to test patterns
4. **Review Error Stack Traces:** Follow the include chain in error messages

This template syntax provides the foundation for powerful, maintainable documentation and content generation workflows with Petk.