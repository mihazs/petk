# Troubleshooting ESLint Setup Issues

## Overview

This guide provides solutions to common ESLint configuration problems encountered in the Petk monorepo. Follow these troubleshooting steps when ESLint is not working as expected.

## Common Issues and Solutions

### 1. ESLint Configuration Not Found

**Problem:** ESLint cannot find configuration files or shared configurations.

**Symptoms:**
```
Error: Failed to load config "eslint-config-custom" to extend from.
```

**Solution:**
1. Ensure the shared config package is installed:
   ```bash
   cd packages/[your-package]
   pnpm add eslint-config-custom@workspace:*
   ```

2. Verify the shared config package has the correct dependencies:
   ```bash
   cd packages/eslint-config-custom
   pnpm install
   ```

3. Check that the package name in `.eslintrc.json` matches exactly:
   ```json
   {
     "extends": ["eslint-config-custom"]
   }
   ```

### 2. TypeScript Parser Issues

**Problem:** ESLint fails to parse TypeScript files correctly.

**Symptoms:**
```
Parsing error: Cannot read file 'tsconfig.json'
```

**Solution:**
1. Ensure `@typescript-eslint/parser` is installed at the root:
   ```bash
   pnpm add -D @typescript-eslint/parser @typescript-eslint/eslint-plugin
   ```

2. Verify `tsconfig.json` exists in the package directory or root:
   ```bash
   ls tsconfig.json
   ```

3. Check parser configuration in `.eslintrc.json`:
   ```json
   {
     "parser": "@typescript-eslint/parser",
     "parserOptions": {
       "project": "./tsconfig.json"
     }
   }
   ```

### 3. Missing Dependencies in pnpm Workspaces

**Problem:** ESLint cannot resolve dependencies in monorepo packages.

**Symptoms:**
```
Error: Failed to load plugin '@typescript-eslint' declared in 'eslint-config-custom'
```

**Solution:**
1. Install TypeScript ESLint dependencies at the root level:
   ```bash
   pnpm add -D @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint
   ```

2. Add basic ESLint as a dependency to each package:
   ```json
   {
     "devDependencies": {
       "eslint": "*"
     }
   }
   ```

3. Use `pnpm install` to resolve workspace dependencies:
   ```bash
   pnpm install
   ```

### 4. Shared Configuration Package Issues

**Problem:** The shared ESLint configuration package cannot be loaded or resolved.

**Symptoms:**
```
Cannot resolve module 'eslint-config-custom'
```

**Solution:**
1. Verify the shared config package structure:
   ```
   packages/eslint-config-custom/
   ├── index.js
   ├── package.json
   ```

2. Check `package.json` in the shared config:
   ```json
   {
     "name": "eslint-config-custom",
     "main": "index.js",
     "dependencies": {
       "eslint-config-prettier": "^9.0.0"
     },
     "peerDependencies": {
       "@typescript-eslint/eslint-plugin": "^6.0.0",
       "@typescript-eslint/parser": "^6.0.0",
       "eslint": "^8.0.0"
     }
   }
   ```

3. Ensure the `index.js` exports a valid ESLint configuration:
   ```javascript
   module.exports = {
     env: { node: true, es2022: true },
     extends: ["@typescript-eslint/recommended", "prettier"],
     parser: "@typescript-eslint/parser",
     parserOptions: { ecmaVersion: "latest", sourceType: "module" },
     plugins: ["@typescript-eslint"]
   };
   ```

### 5. Prettier Conflicts

**Problem:** ESLint and Prettier rules conflict with each other.

**Symptoms:**
- Formatting inconsistencies
- ESLint errors about formatting rules

**Solution:**
1. Ensure `eslint-config-prettier` is installed:
   ```bash
   pnpm add -D eslint-config-prettier
   ```

2. Add `"prettier"` as the last item in extends array:
   ```json
   {
     "extends": [
       "@typescript-eslint/recommended",
       "prettier"
     ]
   }
   ```

3. Run ESLint and Prettier separately:
   ```bash
   pnpm lint        # ESLint for code quality
   pnpm format      # Prettier for formatting
   ```

### 6. Turborepo Integration Issues

**Problem:** ESLint not running correctly through Turborepo.

**Symptoms:**
- Lint command fails in Turborepo
- Inconsistent results across packages

**Solution:**
1. Verify `turbo.json` includes lint pipeline:
   ```json
   {
     "pipeline": {
       "lint": {
         "outputs": []
       }
     }
   }
   ```

2. Ensure each package has consistent lint script:
   ```json
   {
     "scripts": {
       "lint": "eslint . --ext .ts,.tsx,.js,.jsx"
     }
   }
   ```

3. Run lint from root to test Turborepo integration:
   ```bash
   pnpm lint
   ```

## Diagnostic Commands

### Check ESLint Configuration
```bash
# View resolved config for a specific file
npx eslint --print-config src/index.ts

# Test ESLint on a specific file
npx eslint src/index.ts --debug
```

### Verify Package Dependencies
```bash
# Check installed packages
pnpm list eslint
pnpm list @typescript-eslint/parser

# Verify workspace dependencies
pnpm list --depth=0
```

### Debug Workspace Resolution
```bash
# Check workspace package resolution
pnpm why eslint-config-custom

# List all workspace packages
pnpm list -r --depth=0
```

## Prevention Tips

1. **Consistent Dependencies:** Keep ESLint-related dependencies versions aligned across the monorepo.

2. **Workspace Pattern:** Always use `workspace:*` for internal package dependencies.

3. **Configuration Inheritance:** Use the shared configuration pattern to maintain consistency.

4. **Regular Testing:** Run `pnpm lint` after any configuration changes.

5. **Documentation Updates:** Update this guide when encountering new issues.

## Getting Help

If none of these solutions resolve your ESLint issues:

1. Check the ESLint configuration files match the reference documentation
2. Verify all dependencies are properly installed
3. Test with a minimal configuration to isolate the problem
4. Review the ESLint and TypeScript parser documentation
5. Check for conflicting ESLint plugins or configurations

## Related Documentation

- [ESLint Configuration Reference](../reference/eslint-configuration.md)
- [Project conventions](../../.kilocode/rules/01_conventions.md)
- [TypeScript configuration reference](../reference/typescript-configuration.md)