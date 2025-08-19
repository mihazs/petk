<div align="center">
<img src="./logo.svg" alt="Petk Logo" width="200" height="200">
<h1>Petk 🏸</h1>
</div>

**Petk** is a comprehensive CLI toolkit for prompt engineering that enables systematic creation, management, and optimization of prompts for Large Language Models (LLMs). Built for professional AI development workflows, Petk provides advanced templating, content assembly, and conversion capabilities.

## 🚀 Quick Start

```bash
# Install Petk globally
npm install -g @petk/cli

# Create your first template
echo '# Hello {{name}}!\n\n<!--{ include: "examples/*.md" }-->' > greeting.md

# Process the template
petk process greeting.md --name "World"

# Convert to YAML for API usage
petk convert greeting.md --to yaml
```

## ⭐ Core Features

### 🧩 **Advanced Template Engine**
- **Conditional Logic:** `<!--{ if: "condition" }-->` blocks for dynamic content
- **Variable Substitution:** `{{variable}}` syntax with nested object support
- **File Inclusion:** Powerful `<!--{ include: "pattern" }-->` directives
- **Glob Patterns:** Advanced file matching with sorting and filtering
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

## 📖 Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `process` | Build templates with variable substitution | `petk process template.md --var value` |
| `convert` | Transform Markdown to YAML/JSON | `petk convert input.md --to yaml` |
| `validate` | Check template syntax and structure | `petk validate templates/` |
| `watch` | Monitor and rebuild templates automatically | `petk watch src/ --output dist/` |
| `config` | Manage project configuration | `petk config set paths.templates ./prompts` |

## 💡 Example: Building a Modular Prompt System

**1. Create a base template (`base-prompt.md`):**
```markdown
# AI Assistant Instructions

You are a helpful AI assistant specialized in {{domain}}.

## Available Tools
<!--{ include: "tools/*.md", order_by: "alphabetical_asc" }-->

## Examples
```markdown
```{petk:include}
path: shared/header.md
```
```
```

**2. Process with variables:**
```bash
petk process base-prompt.md \
  --domain "software-engineering" \
  --task_type "debugging" \
  --include_guidelines true \
  --output final-prompt.md
```

**3. Convert for API usage:**
```bash
petk convert final-prompt.md --to yaml --output prompt-config.yaml
```

## 🛠️ Advanced Features

### Template Syntax Reference

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

```markdown
```{petk:include}
path: shared/header.md
```
```

### Include Directive

The most powerful feature for embedding content from other files.

#### Basic File Inclusion

```markdown
```{petk:include}
path: shared/header.md
```

```{petk:include}
path: templates/card.md
title: My Card
content: Card description
```
```

#### Advanced Glob Patterns

Include multiple files using glob patterns with sorting and filtering:

```markdown
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
```

## 📚 Documentation

- **[Getting Started Guide](https://petk.dev/learning/getting-started)** - Installation and first steps
- **[Template Syntax Reference](https://petk.dev/reference/template-syntax)** - Complete syntax documentation
- **[CLI Reference](https://petk.dev/reference/cli)** - All commands and options
- **[Use Cases & Examples](https://petk.dev/problems/use-cases)** - Real-world prompt engineering scenarios
- **[Architecture Overview](https://petk.dev/explanation/architecture)** - System design and components

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

## Contributing

Contributions are welcome\! Please read our `CONTRIBUTING.md` guide for details on the development process, coding conventions, and how to submit pull requests. This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.