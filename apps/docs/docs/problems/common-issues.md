---
title: Common Issues
sidebar_position: 1
---

# Common Issues

This guide covers the most frequently encountered issues when using Petk and provides step-by-step solutions to resolve them.

## Installation Issues

### Issue: `command not found: petk`

**Problem:** After installing Petk, the command is not recognized.

**Solutions:**

1. **Check if Petk is installed globally:**
   ```bash
   npm list -g petk
   # or
   pnpm list -g petk
   ```

2. **Reinstall Petk globally:**
   ```bash
   npm install -g petk
   # or
   pnpm install -g petk
   ```

3. **Check your PATH environment variable:**
   ```bash
   echo $PATH
   ```
   Make sure your global npm/pnpm bin directory is included.

4. **Use npx as an alternative:**
   ```bash
   npx petk --version
   ```

### Issue: Permission denied during installation

**Problem:** Getting permission errors when installing globally.

**Solutions:**

1. **Use a Node version manager (recommended):**
   ```bash
   # Install nvm (Node Version Manager)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   
   # Install latest Node.js
   nvm install node
   nvm use node
   ```

2. **Configure npm to use a different directory:**
   ```bash
   mkdir ~/.npm-global
   npm config set prefix '~/.npm-global'
   echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.profile
   source ~/.profile
   ```

3. **Use sudo (not recommended):**
   ```bash
   sudo npm install -g petk
   ```

## Processing Issues

### Issue: Template directives not being processed

**Problem:** Petk directives like `{petk:include}` are not being processed.

**Diagnosis:**
```bash
# Check if the file is being recognized
petk validate your-file.md

# Run with verbose output
petk process your-file.md --verbose
```

**Solutions:**

1. **Check directive syntax:**
   ````markdown
   <!-- Correct -->
   ```{petk:include}
   path: header.md
   ```
   
   <!-- Incorrect -->
   ```{petk:include}
   path: header.md
   ```
   
   ```{petk:include}
   path: header.md
   ```
   ````

2. **Verify file paths are correct:**
   ````markdown
   <!-- Use relative paths -->
   ```{petk:include}
   path: ./components/header.md
   ```

   <!-- Use absolute paths from project root -->
   ```{petk:include}
   path: /templates/shared/footer.md
   ```
   ````

3. **Check file encoding:**
   ```bash
   file your-file.md
   # Should show: UTF-8 Unicode text
   ```

### Issue: Include files not found

**Problem:** Getting "file not found" errors for included files.

**Solutions:**

1. **Check current working directory:**
   ```bash
   pwd
   ls -la
   ```

2. **Use absolute paths:**
   ````markdown
   ```{petk:include}
   path: /full/path/to/file.md
   ```
   ````

3. **Set base directory in configuration:**
   ```javascript
   // petk.config.js
   module.exports = {
     baseDir: './src',
     // Other configuration...
   };
   ```

4. **Verify file permissions:**
   ```bash
   ls -la path/to/included/file.md
   ```

### Issue: Slow processing performance

**Problem:** Petk takes a long time to process files.

**Solutions:**

1. **Use exclude patterns:**
   ```bash
   petk process ./docs/ --exclude "**/node_modules/**" --exclude "**/draft/**"
   ```

2. **Process specific file types only:**
   ```bash
   petk process ./docs/ --include "**/*.md"
   ```

3. **Enable caching:**
   ```javascript
   // petk.config.js
   module.exports = {
     cache: {
       enabled: true,
       directory: './.petk-cache'
     }
   };
   ```

4. **Check for circular includes:**
   ```bash
   petk validate ./docs/ --check-circular
   ```

## Configuration Issues

### Issue: Configuration file not being loaded

**Problem:** Custom configuration is not being applied.

**Diagnosis:**
```bash
# Check which config file is being used
petk --verbose process example.md
```

**Solutions:**

1. **Verify configuration file name and location:**
   ```
   ✓ petk.config.js     (project root)
   ✓ petk.config.json   (project root)
   ✓ .petkrc           (project root)
   ✓ package.json      (petk field)
   ```

2. **Check configuration syntax:**
   ```bash
   # For JavaScript config
   node -c petk.config.js
   
   # For JSON config
   json_verify < petk.config.json
   ```

3. **Specify config file explicitly:**
   ```bash
   petk process example.md --config ./path/to/config.js
   ```

### Issue: Invalid configuration values

**Problem:** Configuration values are not being accepted.

**Solutions:**

1. **Validate configuration against schema:**
   ```bash
   petk config validate
   ```

2. **Check configuration documentation:**
   ```bash
   petk config --help
   ```

3. **Use minimal configuration:**
   ```javascript
   // petk.config.js
   module.exports = {
     input: './src',
     output: './dist'
   };
   ```

## Format Conversion Issues

### Issue: YAML conversion produces invalid output

