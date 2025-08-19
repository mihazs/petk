# GitHub Actions: Docusaurus Deployment Workflow

## Overview

This document provides technical reference for the automated Docusaurus documentation deployment workflow that publishes the project documentation to GitHub Pages.

**File Location:** `.github/workflows/deploy-docs.yml`  
**Purpose:** Automated deployment of Docusaurus documentation site to GitHub Pages  
**Target URL:** https://mihazs.github.io/petk/

## Workflow Configuration

### Triggers

The workflow is triggered by the following events:

- **Push to main branch** with changes to documentation-related files:
  - `apps/docs/**`
  - `package.json`
  - `pnpm-lock.yaml`
  - `.github/workflows/deploy-docs.yml`
- **Manual workflow dispatch** via GitHub Actions UI

### Permissions

The workflow requires the following permissions:
- `contents: read` - Access repository content
- `pages: write` - Deploy to GitHub Pages
- `id-token: write` - OIDC token for GitHub Pages deployment

### Concurrency Control

- **Group:** `"pages"`
- **Cancel in progress:** `false`
- **Behavior:** Only one deployment runs at a time, queued deployments wait for completion

## Environment Configuration

### Runtime Environment
- **Node.js Version:** 20 (LTS)
- **pnpm Version:** 9
- **Operating System:** Ubuntu Latest
- **Build Tool:** Turborepo with workspace filtering

### Environment Variables
- `NODE_VERSION: '20'`
- `PNPM_VERSION: '9'`
- `NODE_ENV: production` (build step)
- `DOCUSAURUS_URL: https://mihazs.github.io`
- `DOCUSAURUS_BASE_URL: /petk/`
- `HUSKY: 0` (disabled during CI)

## Job Architecture

### Job 1: Build (`build`)

**Purpose:** Build the Docusaurus documentation site

**Steps:**
1. **Repository Checkout**
   - Action: `actions/checkout@v4`
   - Configuration: Full history fetch (`fetch-depth: 0`)

2. **pnpm Setup**
   - Action: `pnpm/action-setup@v4`
   - Version: Dynamic via environment variable
   - Install disabled: `run_install: false`

3. **Node.js Setup**
   - Action: `actions/setup-node@v4`
   - Caching: pnpm cache enabled
   - Version: Dynamic via environment variable

4. **pnpm Store Caching**
   - Action: `actions/cache@v4`
   - Cache key: `${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}`
   - Restore keys: `${{ runner.os }}-pnpm-store-`

5. **Turborepo Caching**
   - Action: `actions/cache@v4`
   - Cache path: `.turbo`
   - Cache key: `${{ runner.os }}-turbo-${{ github.sha }}`
   - Restore keys: `${{ runner.os }}-turbo-`

6. **Dependency Installation**
   - Command: `pnpm install --frozen-lockfile`
   - Husky hooks disabled during CI

7. **Documentation Build**
   - Command: `pnpm --filter apps-docs build`
   - Output directory: `./apps/docs/build`

8. **GitHub Pages Setup**
   - Action: `actions/configure-pages@v5`

9. **Artifact Upload**
   - Action: `actions/upload-pages-artifact@v3`
   - Source path: `./apps/docs/build`

### Job 2: Deploy (`deploy`)

**Purpose:** Deploy built documentation to GitHub Pages

**Dependencies:** Requires successful completion of `build` job

**Steps:**
1. **GitHub Pages Deployment**
   - Action: `actions/deploy-pages@v4`
   - Output: Deployment ID for verification

### Job 3: Status Check (`status-check`)

**Purpose:** Verify deployment status and provide feedback

**Dependencies:** Requires completion of both `build` and `deploy` jobs  
**Execution:** Always runs regardless of previous job outcomes

**Logic:**
- Success condition: Both build and deploy jobs successful
- Success output: Deployment confirmation with URL
- Failure condition: Any job failure
- Failure output: Status report with failure details

## Caching Strategy

