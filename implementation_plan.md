# Petk: Implementation Plan

## 1. Project Overview

This document outlines the implementation plan for **Petk**, a command-line interface (CLI) toolkit for prompt engineering. The toolkit provides a Markdown templating system to compose complex prompts from multiple files, a utility to convert structured Markdown into YAML or JSON formats for use with Large Language Models (LLMs), and advanced features for disruptive prompt engineering capabilities.

The toolkit includes four main commands:
- `petk build`: Processes Markdown files with directives to produce a single composite Markdown file, applying optimizations and evaluations.
- `petk convert`: Transforms a structured Markdown file into YAML or JSON, with token estimation and schema validation.
- `petk validate`: Checks templates for errors like circular dependencies, invalid directives, or prompt vulnerabilities without building.
- `petk optimize`: Automatically refines prompts using LLM-assisted generation, red teaming, and performance evaluation.

The project will be developed as a monorepo using Turborepo, with code in TypeScript running on Node.js. All development will follow functional programming principles, emphasizing pure functions, immutability, function composition, and declarative code. Features are designed to be disruptive by automating prompt refinement, enabling agentic workflows, integrating retrieval-augmented generation (RAG), supporting multimodal inputs, and providing built-in security testing—transforming Petk from a simple templater to a comprehensive prompt engineering platform.

## 2. Core Components & Architecture

The architecture centers on a CLI that invokes modular packages for templating, conversion, validation, and optimization. Components will be organized in the monorepo structure:
- `/apps/cli`: The CLI application.
- `/packages/engine`: Template engine logic, including directive processing and auto-optimization.
- `/packages/converter`: Markdown-to-YAML/JSON conversion logic with token estimation.
- `/packages/utils`: Shared utilities (e.g., file handling, path resolution, token estimation, knowledge graph building).
- `/packages/optimizer`: LLM-assisted prompt refinement, red teaming, and evaluation.
- `/packages/agent`: Tools for generating and managing prompt-based agents.

### 2.1. Command-Line Interface (CLI)
- **Purpose:** Parses user inputs and dispatches to the engine, converter, validator, or optimizer.
- **Technology:** Commander.js for command parsing.
- **Commands:**
  - `petk build <input_file> -o <output_file> --optimize`: Runs the template engine to process directives, apply auto-optimizations, and write the result.
  - `petk convert <input_file> -o <output_file> --format <yaml|json> --eval`: Runs the converter to produce YAML or JSON, with optional evaluation metrics.
  - `petk validate <input_file> --redteam`: Scans for errors in directives, paths, dependencies, and vulnerabilities; reports issues without outputting a file.
  - `petk optimize <input_file> -o <output_file> --model <llm-model> --iterations <n>`: Uses LLM to iteratively refine prompts, integrate RAG, and test for robustness.
  - Global options: `--config <path/to/petk.config.yaml>` (defaults to `./petk.config.yaml`), `--watch` (for file watching and auto-rebuild), `--vars <key1=value1,key2=value2>` (for overriding variables via CLI), `--rag <query>` (for retrieval-augmented inclusion).
- **Implementation:** Define commands as composed pure functions in `/apps/cli/src/index.ts`. Encapsulate complex logic in `package.json` scripts (e.g., `pnpm build:engine` for isolated testing). Ensure all CLI flows are traceable with logging for agentic execution.

### 2.2. Template Engine
- **Purpose:** Recursively resolves directives in Markdown files to assemble a single document with substitutions, conditions, and disruptive enhancements like RAG and knowledge graphs.
- **Logic (Functional Approach):**
  - Read root file content immutably as a string.
  - Scan for `{petk:*}` blocks declaratively using pure parsers.
  - Parse YAML within blocks with js-yaml, composing handlers for types like `include`, `var`, `if`, `rag`, `agent`.
  - Process directives: Map over blocks, handle RAG queries to retrieve external content, build knowledge graphs for code relationships, and replace immutably.
  - Apply variable substitutions and multimodal handling (e.g., embed image descriptions).
  - Recurse purely on included contents, tracking chains for cycle detection.
  - Write final string to output, with optional versioning metadata.
- **Dependencies:** glob for patterns, js-yaml for parsing, `@dqbd/tiktoken` for tokens, a RAG library like simple vector search with embeddings.
- **Error Handling:** Throw descriptive exceptions; compose error mappers for user-friendly output.

### 2.3. Markdown-to-YAML/JSON Converter
- **Purpose:** Parses Markdown into YAML or JSON, mapping to schemas, with token estimation, evaluation, and multimodal support.
- **Logic (Functional Approach):**
  - Read input immutably.
  - Parse to AST with marked, traversing declaratively to map nodes.
  - Estimate tokens and evaluate prompt quality (e.g., coherence scores via LLM calls).
  - Serialize immutably to YAML/JSON, appending metadata like token counts or eval scores.
  - Handle multimodal: Extract and describe non-text elements (e.g., images via alt text).
- **Dependencies:** marked, js-yaml, `@dqbd/tiktoken`.
- **Error Handling:** Validate against schemas; throw for mismatches.

### 2.4. Validation Module
- **Purpose:** Dry-run integrity checks, including red teaming for vulnerabilities.
- **Logic:** Reuse engine functions to parse, resolve, detect cycles, and simulate adversarial prompts purely.

