# Changelog

<!-- LLM_INSERT_CHANGELOG_HERE -->

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