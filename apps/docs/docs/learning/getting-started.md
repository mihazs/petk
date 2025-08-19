---
sidebar_position: 1
---

# Getting Started with Petk

This guide will walk you through installing Petk and creating your first template. By the end, you'll have a working understanding of Petk's core functionality for prompt engineering workflows.

## Prerequisites

Before installing Petk, ensure you have:

- **Node.js**: Version 18.0.0 or higher
- **Package Manager**: npm, pnpm, or yarn

You can check your Node.js version:
```bash
node --version
```

If you need to install or update Node.js, visit [nodejs.org](https://nodejs.org/) for the latest LTS version.

## Installation

### Global Installation (Recommended)

Install Petk globally to use it from anywhere:

```bash
npm install -g petk
```

Verify the installation:
```bash
petk --version
```

### Local Project Installation

For project-specific usage, install Petk as a development dependency:

```bash
npm install --save-dev petk
```

Then use with npx:
```bash
npx petk --version
```

## Your First Petk Project

### 1. Initialize a New Project

Create a new directory and initialize it with Petk:

```bash
mkdir my-prompts
cd my-prompts
petk init
```

This creates a basic project structure with:
- `petk.config.yaml` - Configuration file
- `templates/` - Directory for your template files
- `output/` - Directory for processed output

### 2. Understanding the Configuration

The generated `petk.config.yaml` contains default settings:

```yaml
# Template processing configuration
input_dir: "./templates"
output_dir: "./output"
variables:
  project_name: "My Prompt Project"
  author: "Your Name"
```

You can customize these settings for your project needs.

### 3. Create Your First Template

Create a simple template file at `templates/welcome.md`:

```markdown
# Welcome to {{project_name}}

This is a template created by {{author}}.

```{petk:include}
path: snippets/common-instructions.md
```

## Project Overview
This project demonstrates Petk's template processing capabilities.
```

Create the included snippet at `templates/snippets/common-instructions.md`:

```markdown
## Common Instructions

- Follow the established patterns
- Maintain consistency across all prompts
- Include proper error handling
```

### 4. Process Your Template

Run Petk to process your template:

```bash
petk process
```

This processes all templates in your input directory and generates output files in the output directory.

Check the result in `output/welcome.md`:

```markdown
# Welcome to My Prompt Project

This is a template created by Your Name.

## Common Instructions

- Follow the established patterns
- Maintain consistency across all prompts
- Include proper error handling

## Project Overview
This project demonstrates Petk's template processing capabilities.
```

## Key Commands Overview

Here are the essential Petk commands to get you started:

### Process Templates
```bash
petk process [input] [output]
```
Process templates with variable substitution and includes.

### Watch Mode
```bash
petk watch
```
Automatically reprocess templates when files change - perfect for development.

### Validate Templates
```bash
petk validate [path]
```
Check templates for syntax errors and potential issues.

### Convert Documents
```bash
petk convert input.md output.yaml
```
Convert Markdown files to structured YAML format.

## Understanding Template Features

### Variable Substitution
Use `{{variable_name}}` syntax in your templates. Variables are defined in `petk.config.yaml` or passed via command line.

### Include Blocks
Use markdown code blocks with the `{petk:include}` directive to dynamically include content from other files.

### Advanced Includes
Petk supports sophisticated include patterns:
```markdown
```{petk:include}
glob: "examples/*.md"
order_by: "last_updated_desc"
limit: 5
```
```

## Development Workflow

### 1. Template-First Approach
Start by creating your template structure before adding complex logic.

### 2. Use Watch Mode
Run `petk watch` during development for automatic reprocessing.

### 3. Validate Regularly
Use `petk validate` to catch issues early in your development process.

### 4. Organize with Includes
Break complex templates into reusable components using includes.

## Configuration Options

### Basic Configuration
```yaml
input_dir: "./templates"
output_dir: "./output"
variables:
  project_name: "My Project"
  version: "1.0.0"
```

### Advanced Options
```yaml
# Template processing settings
max_depth: 10          # Maximum include depth
enable_sampling: false # Enable deterministic sampling
watch_extensions: [".md", ".yaml", ".txt"]
```

## Next Steps

Now that you have Petk running:

1. **Explore Template Syntax**: Learn about advanced template features in our [Template Syntax Reference](../reference/template-syntax.md)

2. **Try Real Examples**: Check out [Use Cases](../problems/use-cases.md) for prompt engineering scenarios

3. **Create Your First Template**: Follow our [First Template Tutorial](./first-template.md) for a hands-on example

4. **Understand the Architecture**: Read about [Petk's Design](../explanation/architecture.md) to understand how it works

## Getting Help

If you encounter issues:

1. **Check Documentation**: Browse our comprehensive [Reference](../reference/) section
2. **Validate Templates**: Use `petk validate` to identify template issues
3. **Review Examples**: Look at our [Use Cases](../problems/use-cases.md) for working examples

## Common Issues

### Template Not Processing
- Verify file paths in include blocks
- Check variable names match configuration
- Ensure proper YAML syntax in config files

### Variables Not Substituting
- Confirm variables are defined in `petk.config.yaml`
- Check variable name spelling and case sensitivity
- Verify template syntax uses `{{variable_name}}`

### Include Blocks Not Working
- Verify included files exist at specified paths
- Check for circular includes (Petk detects these automatically)
- Ensure proper file permissions

You're now ready to start building sophisticated prompt engineering workflows with Petk!