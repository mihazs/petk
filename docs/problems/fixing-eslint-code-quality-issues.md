# Fixing ESLint Code Quality Issues

## Overview

This guide provides systematic solutions for resolving common ESLint code quality warnings and errors in the Petk monorepo. These solutions address TypeScript type safety, unused code detection, and proper error handling patterns.

## Common Code Quality Issues and Solutions

### 1. TypeScript `any` Type Usage

**Problem:** ESLint rule `@typescript-eslint/no-explicit-any` flags inappropriate use of `any` types.

**Symptoms:**
```
error  Unexpected any. Specify a more specific type  @typescript-eslint/no-explicit-any
```

**Solutions by Context:**

#### CLI Command Arguments
Replace `any` with proper Commander.js types:
```typescript
// Before
function processCommand(args: any) {
    // ...
}

// After
import { Command } from 'commander';

function processCommand(args: Record<string, unknown>) {
    // ...
}
```

#### File System Operations
Use Node.js `fs.Stats` type for file statistics:
```typescript
// Before
interface WatchEvent {
    stats: any;
}

// After
import { Stats } from 'fs';

interface WatchEvent {
    stats: Stats;
}
```

#### Generic Object Properties
Use `Record<string, unknown>` for object types:
```typescript
// Before
const data: any = loadConfiguration();

// After
const data: Record<string, unknown> = loadConfiguration();
```

#### Third-Party Library Types
Install proper type definitions:
```bash
pnpm add -D @types/js-yaml
```

```typescript
// Before
const parsed: any = yaml.load(content);

// After
import { load } from 'js-yaml';
const parsed = load(content) as Record<string, unknown>;
```

### 2. Unused Variables and Imports

**Problem:** ESLint rules `@typescript-eslint/no-unused-vars` and `eslint/no-unused-vars` flag unused code.

**Symptoms:**
```
error  'variableName' is defined but never used  @typescript-eslint/no-unused-vars
error  'ImportName' is defined but never used  eslint/no-unused-vars
```

**Solutions:**

#### Remove Unused Imports
```typescript
// Before
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

function readConfig() {
    return readFileSync('config.yaml', 'utf8');
}

// After
import { readFileSync } from 'fs';

function readConfig() {
    return readFileSync('config.yaml', 'utf8');
}
```

#### Remove Unused Variables
```typescript
// Before
function processFiles() {
    const result = performOperation();
    const unused = calculateSomething();
    return result;
}

// After
function processFiles() {
    const result = performOperation();
    return result;
}
```

#### Underscore Prefix for Required but Unused Parameters
```typescript
// Before
function callback(error: Error, result: string) {
    console.log(result);
}

// After
function callback(_error: Error, result: string) {
    console.log(result);
}
```

### 3. Console Statement Usage

**Problem:** ESLint rule `no-console` flags console usage in production code.

**Symptoms:**
```
warning  Unexpected console statement  no-console
```

**Solutions by Context:**

#### CLI Output (Acceptable)
For CLI applications, console statements for user output are acceptable:
```typescript
// CLI command output - This is expected
console.log('Build completed successfully');
console.error('Validation failed');
```

#### Library Code (Replace with Proper Streams)
```typescript
// Before
console.log('Processing complete');
console.error('Error occurred');

// After
process.stdout.write('Processing complete\n');
process.stderr.write('Error occurred\n');
```

#### Debug Statements (Remove)
```typescript
// Before
function processData(input: string) {
    console.log('Debug: input is', input);
    return input.toUpperCase();
}

// After
function processData(input: string) {
    return input.toUpperCase();
}
```

### 4. Missing Type Definitions

**Problem:** TypeScript cannot resolve types for external libraries.

**Symptoms:**
```
error  Could not find a declaration file for module 'library-name'
```

**Solutions:**

#### Install Type Definitions
```bash
# For js-yaml
pnpm add -D @types/js-yaml

# For Node.js built-ins
pnpm add -D @types/node
```

#### Create Type Assertions When Types Unavailable
```typescript
// When no @types package exists
declare module 'custom-library' {
    export function customFunction(input: string): string;
}
```

### 5. TypeScript Configuration Issues

