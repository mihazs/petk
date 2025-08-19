# Changelog

<!-- LLM_INSERT_CHANGELOG_HERE -->

## [2025-08-19 04:24:15] Docusaurus Documentation Site Implementation

- **Type:** Added
- **Docs:** apps/docs/ (complete Docusaurus site), apps/docs/docs/ (Diátaxis structure), apps/docs/docusaurus.config.ts, apps/docs/sidebars.ts
- **Architecture:** Integrated Docusaurus 3.x within Turborepo monorepo structure with TypeScript support
- **Summary:**
  Complete implementation of a Docusaurus v3.x documentation site within the Petk monorepo, following the Diátaxis framework for content organization and integrating with existing project architecture.
  
  ### Added
   - Docusaurus 3.x site with full TypeScript integration in apps/docs directory
   - Diátaxis framework implementation with four foundational documentation types (Learning, Problem-Solving, Information, Understanding)
   - Local search functionality using @easyops-cn/docusaurus-search-local plugin
   - Dark mode support and responsive design configuration
   - Turborepo integration for monorepo build system compatibility
   - Comprehensive sidebar navigation reflecting Diátaxis structure
   - Development and production build scripts
   - Content integration preserving existing /docs structure
   - TypeScript compilation and error-free build process
   - Placeholder content files for each documentation category
   - Proper kebab-case naming conventions throughout
   - Integration with existing pnpm workspace configuration

  ### Fixed
   - Broken links in initial Docusaurus content preventing build completion
   - Sidebar configuration alignment with Docusaurus navigation requirements
   - Content file structure matching sidebar definitions

  ### Changed
   - Updated turbo.json to include apps/docs in build pipeline
   - Enhanced root package.json and pnpm-workspace.yaml for docs app support
   - Configured Docusaurus with project-specific metadata and branding

  ### Verified
   - Development server starts successfully (http://localhost:3000/petk/)
   - Production build completes without errors
   - Turborepo integration working correctly (docs included in monorepo builds)
   - TypeScript compilation successful across all components
   - Search functionality plugin properly installed and configured
   - Responsive design and dark mode features enabled

   ----

## [2025-08-18 21:00:36] Phase 3 Complete - CLI Implementation with Validation and Testing

- **Type:** Added
- **Summary:** Comprehensive CLI implementation with all commands, configuration system, validation with security features, and complete test coverage

### Added
- Complete CLI commands implementation with Commander.js (build, convert, validate, optimize)
- Configuration loading system with YAML support and environment variable resolution
- Variable parsing functionality with template substitution support
- Watch mode implementation for real-time file monitoring and processing
- Template validation system with comprehensive security features:
  * Path traversal protection against encoded and relative path attacks
  * Circular dependency detection and prevention
  * Resource exhaustion protection with configurable limits
  * Security vector testing and validation
- Validation reporting system with detailed error messages and suggestions
- Comprehensive test suite with 147+ passing tests covering:
  * CLI integration tests for all commands
  * Configuration loader tests with various scenarios
  * End-to-end workflow tests
  * Template validator tests with security scenarios
  * Validation command tests with error handling
  * Variable parser tests with edge cases
  * Watch handler tests with file system monitoring
- Test fixtures for security testing including malicious template patterns
- TypeScript interfaces for all CLI components with strict type safety
- Functional programming architecture with pure functions throughout
- Error handling with comprehensive validation and user-friendly messages
- Package management integration with proper dependency resolution

### Changed
- Enhanced CLI package.json with all required dependencies (Commander.js, chokidar, js-yaml)
- Updated build system configuration for CLI executable
- Improved monorepo structure with proper CLI integration
- Enhanced TypeScript configuration for strict type checking

### To-do
- Phase 4: Converter and Multimodal Support
- Phase 5: Optimizer and Agent Features
- Phase 6: Refinements, Documentation, Release

### Security Features Implemented
- Path traversal attack prevention
- Circular dependency detection
- Resource exhaustion protection
- Input sanitization and validation
- Security test vectors with comprehensive coverage

### Test Coverage Achieved
- 147+ passing tests across all CLI components
- Integration tests for complete workflows
- Security testing with malicious input vectors
- Edge case coverage for error scenarios
- File system monitoring and watch mode testing

----

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