**Problem:** Converting Markdown to YAML creates malformed YAML.

**Solutions:**

1. **Validate YAML output:**
   ```bash
   petk convert input.md output.yaml
   yaml-lint output.yaml
   ```

2. **Use schema validation:**
   ```bash
   petk convert input.md output.yaml --schema schema.json
   ```

3. **Check for special characters:**
   ```markdown
   <!-- Problematic -->
   title: My Title: With Colons
   
   <!-- Fixed -->
   title: "My Title: With Colons"
   ```

4. **Use explicit format specification:**
   ```bash
   petk convert --from markdown --to yaml input.md output.yml
   ```

### Issue: Markdown formatting lost during conversion

**Problem:** Converting from other formats to Markdown loses formatting.

**Solutions:**

1. **Use preserve-structure option:**
   ```bash
   petk convert input.yaml output.md --preserve-structure
   ```

2. **Check input format:**
   ```bash
   petk convert --from yaml --to markdown input.yml output.md
   ```

3. **Validate input format:**
   ```bash
   petk validate input.yml
   ```

## Development Server Issues

### Issue: Development server won't start

**Problem:** `petk serve` command fails to start.

**Solutions:**

1. **Check if port is available:**
   ```bash
   lsof -i :3000
   # or
   netstat -tlnp | grep :3000
   ```

2. **Use different port:**
   ```bash
   petk serve --port 8080
   ```

3. **Check file permissions:**
   ```bash
   ls -la ./
   ```

4. **Clear cache:**
   ```bash
   rm -rf ./.petk-cache
   petk serve
   ```

### Issue: Live reload not working

**Problem:** Changes to files don't trigger automatic reload.

**Solutions:**

1. **Enable live reload explicitly:**
   ```bash
   petk serve --livereload
   ```

2. **Check file watch limits (Linux):**
   ```bash
   cat /proc/sys/fs/inotify/max_user_watches
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

3. **Use polling mode:**
   ```bash
   petk serve --poll
   ```

## Template Engine Issues

### Issue: Variables not being substituted

**Problem:** Template variables like `{{variable}}` are not being replaced.

**Solutions:**

1. **Check variable syntax:**
   ```markdown
   <!-- Correct -->
   {{site.title}}
   
   <!-- Incorrect -->
   {site.title}
   {{ site.title }}
   ```

2. **Define variables in configuration:**
   ```javascript
   // petk.config.js
   module.exports = {
     variables: {
       site: {
         title: 'My Site',
         url: 'https://example.com'
       }
     }
   };
   ```

3. **Use environment variables:**
   ```bash
   PETK_SITE_TITLE="My Site" petk process template.md
   ```

### Issue: Circular dependency in includes

**Problem:** Files include each other, creating an infinite loop.

**Diagnosis:**
```bash
petk validate ./templates/ --check-circular
```

**Solutions:**

1. **Identify circular dependencies:**
   ```bash
   petk analyze dependencies ./templates/
   ```

2. **Restructure includes:**
   ````markdown
   <!-- Instead of mutual includes, use a common base -->
   <!-- base.md -->
   ```{petk:include}
   path: header.md
   ```
   ```{petk:include}
   path: content.md
   ```
   ```{petk:include}
   path: footer.md
   ```
   ````

3. **Use conditional includes:**
   ````markdown
   ```{petk:include}
   path: header.md
   if: !included.header
   ```
   ````

## Getting Help

If you're still experiencing issues:

1. **Check the GitHub Issues:** [https://github.com/mihazs/petk/issues](https://github.com/mihazs/petk/issues)

2. **Enable debug logging:**
   ```bash
   PETK_LOG_LEVEL=debug petk process your-file.md
   ```

3. **Create a minimal reproduction:**
   ```bash
   petk init minimal-repro
   cd minimal-repro
   # Add your problematic file
   # Test the issue
   ```

4. **Join our community:**
   - [Discord Server](https://discord.gg/petk)
   - [GitHub Discussions](https://github.com/mihazs/petk/discussions)

5. **Report a bug:**
   - Include Petk version: `petk --version`
   - Include Node.js version: `node --version`
   - Include operating system details
   - Provide minimal reproduction steps
   - Include error messages and logs

## Prevention Tips

1. **Always validate files before processing:**
   ```bash
   petk validate ./templates/ && petk process ./templates/
   ```

2. **Use version control:**
   ```bash
   git add .
   git commit -m "Before Petk processing"
   petk process ./docs/
   ```

3. **Test with small files first:**
   ```bash
   echo "# Test" > test.md
   petk process test.md
   ```

4. **Keep Petk updated:**
   ```bash
   npm update -g petk
   ```

5. **Use configuration files for complex setups:**
   ```javascript
   // petk.config.js - Document your configuration
   module.exports = {
     // Clear, documented configuration
     input: './src',
     output: './dist',
     // ... other options
   };