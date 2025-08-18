# Edge Case Test: Empty File

# Edge Case Test: Minimal Content
Text only.

# Edge Case Test: Mixed Content with Legitimate Patterns
This file contains legitimate uses of patterns that might trigger false positives:
- CSS selectors: .class { color: red; }
- JavaScript code: `const result = getValue();`
- SQL queries: SELECT * FROM users WHERE id = $1
- File paths: /home/user/documents/file.txt
- URLs: https://example.com/api/data
- Template syntax: {{user.name}} in documentation
- Environment variables: $HOME and $PATH

# Edge Case Test: Unicode and Special Characters
Unicode: αβγ δεζ ηθι
Emojis: 🔒 🛡️ ⚠️
Special chars: «»‹›„"‚''

# Edge Case Test: Boundary Conditions
Very long line: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

# Edge Case Test: Empty YAML Block
```yaml
```

# Edge Case Test: Invalid YAML Structure
```yaml
invalid: yaml: structure: missing: quotes
  - item1
    - nested_without_proper_indent