### 2.5. Optimizer Module
- **Purpose:** Disruptive auto-refinement using LLM to generate better prompts, integrate agents, and perform evaluations.
- **Logic (Functional Approach):**
  - Take input prompt, compose LLM calls (e.g., via OpenAI API) for iterative refinement.
  - Generate variants, evaluate with metrics (e.g., BLEU scores or custom evals).
  - Integrate agent specs: Output agent configs for tasks like debugging.
  - Red team: Simulate jailbreaks and refine for robustness.
- **Dependencies:** OpenAI SDK or similar for LLM access.

## 3. Feature Deep Dive: Template Engine

### 3.1. Directive Syntax
- **Supported Directives:**
  - `{petk:include}`: File inclusion with glob, sampling, exclusions.
  - `{petk:var}`: Variable definitions.
  - `{petk:if}`: Conditional inclusion.
  - `{petk:rag}`: Retrieval-augmented: Query external sources or knowledge graphs.
  - `{petk:agent}`: Define agent behaviors for autonomous tasks.
  - `{petk:multimodal}`: Embed non-text (e.g., image URLs with descriptions).
- **Structure:** YAML in fenced blocks.
- **Variable Substitution:** `{{varName}}`, sourced from config, CLI, directives; apply post-processing.

### 3.2. Disruptive Enhancements
- **RAG Integration:** Use `rag` directive to query vectors; build simple embedder in utils.
- **Knowledge Graphs:** Parse code/files to graph (nodes: functions, edges: calls); query for context.
- **Multimodal Support:** Handle images/text; describe visuals for LLM compatibility.
- **Agent Generation:** From `{petk:agent}`, output configs for tools like debugging or testing.

### 3.3. Path Resolution and Configuration
- **Config (`petk.config.yaml`):** Add `rag_sources`, `llm_api_key`, `eval_metrics`.

### 3.4. Circular Dependency Detection and Watch Mode
- As before, with added graph cycle checks.

## 4. Feature Deep Dive: Converter and Optimizer

### 4.1. Converter Enhancements
- **Schema Mapping:** Configurable, with eval integration (e.g., run LLM on output for quality).
- **Token Estimation:** As before, with multimodal token accounting.

### 4.2. Optimizer Features
- **Auto-Refinement:** Iterative LLM calls to improve prompts.
- **Red Teaming:** Generate adversarial variants; score robustness.
- **Evaluation:** Built-in metrics; support custom evals from config.
- **Prompt Versioning:** Track refinements as git-like diffs in output.

## 5. Testing and Quality Assurance
- Vitest for units (e.g., pure directive handlers) and integrations (full flows, RAG queries).
- Cover new features: RAG retrieval accuracy, agent config generation, red team simulations.
- Enforce linting; aim for 90% coverage.
- Add security scans in CI.

## 6. Development Roadmap

For code agent execution: Each phase defines atomic tasks as pure functions or scripts. Use feature branches (e.g., `feature/rag-integration`), Conventional Commits, and append to CHANGELOG.md. Test each module isolately via `package.json` scripts.

1. **Phase 1: Setup Monorepo and Core Utilities (1 week)**
   - Task 1: Initialize Turborepo; create packages.
   - Task 2: Implement utils: pure file readers, path resolvers, YAML parsers, basic token estimator.
   - Task 3: Add dependencies: `@dqbd/tiktoken`, simple embedding lib.
   - Task 4: Setup ESLint, Prettier, Vitest; write base tests.
   - Commit: `chore: setup monorepo and utils`.

2. **Phase 2: Template Engine Core (2 weeks)**
   - Task 1: Implement block extraction and multi-directive parsing (include, var, if).
   - Task 2: Add recursion, substitutions, cycle detection.
   - Task 3: Integrate glob with enhancements (sampling, random).
   - Task 4: Add RAG directive: pure query handler, simple vector search.
   - Task 5: Build knowledge graph utils: parse to nodes/edges.
   - Task 6: Unit tests for each function.
   - Branch: `feature/engine-core`.

3. **Phase 3: CLI, Configuration, and Validation (1 week)**
   - Task 1: Build CLI commands with Commander.js.
   - Task 2: Integrate config loading, variables, watch mode.
   - Task 3: Implement validate with red team basics.
   - Task 4: Tests for CLI flows.
   - Branch: `feature/cli-validation`.

4. **Phase 4: Converter and Multimodal Support (1 week)**
   - Task 1: Enhance converter with AST mapping, token eval.
   - Task 2: Add multimodal handling (image descriptions).
   - Task 3: Integration tests.
   - Branch: `feature/converter-multimodal`.

5. **Phase 5: Optimizer and Agent Features (2 weeks)**
   - Task 1: Implement optimize: LLM refinement loops, evals.
   - Task 2: Add red teaming: adversarial generation.
   - Task 3: Agent directive: Generate configs from prompts.
   - Task 4: Versioning: Diff tracking in outputs.
   - Task 5: End-to-end tests.
   - Branch: `feature/optimizer-agent`.

6. **Phase 6: Refinements, Documentation, Release (1 week)**
   - Task 1: Polish error handling, performance.
   - Task 2: Update docs in `/docs` with examples (e.g., RAG usage).
   - Task 3: Append to CHANGELOG.md.
   - Task 4: Version bump; tag v1.0.0.
   - Merge to `develop`, then `main`.
