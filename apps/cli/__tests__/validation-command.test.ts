import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const execAsync = promisify(exec);

describe('validate command', () => {
    let testDir: string;
    let cliPath: string;

    beforeEach(() => {
        testDir = join(tmpdir(), `petk-test-${Date.now()}`);
        mkdirSync(testDir, { recursive: true });
        cliPath = join(process.cwd(), 'dist/index.js');
    });

    afterEach(() => {
        rmSync(testDir, { recursive: true, force: true });
    });

    describe('basic functionality', () => {
        it('displays help when no arguments provided', async () => {
            const { stdout } = await execAsync(`node ${cliPath} validate --help`);
            expect(stdout).toContain('Validate template files for security vulnerabilities');
        });

        it('validates clean template file successfully', async () => {
            const templatePath = join(testDir, 'clean.md');
            writeFileSync(templatePath, '# Clean Template\n\nThis is a clean template with no security issues.');

            const { stdout, stderr } = await execAsync(`node ${cliPath} validate ${templatePath}`);
            expect(stderr).toBe('');
            expect(stdout).toContain('✓ No security issues found');
        });

        it('exits with code 0 for clean files', async () => {
            const templatePath = join(testDir, 'clean.md');
            writeFileSync(templatePath, '# Clean Template\n\nThis is safe content.');

            try {
                await execAsync(`node ${cliPath} validate ${templatePath}`);
            } catch (error: any) {
                expect(error.code).toBe(0);
            }
        });
    });

    describe('error conditions', () => {
        it('exits with error code for non-existent file', async () => {
            const nonExistentPath = join(testDir, 'does-not-exist.md');

            try {
                await execAsync(`node ${cliPath} validate ${nonExistentPath}`);
                expect.fail('Should have thrown an error');
            } catch (error: any) {
                expect(error.code).toBeGreaterThan(0);
                expect(error.stderr).toContain('File not found');
            }
        });

        it('handles directory input appropriately', async () => {
            try {
                await execAsync(`node ${cliPath} validate ${testDir}`);
                expect.fail('Should have thrown an error');
            } catch (error: any) {
                expect(error.code).toBeGreaterThan(0);
                expect(error.stderr).toContain('Expected a file');
            }
        });
    });

    describe('output formats', () => {
        it('produces JSON output when requested', async () => {
            const templatePath = join(testDir, 'test.md');
            writeFileSync(templatePath, '# Test Template');

            const { stdout } = await execAsync(`node ${cliPath} validate ${templatePath} --format json`);
            const result = JSON.parse(stdout);
            expect(result).toHaveProperty('filePath');
            expect(result).toHaveProperty('issues');
            expect(result).toHaveProperty('summary');
        });

        it('produces detailed output in verbose mode', async () => {
            const templatePath = join(testDir, 'test.md');
            writeFileSync(templatePath, '# Test Template');

            const { stdout } = await execAsync(`node ${cliPath} validate ${templatePath} --verbose`);
            expect(stdout).toContain('Validation Summary');
            expect(stdout).toContain('File:');
        });
    });
});