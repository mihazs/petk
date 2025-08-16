<div align="center">
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<circle cx="50" cy="75" r="18" fill="#1976D2" />
<path d="M 0 0 C -7 -15, -7 -35, 0 -45 C 7 -35, 7 -15, 0 0 Z" fill="#2196F3" transform="translate(50 57) rotate(-15)" />
<path d="M 0 0 C -7 -15, -7 -35, 0 -45 C 7 -35, 7 -15, 0 0 Z" fill="#2196F3" transform="translate(50 57) rotate(0)" />
<path d="M 0 0 C -7 -15, -7 -35, 0 -45 C 7 -35, 7 -15, 0 0 Z" fill="#2196F3" transform="translate(50 57) rotate(15)" />
</svg>
<h1>Petk 🏸</h1>
</div>

**Petk** is a command-line toolkit designed to streamline the creation and management of complex prompts for Large Language Models (LLMs). It provides a powerful Markdown templating system that allows you to build prompts from smaller, reusable components.

## Core Features

  - **Modular Prompts:** Split your prompts into logical, reusable parts and compose them on the fly.
  - **Powerful Include Directive:** Use a clean, YAML-based syntax inside your Markdown to include other files.
  - **Glob & Sorting:** Include multiple files at once using glob patterns and control their order.
  - **LLM-Ready Output:** Convert your structured Markdown into a clean YAML format suitable for LLM APIs.
  - **Fast & Modern:** Built with TypeScript, Turborepo, and SWC for a high-performance, modern development experience.

## Installation

```bash
pnpm add -g petk
```

## Usage

The two main commands are `build` and `convert`.

### `petk build`

This command processes a root Markdown file, resolves all `petk:include` directives, and builds a single, composite Markdown file.

**Example:**

Imagine you have the following files:

`base-prompt.md`:

````markdown
You are a helpful assistant.

```yaml
{petk:include}
files:
  - glob: "tools/*.md"
    order_by: alphabetical_asc
separator: "\n---\n"

```

Please respond to the user's query.

````

`tools/tool-a.md`:
```markdown
### Tool A
Description of Tool A.
````

`tools/tool-b.md`:

```markdown
### Tool B
Description of Tool B.
```

**Command:**

```bash
petk build base-prompt.md -o final-prompt.md
```

**Output (`final-prompt.md`):**

```markdown
You are a helpful assistant.

### Tool A
Description of Tool A.

---

### Tool B
Description of Tool B.

Please respond to the user's query.
```

## Configuration

You can configure `petk` by creating a `petk.config.yaml` file in your project root to define path aliases and other settings.

## Contributing

Contributions are welcome\! Please read our `CONTRIBUTING.md` guide for details on the development process, coding conventions, and how to submit pull requests. This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification.

## License

This project is licensed under the MIT License. See the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.