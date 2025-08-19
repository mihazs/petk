---
sidebar_position: 2
---

# Problem-Solving Guide

Having trouble with something specific? This section provides solutions to common problems and troubleshooting guides to help you resolve issues quickly.

## Common Issues

### Installation Problems
- **Package Installation Fails** - Resolve dependency conflicts and installation errors
- **CLI Not Found** - Fix PATH issues and global installation problems
- **Permission Errors** - Handle file system permission issues

### Template Errors
- **Template Not Found** - Debug template resolution and path issues
- **Syntax Errors** - Fix template syntax and validation problems
- **Include Failures** - Resolve dynamic content inclusion issues

### Configuration Issues
- **Config File Not Loaded** - Troubleshoot configuration file discovery
- **Invalid Configuration** - Fix YAML/JSON syntax and validation errors
- **Environment Variables** - Debug environment variable loading and precedence

## Development Troubleshooting

### Build and Compilation
- **TypeScript Errors** - Resolve type checking and compilation issues
- **Build Failures** - Debug Turborepo and package build problems
- **Dependency Conflicts** - Handle version mismatches and peer dependencies

### Runtime Issues
- **Template Processing Fails** - Debug template engine runtime errors
- **Performance Problems** - Optimize template processing performance
- **Memory Issues** - Handle large file processing and memory usage

### Integration Problems
- **CI/CD Pipeline Failures** - Fix automated template processing
- **Monorepo Integration** - Resolve workspace and package linking issues
- **Git Hooks** - Debug pre-commit and pre-push template validation

## Error Messages

### Common Error Patterns
- **"Template not found"** - Check template paths and configuration
- **"Invalid YAML syntax"** - Validate YAML formatting and structure
- **"Permission denied"** - Review file system permissions and access rights
- **"Module not found"** - Verify package installation and import paths

### Debugging Strategies
- **Enable Verbose Logging** - Use debug flags for detailed output
- **Check File Paths** - Verify relative and absolute path resolution
- **Validate Configuration** - Test configuration files independently
- **Isolate Components** - Test individual templates and includes separately

## Quick Fixes

### Emergency Solutions
- **Reset Configuration** - Start with default configuration settings
- **Clear Cache** - Remove temporary files and cached data
- **Reinstall Dependencies** - Fresh installation of all packages
- **Update to Latest** - Upgrade to the most recent stable version

### Validation Commands
```bash
# Validate configuration
petk config validate

# Check template syntax
petk template validate <template-path>

# Test template processing
petk process --dry-run <template>

# Debug with verbose output
petk process --verbose <template>
```

---

**Still stuck?** Check our [Reference](../reference/) section for detailed API documentation, or explore the [Explanation](../explanation/) section to understand the underlying concepts better.