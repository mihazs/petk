<!-- 
SEO Metadata:
Page Title: Petk - Advanced CLI Toolkit for Prompt Engineering | Template Engine & Content Assembly
Meta Description: Professional CLI toolkit for LLM prompt engineering. Advanced templating, content assembly, and Markdown-to-YAML conversion for AI workflows.
Keywords: prompt engineering, CLI toolkit, template engine, LLM tools, markdown to yaml, AI development, content assembly, prompt templates
Open Graph Title: Petk - Professional Prompt Engineering CLI Toolkit
Open Graph Description: Build, manage, and optimize prompts for Large Language Models with advanced templating and content assembly capabilities.
-->

<div align="center">
<img src="./logo.svg" alt="Petk Logo" width="200" height="200">
<h1>Petk 🏸</h1>

[![Build Status](https://img.shields.io/github/actions/workflow/status/mihazs/petk/ci.yml?branch=main)](https://github.com/mihazs/petk/actions)
[![NPM Version](https://img.shields.io/npm/v/petk?color=blue)](https://www.npmjs.com/package/petk)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![Documentation](https://img.shields.io/badge/docs-available-brightgreen.svg)](https://petk.dev/docs)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

**Professional CLI toolkit for prompt engineering that enables systematic creation, management, and optimization of prompts for Large Language Models with advanced templating capabilities.**

[🚀 Get Started](#-installation) • [https://petk.dev/docs 📖 Documentation](https://petk.dev/docs) • [🎯 Examples](#-example-building-a-modular-prompt-system) • [🏗️ Architecture](#-project-structure)

</div>

## 📑 Table of Contents

- [🚀 Installation](#-installation)
- [⚡ Quick Start](#-quick-start)
- [⭐ Core Features](#-core-features)
- [📖 CLI Commands](#-cli-commands)  
- [💡 Example: Building a Modular Prompt System](#-example-building-a-modular-prompt-system)
- [🛠️ Advanced Template Syntax](#-advanced-template-syntax)
- [📚 Documentation](#-documentation)
- [🎯 Why Petk for Prompt Engineering?](#-why-petk-for-prompt-engineering)
- [🏗️ Project Structure](#-project-structure)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## 🚀 Installation

Install Petk using your preferred package manager:

```bash
# Using npm
npm install -g petk

# Using pnpm (recommended)
pnpm add -g petk

# Using yarn
yarn global add petk
```

## ⚡ Quick Start

Create your first template and process it in minutes:

````bash
# Create your first template
echo '# Hello {{name}}!

```{petk:include}
path: examples/greeting.md
```

Welcome to prompt engineering!' > greeting.md
````

# Process the template
```bash
petk process greeting.md --name "World"
```

# Convert to YAML for API usage
```bash
petk convert greeting.md --to yaml
```

## ⭐ Core Features

### 🧩 **Advanced Template Engine**
- **Conditional Logic:** Dynamic content with intelligent processing
- **Variable Substitution:** `{{variable}}` syntax with nested object support  
- **File Inclusion:** Powerful file embedding with `{petk:include}` directive blocks
- **Glob Patterns:** Advanced file matching with sorting and filtering capabilities
- **Recursive Resolution:** Templates can include other templates seamlessly

### 📁 **Intelligent Content Assembly**
- **Smart Sorting:** Alphabetical, chronological, and file-size based ordering
- **Deterministic Sampling:** Reproducible random content selection with seed control
- **Cycle Detection:** Prevents infinite recursion in template dependencies
- **Content Filtering:** Include/exclude files based on patterns and criteria

### 🔄 **Multi-Format Conversion**
- **Markdown to YAML:** Convert templates to LLM-ready configuration files
- **Multimodal Support:** Handle text, code blocks, and structured content
- **AST Processing:** Advanced Markdown parsing and transformation
- **Schema Validation:** Ensure output meets API requirements

### ⚡ **Professional Workflow Tools**
- **Watch Mode:** Real-time template processing during development
- **Template Validation:** Syntax checking and error reporting
- **Configuration Management:** Project-wide settings and path aliases
- **Performance Optimized:** Fast processing of large template collections

## 📖 CLI Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `process` | Build templates with variable substitution | `petk process template.md --var value` |
| `convert` | Transform Markdown to YAML/JSON | `petk convert input.md --to yaml` |
| `validate` | Check template syntax and structure | `petk validate templates/` |
| `watch` | Monitor and rebuild templates automatically | `petk watch src/ --output dist/` |
| `config` | Manage project configuration | `petk config set paths.templates ./prompts` |

## 💡 Example: Building a Modular Prompt System

**1. Create a base template (`base-prompt.md`):**

````markdown
# AI Assistant Instructions

You are a helpful AI assistant specialized in {{domain}}.

## Available Tools

```{petk:include}
glob: tools/**/*.md
order_by: alphabetical_asc
```

## Context Guidelines

```{petk:include}
path: shared/guidelines.md
```

## Examples

```{petk:include}
glob: examples/{{domain}}/*.md
limit: 3
order_by: last_updated_desc
```
````

**2. Process with variables:**

```bash
petk process base-prompt.md \
  --domain "software-engineering" \
  --output final-prompt.md
```

**3. Convert for API usage:**

```bash
petk convert final-prompt.md --to yaml --output prompt-config.yaml
```

## 🛠️ Advanced Template Syntax

### Variable Substitution

Variables are enclosed in double curly braces and support nested objects:

```markdown
# Welcome to {{site.title}}

This project is maintained by {{author.name}} ({{author.email}}).
Current version: {{version}}
```

### Directive Blocks

Directives use fenced code blocks with YAML syntax:

#### Basic File Inclusion

````markdown
```{petk:include}
path: shared/header.md
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

## 📚 Documentation

- **[Getting Started Guide](https://petk.dev/docs/learning/getting-started)** - Installation and first steps
- **[Template Syntax Reference](https://petk.dev/docs/reference/template-syntax)** - Complete syntax documentation  
- **[CLI Reference](https://petk.dev/docs/reference/cli)** - All commands and options
- **[Use Cases & Examples](https://petk.dev/docs/problems/use-cases)** - Real-world prompt engineering scenarios
- **[Architecture Overview](https://petk.dev/docs/explanation/architecture)** - System design and components

## 🎯 Why Petk for Prompt Engineering?

**Traditional Challenges:**
- ❌ Manual copy-paste of prompt components
- ❌ No version control for prompt variations
- ❌ Difficult to maintain consistency across projects
- ❌ Hard to test different prompt combinations
- ❌ No systematic approach to prompt optimization

**Petk Solutions:**
- ✅ **Modular Design:** Reusable components and systematic organization
- ✅ **Version Control Friendly:** Git-ready Markdown format
- ✅ **Systematic Testing:** Deterministic template generation for A/B testing
- ✅ **Professional Workflows:** Watch mode, validation, and automation
- ✅ **Team Collaboration:** Shared patterns and standardized approaches

## 🏗️ Project Structure

Petk is built as a modern TypeScript monorepo:

```
petk/
├── apps/
│   ├── cli/           # Main CLI application
│   └── docs/          # Documentation site
├── packages/
│   ├── engine/        # Template processing engine
│   ├── converter/     # Markdown-to-YAML converter
│   └── utils/         # Shared utilities
└── docs/              # Documentation source
```

## 🤝 Contributing

Contributions are welcome! Please read our `CONTRIBUTING.md` guide for details on the development process, coding conventions, and how to submit pull requests. This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification.

**Ready to contribute?** [📖 Read our Contributing Guide](https://petk.dev/docs/explanation/contributing) and [🚀 Get started with development](https://petk.dev/docs/learning/development-setup).

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

---

<div align="center">

**[🚀 Get Started](#-installation)** • **[https://petk.dev/docs 📖 View Documentation](https://petk.dev/docs)** • **[🐛 Report Issues](https://github.com/mihazs/petk/issues)**

Made with ❤️ for the AI development community

</div>