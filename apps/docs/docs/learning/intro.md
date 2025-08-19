---
title: Introduction to Petk
sidebar_position: 1
---

# Introduction to Petk

Welcome to **Petk**, a powerful template toolkit designed to streamline your template processing workflows. This guide will help you get started with Petk and understand its core concepts.

## What is Petk?

Petk is a comprehensive template engine and processing toolkit that enables developers to:

- Process Markdown files with dynamic content inclusion
- Convert between Markdown and YAML formats
- Apply template transformations with powerful directive blocks
- Manage complex template hierarchies and dependencies

## Getting Started

### Installation

Install Petk using your preferred package manager:

```bash
# Using npm
npm install -g petk

# Using pnpm
pnpm install -g petk

# Using yarn
yarn global add petk
```

### Your First Template

1. Create a new Markdown file called `example.md`:

````markdown
# My First Template

This is a basic template that will be processed by Petk.

```{petk:include}
path: header.md
```

Welcome to the content section!

```{petk:include}
path: footer.md
```
````

2. Create the included files:

**header.md:**
```markdown
## Header Section
This content is included from another file.
```

**footer.md:**
```markdown
---
*Footer content goes here*
```

3. Process the template:

```bash
petk process example.md
```

## Core Concepts

### Template Directives

Petk uses special directive blocks to control template processing:

- `{petk:include}` - Include content from other files
- `{petk:config}` - Set processing configuration
- `{petk:transform}` - Apply transformations to content

### File Processing

Petk can process individual files or entire directories:

```bash
# Process a single file
petk process template.md

# Process all files in a directory
petk process ./templates/

# Convert formats
petk convert input.md output.yaml
```

## Next Steps

- Learn about [CLI commands](../reference/cli) for detailed usage
- Explore [common troubleshooting](../problems/common-issues) solutions
- Understand the [architectural concepts](../explanation/) behind Petk

## Quick Reference

| Command | Description |
|---------|-------------|
| `petk process <file>` | Process a template file |
| `petk convert <input> <output>` | Convert between formats |
| `petk --help` | Show available commands |
| `petk --version` | Display version information |

Ready to dive deeper? Check out our comprehensive [CLI reference](../reference/cli) for all available commands and options.