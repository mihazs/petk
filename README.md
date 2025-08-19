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
<!--{
  include: "examples/{{domain}}/*.md",
  limit: 3,
  order_by: "last_updated_desc"
}-->

<!--{ if: "include_guidelines" }-->
## Guidelines
<!--{ include: "guidelines/{{domain}}-guidelines.md" }-->
<!--{ endif }-->

Now, please help the user with their {{task_type}} task.
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
```markdown
<!-- Variable substitution -->
Hello {{user.name}}! Today is {{date.formatted}}.

<!-- File inclusion with options -->
<!--{
  include: "components/**/*.md",
  order_by: "alphabetical_asc",
  limit: 5,
  separator: "\n---\n"
}-->

<!-- Conditional blocks -->
<!--{ if: "user.premium" }-->
Premium features are available!
<!--{ elif: "user.trial" }-->
Trial features are limited.
<!--{ else }-->
Please upgrade to access more features.
<!--{ endif }-->

<!-- Random sampling with deterministic results -->
<!--{
  include: "examples/*.md",
  order_by: "random",
  seed: 42,
  limit: 3
}-->
```

### Configuration Example (`petk.config.yaml`)
```yaml
paths:
  templates: "./prompts"
  components: "./components"
  output: "./dist"

defaults:
  separator: "\n\n---\n\n"
  order_by: "alphabetical_asc"

variables:
  company: "Acme Corp"
  version: "1.0.0"
  
aliases:
  tools: "components/tools"
  examples: "examples/production"
```

## 📚 Documentation

- **[Getting Started Guide](https://mihazs.github.io/petk/learning/getting-started)** - Installation and first steps
- **[Template Syntax Reference](https://mihazs.github.io/petk/reference/template-syntax)** - Complete syntax documentation
- **[CLI Reference](https://mihazs.github.io/petk/reference/cli)** - All commands and options
- **[Use Cases & Examples](https://mihazs.github.io/petk/problems/use-cases)** - Real-world prompt engineering scenarios
- **[Architecture Overview](https://mihazs.github.io/petk/explanation/architecture)** - System design and components

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