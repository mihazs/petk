# Changelog

<!-- LLM_INSERT_CHANGELOG_HERE -->

## [2025-08-18 17:48:45] CLI: Comprehensive Commander.js implementation with functional command architecture

- **Type:** Added
- **Docs:** [apps/cli/src/index.ts], [apps/cli/src/types.ts], [apps/cli/src/commands/build-command.ts], [apps/cli/src/commands/convert-command.ts], [apps/cli/src/commands/validate-command.ts], [apps/cli/src/commands/optimize-command.ts], [apps/cli/package.json]
- **Architecture:** No changes to docs/README.md or documentation structure
- **Summary:**
  Implemented comprehensive CLI foundation using Commander.js v14.0.0 with functional programming principles. Created complete command structure with pure function handlers, global options, and stub implementations ready for future engine integration. All commands build and execute successfully with proper option parsing and error handling.

  ### Added
   - Complete CLI entry point with Commander.js setup and global options (--config, --watch, --vars, --rag)
   - TypeScript interfaces for all command options and contexts with strict typing
   - Functional command handlers for build, convert, validate, and optimize operations
   - Pure function architecture with separate validation, processing, and execution functions
   - Comprehensive option parsing for each command with specific parameters
   - Package.json bin entry for CLI executable and proper scripts configuration
   - Build system integration with monorepo Turborepo setup

  ### Fixed
   - TypeScript compilation issues with function parameter scoping and return types
   - Missing @types/node dependency for Node.js globals and process object

  ### Changed
   - Updated package.json with Commander.js dependency and dev dependencies
   - Enhanced package scripts with start command for built CLI execution

  ### Restructured
   - N/A

  ### To-do
   - Integration with @petk/engine for build command implementation
   - Integration with @petk/converter for convert command implementation
   - Validation logic implementation for validate command
   - Optimization logic implementation for optimize command

  ### WIP
   - Phase 4 engine integration planning for full CLI functionality

  ----

## [2025-08-16 23:31:55] Engine: glob pipeline utilities, deterministic shuffle, and expanded tests

- **Type:** Added/Changed/Tested
- **Docs:** [packages/engine/__tests__/glob-utils.test.ts], [packages/engine/__tests__/resolve-recursive.test.ts], [packages/engine/package.json]
- **Architecture:** No changes to docs/README.md or documentation structure
- **Summary:**
  Introduced pure, functional glob pipeline utilities (expandGlob, sortEntries, shuffleDeterministic, sampleEntries, normalizePaths) to @petk/engine. Refactored and expanded unit and integration tests to directly cover all pipeline utilities, including deterministic shuffle, path normalization, deduplication, and error gating. Improved error handling and ensured deterministic, testable behavior throughout the pipeline. Confirmed glob@^11.0.3 is present in dependencies.

  ### Added
   - Pure utility modules for glob expansion, sorting, deterministic shuffling, sampling, and path normalization
   - Direct unit tests for each glob utility
   - Integration tests for glob pipeline in resolve-recursive

  ### Fixed
   - Error handling for invalid glob options and sample sizes
   - Deterministic output for shuffle with seed

  ### Changed
   - Refactored tests to use new utility functions directly
   - Updated integration tests to cover new pipeline features

  ### Restructured
   - N/A

  ### To-do
   - N/A

  ### WIP
   - N/A

  ----

## [2025-08-16 23:07:08] Fix: stringifyYaml returns 'null' for undefined values

- **Type:** Fixed
- **Docs:** N/A
- **Architecture:** No changes to docs/README.md or documentation structure
- **Summary:**
  Fixed a bug in @petk/utils where `stringifyYaml(undefined)` returned an empty string due to js-yaml behavior. Now, undefined is treated as null for YAML output, matching test and YAML expectations.
  
  ### Fixed
   - `stringifyYaml(undefined)` now returns `'null'` instead of an empty string.
   - All related tests pass.
  ----

## [2025-08-16 19:59:30] Engine core: recursion, substitutions, cycles

- **Type:** Added
- **Docs:** N/A
- **Architecture:** N/A
- **Summary:**
  Implemented schema-agnostic recursion via IncludeResolver, {{var}} substitutions, and cycle detection.

  ### Added
   - processTemplate, substituteVars, assertNoCycle, tests

  ### Fixed
   - N/A

  ### Changed
   - N/A

  ### Restructured
   - N/A

----

## [2025-08-16 19:57:36] Fix Vitest test discovery and audit tsconfig files

- **Type:** Fixed/Changed
- **Docs:** [vitest.config.ts], [packages/*/tsconfig.json]
- **Architecture:** No changes to documentation structure
- **Summary:**
  Fixed Vitest test discovery pattern to ensure tests are found when running from any directory. Audited all package tsconfig.json files and confirmed no duplicate "compilerOptions" keys exist.

  ### Fixed
   - Vitest now reliably discovers and runs tests in all packages regardless of working directory.

  ### Changed
   - Updated test file glob pattern in vitest.config.ts for robust monorepo support.

  ### Audited
   - All tsconfig.json files checked for duplicate "compilerOptions" keys; none found.

  ----

## [2025-08-16 19:37:03] Implement directive block extraction and parsing for engine

- **Type:** Added
- **Docs:** [packages/engine/src/block-extractor.ts], [packages/engine/src/parse-directive.ts], [packages/engine/src/parser.ts], [packages/engine/src/types.ts], [packages/engine/__tests__/block-extractor.test.ts], [packages/engine/__tests__/parse-directive.test.ts], [packages/engine/__tests__/parser.test.ts]
- **Architecture:** Introduced functional, pure modules for directive extraction and parsing in the engine package.
- **Summary:**
  Added core logic for extracting fenced directive blocks from markdown and parsing `{petk:include}`, `{petk:var}`, and `{petk:if}` directives using strict functional programming and discriminated unions. Comprehensive unit tests included for all modules.

  ### Added
   - `block-extractor.ts`: Extracts directive blocks from markdown
   - `parse-directive.ts`: Parses and validates directive YAML
   - `parser.ts`: Composes extraction and parsing
   - `types.ts`: Strict discriminated union types for directives
   - Unit tests for all modules

  ### Fixed

  ### Changed

  ### Restructured

  ### To-do

  ### WIP

  ----

## [2025-08-16 05:12:28] Initialize documentation registry and structure

- **Type:** Added
- **Docs:** [docs/README.md]
- **Architecture:** Created initial documentation architecture and registry
- **Summary:** 
  Established the dynamic documentation registry at `docs/README.md` following the Diátaxis framework. Defined initial categories for learning, problem-solving, reference, and explanation. Provided evolution guidelines and navigation patterns for future documentation growth.
  
  ### Added
   - `docs/README.md` as the documentation registry and architecture guide
   - Initial documentation categories: learning, problems, reference, explanation

  ### Fixed

  ### Changed

  ### Restructured

  ### To-do

  ### WIP

  ----