**Problem:** ESLint cannot properly type-check TypeScript files.

**Symptoms:**
```
error  Property 'user' does not exist on type 'Request'
```

**Solutions:**

#### Interface Augmentation
```typescript
// types/express.d.ts
declare namespace Express {
    interface Request {
        user?: {
            id: string;
            name: string;
        };
    }
}
```

#### Type Guards for Runtime Validation
```typescript
function isString(value: unknown): value is string {
    return typeof value === 'string';
}

function processUserData(data: unknown) {
    if (isString(data)) {
        // TypeScript now knows data is string
        return data.toUpperCase();
    }
    throw new Error('Expected string data');
}
```

### 6. Missing @ts-expect-error Descriptions

**Problem:** ESLint rule `@typescript-eslint/ban-ts-comment` requires descriptions for type suppression.

**Symptoms:**
```
error  Include a description after the '@ts-expect-error' directive to explain why the @typescript-eslint/ban-ts-comment
```

**Solution:**
```typescript
// Before
// @ts-expect-error
const result = unsafeOperation();

// After
// @ts-expect-error - Third-party library has incorrect types, expecting string but returns number
const result = unsafeOperation();
```

## Systematic Fix Process

### Step 1: Assessment
Run linting to identify all issues:
```bash
pnpm lint
```

### Step 2: Automated Fixes
Apply automated fixes where possible:
```bash
pnpm lint --fix
```

### Step 3: Manual Resolution by Category

#### Fix by Package Priority
1. **CLI App** - User-facing application with console output expectations
2. **Core Packages** - Engine, Converter, Utils with stricter quality requirements
3. **Configuration Packages** - ESLint config and TypeScript config

#### Fix by Issue Type Priority
1. **Type Safety** - Replace `any` types with specific types
2. **Unused Code** - Remove unused imports and variables
3. **Console Statements** - Replace or justify console usage
4. **Type Definitions** - Add missing type packages

### Step 4: Verification
```bash
pnpm lint    # Verify no errors/warnings remain
pnpm test    # Ensure functionality preserved
pnpm build   # Confirm build success
```

## Prevention Strategies

### 1. IDE Configuration
Configure your editor to show ESLint warnings in real-time:
```json
// .vscode/settings.json
{
    "eslint.validate": ["javascript", "typescript"],
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    }
}
```

### 2. Pre-commit Hooks
Add linting to git hooks to prevent quality issues:
```json
// package.json
{
    "husky": {
        "hooks": {
            "pre-commit": "pnpm lint"
        }
    }
}
```

### 3. TypeScript First Development
- Always define proper types from the start
- Install `@types` packages when adding dependencies
- Use TypeScript strict mode for maximum type safety

### 4. Code Review Checklist
- No `any` types without justification
- All imports are used
- Console statements appropriate for context
- Type definitions available for all dependencies

## Common Patterns and Examples

### Type Guard Pattern
```typescript
function isValidData(data: unknown): data is { id: string; name: string } {
    return (
        typeof data === 'object' &&
        data !== null &&
        typeof (data as any).id === 'string' &&
        typeof (data as any).name === 'string'
    );
}
```

### Error Handling Pattern
```typescript
function safeOperation(): string | null {
    try {
        return performRiskyOperation();
    } catch (error) {
        if (error instanceof Error) {
            process.stderr.write(`Operation failed: ${error.message}\n`);
        }
        return null;
    }
}
```

### Configuration Loading Pattern
```typescript
function loadConfiguration(): Record<string, unknown> {
    const configPath = path.resolve('config.yaml');
    
    if (!existsSync(configPath)) {
        throw new Error(`Configuration file not found: ${configPath}`);
    }
    
    const content = readFileSync(configPath, 'utf8');
    const parsed = yaml.load(content);
    
    if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Invalid configuration format');
    }
    
    return parsed as Record<string, unknown>;
}
```

## Related Documentation

- [ESLint Setup Issues](./eslint-setup-issues.md) - Configuration and installation problems
- [ESLint Configuration Reference](../reference/eslint-configuration.md) - Complete configuration details
- [Project Conventions](../../.kilocode/rules/01_conventions.md) - Coding standards and guidelines