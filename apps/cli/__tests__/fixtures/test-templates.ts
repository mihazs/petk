export const TEST_TEMPLATES = {
    clean: {
        content: `# Clean Template

This is a safe template with no security issues.

## Section 1
Some content here.

## Section 2
More content here.`,
        expectedIssues: 0
    },

    pathTraversal: {
        content: `# Malicious Template

\`\`\`yaml petk:include
path: ../../../etc/passwd
\`\`\``,
        expectedIssues: 1,
        expectedTypes: ['PATH_TRAVERSAL']
    },

    commandInjection: {
        content: `# Command Injection Template

Dangerous content: \`rm -rf /\`

More dangerous: $(cat /etc/passwd)

Variable substitution: \${exec("malicious_command")}`,
        expectedIssues: 3,
        expectedTypes: ['COMMAND_INJECTION']
    },

    templateInjection: {
        content: `# Template Injection

Math expression: {{7*7}}

Variable access: \${user_input}

Ruby template: <%= malicious_code %>

Handlebars: {{#each items}}{{this}}{{/each}}`,
        expectedIssues: 4,
        expectedTypes: ['TEMPLATE_INJECTION']
    },

    circularDependency: {
        content: `# Circular Template A

\`\`\`yaml petk:include
path: circular-b.md
\`\`\``,
        expectedIssues: 1,
        expectedTypes: ['CIRCULAR_DEPENDENCY']
    },

    externalResource: {
        content: `# External Resource Template

\`\`\`yaml petk:include
path: http://malicious-site.com/payload.md
\`\`\`

\`\`\`yaml petk:include
path: https://untrusted-source.org/template.md
\`\`\`

\`\`\`yaml petk:include
path: ftp://external-server.com/file.md
\`\`\``,
        expectedIssues: 3,
        expectedTypes: ['EXTERNAL_RESOURCE']
    },

    resourceExhaustion: {
        content: `# Resource Exhaustion Template

\`\`\`yaml petk:include
path: large-file.md
max_depth: 1000
\`\`\`

\`\`\`yaml petk:include
path: recursive-template.md
\`\`\``,
        expectedIssues: 2,
        expectedTypes: ['RESOURCE_EXHAUSTION']
    },

    mixedVulnerabilities: {
        content: `# Mixed Vulnerabilities Template

## Path Traversal
\`\`\`yaml petk:include
path: ../../../../etc/shadow
\`\`\`

## Command Injection
Dangerous: \`; cat /etc/passwd\`

## Template Injection
Math: {{8*8}}

## External Resource
\`\`\`yaml petk:include
path: https://evil.com/payload
\`\`\``,
        expectedIssues: 4,
        expectedTypes: ['PATH_TRAVERSAL', 'COMMAND_INJECTION', 'TEMPLATE_INJECTION', 'EXTERNAL_RESOURCE']
    }
};

export const EDGE_CASES = {
    emptyFile: {
        content: '',
        expectedIssues: 0
    },

    onlyWhitespace: {
        content: '   \n\n   \t\t   \n\n   ',
        expectedIssues: 0
    },

    validYamlBlock: {
        content: `# Valid Template

\`\`\`yaml petk:include
path: legitimate-file.md
recursive: false
\`\`\`

\`\`\`yaml petk:var
name: safe_variable
value: "safe content"
\`\`\``,
        expectedIssues: 0
    },

    invalidYamlSyntax: {
        content: `# Invalid YAML Template

\`\`\`yaml petk:include
path: file.md
invalid: yaml: syntax: here
\`\`\``,
        expectedIssues: 1,
        expectedTypes: ['SYNTAX_ERROR']
    },

    falsPositivePrevention: {
        content: `# False Positive Prevention

## Legitimate file paths
\`\`\`yaml petk:include
path: ./relative/path/file.md
\`\`\`

\`\`\`yaml petk:include
path: /absolute/path/file.md
\`\`\`

## Code examples in markdown (not actual code execution)
\`\`\`bash
# This is just documentation, not actual command injection
rm -rf /tmp/old-files
\`\`\`

## Template syntax in code blocks (not template injection)
\`\`\`javascript
// Example of template syntax
const template = "{{user.name}}";
\`\`\``,
        expectedIssues: 0
    }
};