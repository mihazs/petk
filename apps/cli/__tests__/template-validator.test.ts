import { describe, it, expect } from 'vitest';
import { validateTemplate } from '../src/utils/template-validator';

describe('template validator', () => {
    describe('syntax validation', () => {
        it('validates clean template without issues', async () => {
            const content = '# Clean Template\n\nThis is a safe template.';
            const result = await validateTemplate(content, 'test.md');
            
            expect(result.issues).toHaveLength(0);
            expect(result.summary.totalIssues).toBe(0);
            expect(result.summary.errorCount).toBe(0);
            expect(result.summary.warningCount).toBe(0);
        });

        it('detects invalid directive syntax', async () => {
            const content = '```yaml petk:include\npath: ../../../etc/passwd\n```';
            const result = await validateTemplate(content, 'malicious.md');
            
            expect(result.issues.length).toBeGreaterThan(0);
            expect(result.issues.some(issue => issue.severity === 'ERROR')).toBe(true);
            expect(result.summary.errorCount).toBeGreaterThan(0);
        });
    });

    describe('security validation', () => {
        it('detects path traversal attempts', async () => {
            const testCases = [
                '../../../etc/passwd',
                '..\\..\\..\\windows\\system32\\config\\sam',
                '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
                '....//....//....//etc//passwd'
            ];

            for (const maliciousPath of testCases) {
                const content = `# Test\n\n\`\`\`yaml petk:include\npath: ${maliciousPath}\n\`\`\``;
                const result = await validateTemplate(content, 'test.md');
                
                expect(result.issues.some(issue => 
                    issue.type === 'PATH_TRAVERSAL' && 
                    issue.severity === 'ERROR'
                )).toBe(true);
            }
        });

        it('detects command injection patterns', async () => {
            const maliciousCommands = [
                '`rm -rf /`',
                '$(cat /etc/passwd)',
                '${exec("malicious_command")}',
                '; rm -rf /',
                '| cat /etc/passwd'
            ];

            for (const command of maliciousCommands) {
                const content = `# Test\n\nContent: ${command}`;
                const result = await validateTemplate(content, 'test.md');
                
                expect(result.issues.some(issue => 
                    issue.type === 'COMMAND_INJECTION'
                )).toBe(true);
            }
        });

        it('detects template injection patterns', async () => {
            const injectionPatterns = [
                '{{7*7}}',
                '${user_input}',
                '#{dangerous_code}',
                '<%= malicious_code %>'
            ];

            for (const pattern of injectionPatterns) {
                const content = `# Test\n\nTemplate: ${pattern}`;
                const result = await validateTemplate(content, 'test.md');
                
                expect(result.issues.some(issue => 
                    issue.type === 'TEMPLATE_INJECTION'
                )).toBe(true);
            }
        });
    });

    describe('performance validation', () => {
        it('detects potential resource exhaustion', async () => {
            const recursiveContent = `# Recursive Template
            
\`\`\`yaml petk:include
path: recursive.md
\`\`\``;
            
            const result = await validateTemplate(recursiveContent, 'recursive.md');
            
            expect(result.issues.some(issue => 
                issue.type === 'RESOURCE_EXHAUSTION'
            )).toBe(true);
        });

        it('validates memory usage limits', async () => {
            const largeContent = 'x'.repeat(10 * 1024 * 1024); // 10MB content
            const result = await validateTemplate(largeContent, 'large.md');
            
            expect(result.issues.some(issue => 
                issue.type === 'MEMORY_LIMIT' && 
                issue.severity === 'WARNING'
            )).toBe(true);
        });
    });

    describe('dependency validation', () => {
        it('detects circular dependencies', async () => {
            const content = `# Circular Template
            
\`\`\`yaml petk:include
path: circular-a.md
\`\`\``;
            
            const result = await validateTemplate(content, 'circular-a.md');
            
            expect(result.issues.some(issue => 
                issue.type === 'CIRCULAR_DEPENDENCY'
            )).toBe(true);
        });

        it('validates external resource access', async () => {
            const externalUrls = [
                'http://malicious-site.com/data',
                'https://untrusted-source.org/template',
                'ftp://external-server.com/file'
            ];

            for (const url of externalUrls) {
                const content = `\`\`\`yaml petk:include\npath: ${url}\n\`\`\``;
                const result = await validateTemplate(content, 'test.md');
                
                expect(result.issues.some(issue => 
                    issue.type === 'EXTERNAL_RESOURCE'
                )).toBe(true);
            }
        });
    });
});