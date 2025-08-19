# ESLint Configuration Reference

## Overview

This document provides a comprehensive reference for the ESLint configuration setup in the Petk monorepo. The configuration is designed to work with TypeScript across multiple packages using a shared configuration approach.

## Configuration Structure

### Root Configuration

**File:** `.eslintrc.json`

```json
{
    "root": true,
    "env": {
        "node": true,
        "es2022": true
    },
    "extends": [
        "@typescript-eslint/recommended",
        "prettier"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": ["@typescript-eslint"],
    "ignorePatterns": ["**/dist/**", "**/build/**", "**/node_modules/**"],
    "overrides": [
        {
            "files": ["*.ts", "*.tsx"],
            "parserOptions": {
                "project": "./tsconfig.json"
            }
        }
    ]
}
```

### Shared Configuration Package

**Package:** `packages/eslint-config-custom`

The shared configuration provides consistent linting rules across all packages in the monorepo.

**Key Features:**
- TypeScript-first configuration
- Prettier integration to avoid conflicts
- Node.js environment support
- ES2022 compatibility
- Consistent parser options across packages

### Package-Level Configuration

**Pattern:** Each package contains `.eslintrc.json` extending the shared config:

```json
{
    "extends": ["eslint-config-custom"]
}
```

## Dependencies

### Root Level Dependencies

Required dependencies installed at the monorepo root:

```json
{
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "eslint-config-prettier": "^9.0.0"
}
```

### Package Dependencies

Each package that uses the shared config must have:

```json
{
    "eslint": "*",
    "eslint-config-custom": "workspace:*"
}
```

## Configuration Files Reference

### File Structure

```
/
├── .eslintrc.json                    # Root configuration
├── packages/
│   ├── eslint-config-custom/
│   │   ├── index.js                  # Shared configuration
│   │   └── package.json              # Shared config package
│   ├── engine/
│   │   └── .eslintrc.json           # Package-specific config
│   ├── converter/
│   │   └── .eslintrc.json           # Package-specific config
│   └── [other-packages]/
│       └── .eslintrc.json           # Package-specific config
└── apps/
    └── cli/
        └── .eslintrc.json            # App-specific config
```

### Parser Configuration

The configuration uses `@typescript-eslint/parser` with these options:

- **ecmaVersion:** `"latest"` - Support for latest ECMAScript features
- **sourceType:** `"module"` - Enable ES module syntax
- **project:** `"./tsconfig.json"` - TypeScript project reference for type-aware rules

### Environment Settings

- **node:** `true` - Node.js global variables and scoping
- **es2022:** `true` - ES2022 global variables

### Ignored Patterns

The following patterns are ignored across all configurations:

- `**/dist/**` - Build output directories
- `**/build/**` - Alternative build directories  
- `**/node_modules/**` - Package dependencies

## Script Configuration

### Root Package.json

```json
{
    "scripts": {
        "lint": "turbo run lint",
        "lint:fix": "turbo run lint:fix"
    }
}
```

### Package-Level Scripts

Each package should include:

```json
{
    "scripts": {
        "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
        "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix"
    }
}
```

## Integration with Other Tools

### Prettier Integration

The configuration extends `"prettier"` to disable ESLint rules that conflict with Prettier formatting. This ensures:

- No conflicts between ESLint and Prettier
- Consistent code formatting across the monorepo
- Separation of concerns (ESLint for code quality, Prettier for formatting)

### Turborepo Integration

ESLint runs through Turborepo for:

- Parallel execution across packages
- Dependency-aware build orchestration
- Cached results for improved performance

### TypeScript Integration

The configuration includes TypeScript-specific features:

- Type-aware linting rules
- TypeScript syntax support
- Integration with `tsconfig.json` for project references

## Rule Categories

### Recommended Rules

The configuration extends `@typescript-eslint/recommended` which includes:

- Basic TypeScript syntax checking
- Type safety rules
- Common error prevention
- Best practice enforcement

### Environment-Specific Rules

Node.js environment rules are enabled for:

- Global variable recognition (process, Buffer, etc.)
- Module system support (require, exports)
- Node.js-specific APIs

## Troubleshooting Reference

### Common Configuration Issues

1. **Missing Dependencies:** Ensure all required ESLint packages are installed
2. **TypeScript Project References:** Verify `tsconfig.json` exists and is properly configured
3. **Parser Options:** Check that parser options match your TypeScript configuration
4. **Extension Conflicts:** Ensure Prettier rules come after other extends to properly override

### Validation Commands

- `pnpm lint` - Run linting across all packages
- `pnpm lint:fix` - Run linting with automatic fixes
- `eslint --print-config file.ts` - Debug configuration for specific files