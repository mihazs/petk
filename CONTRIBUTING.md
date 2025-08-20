# Contributing to Petk

Thank you for your interest in contributing to Petk! We welcome contributions from the community to help improve this open-source CLI tool for prompt engineering with Large Language Models (LLMs). Whether you're fixing a bug, adding a new feature, or improving documentation, your help is appreciated.

## Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project, you agree to abide by its terms. (If the repo doesn't have one, we can add or link to a standard one.)

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue on the [GitHub Issues page](https://github.com/mihazs/petk/issues). Provide as much detail as possible, including:
- Steps to reproduce the bug
- Expected and actual behavior
- Your environment (OS, Node.js version, Petk version)
- Any relevant screenshots or logs

Use the "Bug report" template if available.

### Suggesting Enhancements

For feature requests or improvements, open an issue using the "Feature request" template. Describe the problem you're trying to solve and how the enhancement would help.

### Development Setup

To set up the project for local development:

1. **Fork the Repository**: Click the "Fork" button on the top right of the repository page.

2. **Clone Your Fork**:
   ```
   git clone https://github.com/YOUR_USERNAME/petk.git
   cd petk
   ```

3. **Install Dependencies**: Petk is a TypeScript monorepo. We recommend using pnpm for package management.
   ```
   pnpm install
   ```
   (If you don't have pnpm, install it globally with `npm install -g pnpm`.)

4. **Build the Project**:
   ```
   pnpm build
   ```

5. **Run Tests**:
   ```
   pnpm test
   ```

6. **Link the CLI Locally** (for testing):
   ```
   pnpm link --global
   ```
   Now you can use the `petk` command from your local changes.

The project structure includes:
- `apps/`: Main applications
- `packages/`: Shared packages
- `docs/`: Documentation sources

### Coding Conventions

- Follow the existing code style (use ESLint and Prettier configurations in the repo).
- Write clean, readable code with appropriate comments.
- Ensure new features or fixes include unit tests where applicable.
- Use TypeScript for all code.

### Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification for commit messages. This helps with automated changelog generation and semantic versioning.

Examples:
- `feat: add new template validation command`
- `fix: resolve issue with recursive includes`
- `docs: update README with new examples`
- `chore: update dependencies`

### Submitting Pull Requests (PRs)

1. **Create a Branch**: From the `main` branch, create a new branch for your changes.
   ```
   git checkout -b feat/new-feature
   ```

2. **Make Changes**: Implement your fix or feature, commit with conventional commit messages.

3. **Run Tests and Lint**: Ensure everything passes.
   ```
   pnpm test
   pnpm lint
   ```

4. **Push to Your Fork**:
   ```
   git push origin feat/new-feature
   ```

5. **Open a PR**: Go to the original repository and click "New pull request". Select your branch.
   - Use a clear title following Conventional Commits (e.g., "feat: add watch mode enhancements").
   - Provide a detailed description of changes, referencing any related issues (e.g., "Closes #123").
   - If it's a work in progress, prefix the title with "WIP:".

6. **Review Process**: Maintainers will review your PR. Be responsive to feedback and make necessary changes.

Once your PR is merged, congratulations! You're now a contributor.

## Questions?

If you have any questions about contributing, feel free to open an issue or reach out via the discussions tab.

Thanks for contributing to Petk! 🚀