### pnpm Store Cache
- **Purpose:** Optimize dependency installation time
- **Cache Key:** OS-specific with lockfile hash
- **Scope:** Cross-workflow persistence
- **Invalidation:** Changes to `pnpm-lock.yaml`

### Turborepo Cache
- **Purpose:** Optimize build performance through incremental builds
- **Cache Key:** OS-specific with commit SHA
- **Scope:** Build artifact and task caching
- **Invalidation:** Per-commit basis with fallback restoration

### Node.js Cache
- **Purpose:** Cache Node.js and npm dependencies
- **Management:** Automatic via `actions/setup-node@v4`
- **Integration:** Works alongside pnpm store caching

## Optimization Features

### Build Filtering
- **Turborepo Filter:** `--filter apps-docs`
- **Purpose:** Build only documentation workspace
- **Benefit:** Reduced build time and resource usage

### Path-Based Triggering
- **Implementation:** Workflow only triggers for relevant file changes
- **Monitored Paths:** Documentation, dependencies, and workflow files
- **Benefit:** Prevents unnecessary deployments

### Dependency Optimization
- **Frozen Lockfile:** Ensures deterministic builds
- **Store Caching:** Reduces network overhead
- **Hook Disabling:** Skips development-only processes

## Status Badge Integration

### Badge URL
```markdown
[![Deploy Docs](https://github.com/mihazs/petk/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/mihazs/petk/actions/workflows/deploy-docs.yml)
```

### Status Indicators
- **Green (Success):** Documentation successfully deployed
- **Red (Failure):** Deployment failed, check workflow logs
- **Yellow (In Progress):** Deployment currently running

## Troubleshooting Reference

### Common Issues

**Build Failures:**
- Verify `apps/docs/package.json` build script
- Check Docusaurus configuration in `apps/docs/docusaurus.config.ts`
- Review dependency compatibility in lockfile

**Deployment Failures:**
- Confirm GitHub Pages is enabled in repository settings
- Verify workflow permissions are correctly configured
- Check artifact upload size limits

**Cache Issues:**
- Clear workflow caches if builds become inconsistent
- Verify pnpm-lock.yaml is committed and up-to-date
- Review Turborepo cache configuration

### Debug Information

**Workflow Logs Location:** GitHub Actions tab → Deploy Docusaurus to GitHub Pages  
**Build Output Location:** Build job → Build Docusaurus site step  
**Deployment Verification:** Status check job provides deployment URL confirmation

## Technical Specifications

### Action Versions
- `actions/checkout@v4` - Repository checkout
- `pnpm/action-setup@v4` - pnpm package manager setup  
- `actions/setup-node@v4` - Node.js runtime setup
- `actions/cache@v4` - Build and dependency caching
- `actions/configure-pages@v5` - GitHub Pages configuration
- `actions/upload-pages-artifact@v3` - Artifact upload for deployment
- `actions/deploy-pages@v4` - GitHub Pages deployment

### Resource Requirements
- **Build Time:** ~2-5 minutes (depending on cache state)
- **Storage:** GitHub Pages artifact storage
- **Bandwidth:** Upload to GitHub Pages hosting

### Security Configuration
- **OIDC Token:** Used for secure GitHub Pages deployment
- **Permissions:** Minimal required permissions following principle of least privilege
- **Secret Access:** No repository secrets required for this workflow

## Integration Notes

### Docusaurus Configuration
The workflow expects standard Docusaurus v3 project structure:
- Build command: `pnpm build` (within apps/docs workspace)
- Output directory: `build/`
- Base URL configuration: `/petk/`

### Monorepo Integration
- **Turborepo Filter:** Uses workspace-specific filtering
- **Dependency Management:** Leverages pnpm workspace configuration
- **Build Isolation:** Only builds documentation workspace

### GitHub Pages Configuration
- **Source:** GitHub Actions (not branch-based)
- **Domain:** `mihazs.github.io/petk`
- **HTTPS:** Enforced by GitHub Pages
- **Custom Domain:** Not currently configured