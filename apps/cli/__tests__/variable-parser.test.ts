import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    parseVariables,
    parseVariablesSimple,
    validateVariables,
    mergeVariables,
    formatVariables,
    type VariableParseOptions
} from '../src/utils/variable-parser.js';

describe('Variable Parser Tests', () => {
    beforeEach(() => {
        // Arrange: Setup clean state for each test
        vi.clearAllMocks();
    });

    describe('parseVariables', () => {
        it('should parse simple key-value pairs correctly', () => {
            // Arrange
            const input = 'key1=value1,key2=value2';
            
            // Act
            const result = parseVariables(input);
            
            // Assert
            expect(result.success).toBe(true);
            expect(result.variables).toEqual({
                key1: 'value1',
                key2: 'value2'
            });
            expect(result.errors).toBeUndefined();
        });

        it('should handle empty input gracefully', () => {
            // Arrange
            const input = '';
            
            // Act
            const result = parseVariables(input);
            
            // Assert
            expect(result.success).toBe(true);
            expect(result.variables).toEqual({});
            expect(result.errors).toBeUndefined();
        });

        it('should handle undefined input gracefully', () => {
            // Arrange
            const input = undefined;
            
            // Act
            const result = parseVariables(input);
            
            // Assert
            expect(result.success).toBe(true);
            expect(result.variables).toEqual({});
            expect(result.errors).toBeUndefined();
        });

        it('should handle quoted values correctly', () => {
            // Arrange
            const input = 'message="Hello, World!",path=\'/home/user\'';
            
            // Act
            const result = parseVariables(input);
            
            // Assert
            expect(result.success).toBe(true);
            expect(result.variables).toEqual({
                message: 'Hello, World!',
                path: '/home/user'
            });
        });

        it('should handle values with spaces correctly', () => {
            // Arrange
            const input = 'message=Hello World,path=/home/user/documents';
            
            // Act
            const result = parseVariables(input);
            
            // Assert
            expect(result.success).toBe(true);
            expect(result.variables).toEqual({
                message: 'Hello World',
                path: '/home/user/documents'
            });
        });

        it('should report errors for invalid variable format', () => {
            // Arrange
            const input = 'invalidformat,valid=value';
            
            // Act
            const result = parseVariables(input);
            
            // Assert
            expect(result.success).toBe(false);
            expect(result.errors).toContain('Invalid variable format: invalidformat. Expected format: key=value');
            expect(result.variables).toEqual({ valid: 'value' });
        });

        it('should handle strict mode validation', () => {
            // Arrange
            const input = '123invalid=value,valid_name=value';
            const options: VariableParseOptions = { strict: true };
            
            // Act
            const result = parseVariables(input, options);
            
            // Assert
            expect(result.success).toBe(false);
            expect(result.errors).toBeDefined();
            expect(result.errors![0]).toContain('Invalid variable name: 123invalid');
        });

        it('should handle allowEmpty option', () => {
            // Arrange
            const input = 'empty=,notempty=value';
            const optionsDisallow: VariableParseOptions = { allowEmpty: false };
            const optionsAllow: VariableParseOptions = { allowEmpty: true };
            
            // Act
            const resultDisallow = parseVariables(input, optionsDisallow);
            const resultAllow = parseVariables(input, optionsAllow);
            
            // Assert
            expect(resultDisallow.success).toBe(false);
            expect(resultDisallow.errors).toBeDefined();
            expect(resultAllow.success).toBe(true);
            expect(resultAllow.variables.empty).toBe('');
        });

        it('should handle maxVariables limit', () => {
            // Arrange
            const input = 'var1=val1,var2=val2,var3=val3';
            const options: VariableParseOptions = { maxVariables: 2 };
            
            // Act
            const result = parseVariables(input, options);
            
            // Assert
            expect(result.success).toBe(false);
            expect(result.errors).toBeDefined();
            expect(result.errors![0]).toContain('Too many variables: 3. Maximum allowed: 2');
        });

        it('should handle duplicate variable warnings', () => {
            // Arrange
            const input = 'name=John,name=Jane';
            
            // Act
            const result = parseVariables(input);
            
            // Assert
            expect(result.success).toBe(true);
            expect(result.variables.name).toBe('Jane'); // Last value wins
            expect(result.warnings).toBeDefined();
            expect(result.warnings![0]).toContain('Variable \'name\' defined multiple times');
        });
    });

    describe('parseVariablesSimple', () => {
        it('should parse simple variable pairs', () => {
            // Arrange
            const input = 'name=John,age=25';
            
            // Act
            const result = parseVariablesSimple(input);
            
            // Assert
            expect(result).toEqual({ name: 'John', age: '25' });
        });

        it('should handle empty input', () => {
            // Arrange
            const input = '';
            
            // Act
            const result = parseVariablesSimple(input);
            
            // Assert
            expect(result).toEqual({});
        });

        it('should handle undefined input', () => {
            // Arrange
            const input = undefined;
            
            // Act
            const result = parseVariablesSimple(input);
            
            // Assert
            expect(result).toEqual({});
        });

        it('should ignore errors and return only valid variables', () => {
            // Arrange
            const input = 'valid=value,invalid,another=valid';
            
            // Act
            const result = parseVariablesSimple(input);
            
            // Assert
            expect(result).toEqual({ valid: 'value', another: 'valid' });
        });
    });

    describe('validateVariables', () => {
        it('should return empty array for valid variables', () => {
            // Arrange
            const variables = { validName: 'value', another_valid: 'value2' };
            
            // Act
            const result = validateVariables(variables);
            
            // Assert
            expect(result).toEqual([]);
        });

        it('should return validation errors for invalid variable names', () => {
            // Arrange
            const variables = { '123invalid': 'value', 'valid_name': 'value' };
            
            // Act
            const result = validateVariables(variables);
            
            // Assert
            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toContain('Invalid variable name: 123invalid');
        });

        it('should validate variable value types', () => {
            // Arrange
            const variables = { name: 'John', count: '42' };
            
            // Act
            const result = validateVariables(variables);
            
            // Assert
            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toContain('must have a string value');
        });

        it('should handle empty variable map', () => {
            // Arrange
            const variables = {};
            
            // Act
            const result = validateVariables(variables);
            
            // Assert
            expect(result).toEqual([]);
        });
    });

    describe('mergeVariables', () => {
        it('should merge two variable maps correctly', () => {
            // Arrange
            const configVars = {
                key1: 'config1',
                key2: 'config2',
                common: 'config'
            };
            const cliVars = {
                key3: 'cli3',
                key4: 'cli4',
                common: 'cli'
            };
            
            // Act
            const result = mergeVariables(configVars, cliVars);
            
            // Assert
            expect(result).toEqual({
                key1: 'config1',
                key2: 'config2',
                key3: 'cli3',
                key4: 'cli4',
                common: 'cli' // CLI variables override config variables
            });
        });

        it('should handle empty base variables', () => {
            // Arrange
            const configVars = {};
            const cliVars = {
                key1: 'value1',
                key2: 'value2'
            };
            
            // Act
            const result = mergeVariables(configVars, cliVars);
            
            // Assert
            expect(result).toEqual(cliVars);
        });

        it('should handle empty override variables', () => {
            // Arrange
            const configVars = {
                key1: 'value1',
                key2: 'value2'
            };
            const cliVars = {};
            
            // Act
            const result = mergeVariables(configVars, cliVars);
            
            // Assert
            expect(result).toEqual(configVars);
        });

        it('should preserve immutability', () => {
            // Arrange
            const configVars = { key1: 'config1' };
            const cliVars = { key2: 'cli2' };
            const originalConfig = { ...configVars };
            const originalCli = { ...cliVars };
            
            // Act
            const result = mergeVariables(configVars, cliVars);
            
            // Assert
            expect(configVars).toEqual(originalConfig);
            expect(cliVars).toEqual(originalCli);
            expect(result).not.toBe(configVars);
            expect(result).not.toBe(cliVars);
        });
    });

    describe('formatVariables', () => {
        it('should format variables back to string', () => {
            // Arrange
            const variables = { name: 'John', age: '25' };
            
            // Act
            const result = formatVariables(variables);
            
            // Assert
            expect(result).toBe('name=John,age=25');
        });

        it('should quote values with special characters', () => {
            // Arrange
            const variables = { message: 'Hello, World!' };
            
            // Act
            const result = formatVariables(variables);
            
            // Assert
            expect(result).toBe('message="Hello, World!"');
        });

        it('should handle values with equals signs', () => {
            // Arrange
            const variables = { equation: 'x=y+z' };
            
            // Act
            const result = formatVariables(variables);
            
            // Assert
            expect(result).toBe('equation="x=y+z"');
        });

        it('should handle values with spaces', () => {
            // Arrange
            const variables = { path: '/home/user/my documents' };
            
            // Act
            const result = formatVariables(variables);
            
            // Assert
            expect(result).toBe('path="/home/user/my documents"');
        });

        it('should escape quotes in values', () => {
            // Arrange
            const variables = { message: 'Say "hello" to the world' };
            
            // Act
            const result = formatVariables(variables);
            
            // Assert
            expect(result).toBe('message="Say \\"hello\\" to the world"');
        });

        it('should handle empty variables', () => {
            // Arrange
            const variables = {};
            
            // Act
            const result = formatVariables(variables);
            
            // Assert
            expect(result).toBe('');
        });
    });

    describe('Complex scenarios', () => {
        it('should handle environment-like variables', () => {
            // Arrange
            const input = 'NODE_ENV=production,PORT=3000,DB_HOST=localhost,DB_PORT=5432';
            
            // Act
            const result = parseVariablesSimple(input);
            
            // Assert
            expect(result).toEqual({
                NODE_ENV: 'production',
                PORT: '3000',
                DB_HOST: 'localhost',
                DB_PORT: '5432'
            });
        });

        it('should handle configuration-style variables', () => {
            // Arrange
            const input = 'debug=true,logLevel=info,maxRetries=3,timeout=30000';
            
            // Act
            const result = parseVariablesSimple(input);
            
            // Assert
            expect(result).toEqual({
                debug: 'true',
                logLevel: 'info',
                maxRetries: '3',
                timeout: '30000'
            });
        });

        it('should handle path-like variables correctly', () => {
            // Arrange
            const input = 'templateDir=./templates,outputDir=./dist,configFile=./petk.config.yaml';
            
            // Act
            const result = parseVariablesSimple(input);
            
            // Assert
            expect(result).toEqual({
                templateDir: './templates',
                outputDir: './dist',
                configFile: './petk.config.yaml'
            });
        });

        it('should handle Unicode characters', () => {
            // Arrange
            const input = 'message=Hello 世界,emoji=🚀,path=/home/用户';
            
            // Act
            const result = parseVariablesSimple(input);
            
            // Assert
            expect(result).toEqual({
                message: 'Hello 世界',
                emoji: '🚀',
                path: '/home/用户'
            });
        });

        it('should handle large numbers of variables efficiently', () => {
            // Arrange
            const variablePairs: string[] = [];
            const expected: Record<string, string> = {};
            
            for (let i = 0; i < 100; i++) {
                const key = `var${i}`;
                const value = `value${i}`;
                variablePairs.push(`${key}=${value}`);
                expected[key] = value;
            }
            
            const input = variablePairs.join(',');
            
            // Act
            const result = parseVariablesSimple(input);
            
            // Assert
            expect(result).toEqual(expected);
            expect(Object.keys(result)).toHaveLength(100);
        });
    });

    describe('Error handling edge cases', () => {
        it('should handle multiple equals signs correctly', () => {
            // Arrange
            const input = 'equation=x=y+z,url=http://example.com?param=value';
            
            // Act
            const result = parseVariablesSimple(input);
            
            // Assert
            expect(result).toEqual({
                equation: 'x=y+z',
                url: 'http://example.com?param=value'
            });
        });

        it('should handle variables with commas in quoted values', () => {
            // Arrange
            const input = 'list="item1,item2,item3",description="This is a test, with commas"';
            
            // Act
            const result = parseVariablesSimple(input);
            
            // Assert
            expect(result).toEqual({
                list: 'item1,item2,item3',
                description: 'This is a test, with commas'
            });
        });

        it('should handle mixed quote types correctly', () => {
            // Arrange
            const input = 'single=\'value\',double="value",mixed=\'with "inner" quotes\'';
            
            // Act
            const result = parseVariablesSimple(input);
            
            // Assert
            expect(result).toEqual({
                single: 'value',
                double: 'value',
                mixed: 'with "inner" quotes'
            });
        });
    });
});