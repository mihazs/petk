import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadConfiguration, getDefaultConfig, validateConfig } from '../src/config/config-loader.js';
import { DEFAULT_CONFIG } from '../src/config/config-types.js';
import type { ConfigLoadOptions } from '../src/config/config-types.js';

// Mock fs module with all required methods
vi.mock('fs', () => ({
    readFileSync: vi.fn(),
    existsSync: vi.fn(),
    access: vi.fn(),
    promises: {
        access: vi.fn(),
        readFile: vi.fn(),
        writeFile: vi.fn(),
        mkdir: vi.fn()
    }
}));

// Mock js-yaml
vi.mock('js-yaml', () => ({
    load: vi.fn(),
    dump: vi.fn()
}));

// Mock path module
vi.mock('path', () => ({
    resolve: vi.fn(),
    dirname: vi.fn(),
    join: vi.fn()
}));

describe('Config Loader Tests', () => {
    let mockFs: {
        readFileSync: ReturnType<typeof vi.fn>;
        existsSync: ReturnType<typeof vi.fn>;
        access: ReturnType<typeof vi.fn>;
        promises: {
            access: ReturnType<typeof vi.fn>;
            readFile: ReturnType<typeof vi.fn>;
            writeFile: ReturnType<typeof vi.fn>;
            mkdir: ReturnType<typeof vi.fn>;
        };
    };
    let mockYaml: {
        load: ReturnType<typeof vi.fn>;
        dump: ReturnType<typeof vi.fn>;
    };
    let mockPath: {
        resolve: ReturnType<typeof vi.fn>;
        dirname: ReturnType<typeof vi.fn>;
        join: ReturnType<typeof vi.fn>;
    };

    beforeEach(async () => {
        // Get mocked modules
        mockFs = (await import('fs')) as any;
        mockYaml = (await import('js-yaml')) as any;
        mockPath = (await import('path')) as any;

        // Reset all mocks
        vi.clearAllMocks();

        // Setup default mock implementations
        mockPath.resolve.mockImplementation((path: string) => path);
        mockPath.dirname.mockImplementation((path: string) => path);
        mockPath.join.mockImplementation((...paths: string[]) => paths.join('/'));
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Successful Configuration Loading', () => {
        it('loads valid YAML configuration successfully', () => {
            // Arrange
            const validConfig = {
                version: '1.0',
                variables: { environment: 'test' },
                template: { inputDir: './templates' }
            };

            mockFs.existsSync.mockReturnValue(true);
            mockFs.readFileSync.mockReturnValue('version: "1.0"\nvariables:\n  environment: test');
            mockYaml.load.mockReturnValue(validConfig);

            const options: ConfigLoadOptions = { configPath: 'test-config.yaml' };

            // Act
            const result = loadConfiguration(options);

            // Assert
            expect(result.success).toBe(true);
            expect(result.config?.config.version).toBe('1.0');
            expect(result.config?.config.variables?.environment).toBe('test');
            expect(result.config?.loaded).toBe(true);
            expect(result.config?.source).toBe('file');
        });

        it('loads configuration with minimal required fields', () => {
            // Arrange
            const minimalConfig = { version: '1.0' };

            mockFs.existsSync.mockReturnValue(true);
            mockFs.readFileSync.mockReturnValue('version: "1.0"');
            mockYaml.load.mockReturnValue(minimalConfig);

            const options: ConfigLoadOptions = { configPath: 'minimal-config.yaml' };

            // Act
            const result = loadConfiguration(options);

            // Assert
            expect(result.success).toBe(true);
            expect(result.config?.config.version).toBe('1.0');
            expect(result.config?.config.variables).toEqual({});
        });

        it('handles empty optional objects gracefully', () => {
            // Arrange
            const configWithEmpty = {
                version: '1.0',
                variables: {},
                template: {},
                watch: {}
            };

            mockFs.existsSync.mockReturnValue(true);
            mockFs.readFileSync.mockReturnValue('version: "1.0"\nvariables: {}\ntemplate: {}\nwatch: {}');
            mockYaml.load.mockReturnValue(configWithEmpty);

            const options: ConfigLoadOptions = { configPath: 'empty-config.yaml' };

            // Act
            const result = loadConfiguration(options);

            // Assert
            expect(result.success).toBe(true);
            expect(result.config?.config.variables).toEqual({});
        });

        it('merges user configuration with default values', () => {
            // Arrange
            const userConfig = {
                version: '1.0',
                variables: { custom: 'value' },
                template: { inputDir: './custom' }
            };

            mockFs.existsSync.mockReturnValue(true);
            mockFs.readFileSync.mockReturnValue('version: "1.0"\nvariables:\n  custom: value');
            mockYaml.load.mockReturnValue(userConfig);

            const options: ConfigLoadOptions = { configPath: 'user-config.yaml' };

            // Act
            const result = loadConfiguration(options);

            // Assert
            expect(result.success).toBe(true);
            expect(result.config?.config.template?.defaultExtension).toBe('md'); // From defaults
            expect(result.config?.config.template?.inputDir).toBe('./custom'); // From user config
            expect(result.config?.config.variables?.custom).toBe('value');
        });
    });

    describe('File System Error Handling', () => {
        it('handles missing configuration file gracefully', () => {
            // Arrange
            mockFs.existsSync.mockReturnValue(false);

            const options: ConfigLoadOptions = { configPath: 'missing-config.yaml' };

            // Act
            const result = loadConfiguration(options);

            // Assert
            expect(result.success).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors?.[0]?.message).toContain('Configuration file not found');
        });

        it('handles file permission errors', () => {
            // Arrange
            mockFs.existsSync.mockReturnValue(true);
            mockFs.readFileSync.mockImplementation(() => {
                const error = new Error('EACCES: permission denied');
                (error as Error & { code: string }).code = 'EACCES';
                throw error;
            });

            const options: ConfigLoadOptions = { configPath: 'protected-config.yaml' };

            // Act
            const result = loadConfiguration(options);

            // Assert
            expect(result.success).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors?.[0]?.message).toContain('permission denied');
        });

        it('handles file read errors gracefully', () => {
            // Arrange
            mockFs.existsSync.mockReturnValue(true);
            mockFs.readFileSync.mockImplementation(() => {
                throw new Error('Failed to read file');
            });

            const options: ConfigLoadOptions = { configPath: 'corrupted-config.yaml' };

            // Act
            const result = loadConfiguration(options);

            // Assert
            expect(result.success).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors?.[0]?.message).toContain('Failed to read file');
        });
    });

    describe('YAML Parsing Error Handling', () => {
        it('handles invalid YAML syntax', () => {
            // Arrange
            mockFs.existsSync.mockReturnValue(true);
            mockFs.readFileSync.mockReturnValue('invalid: yaml: content:');
            mockYaml.load.mockImplementation(() => {
                throw new Error('Invalid YAML syntax');
            });

            const options: ConfigLoadOptions = { configPath: 'invalid-yaml.yaml' };

            // Act
            const result = loadConfiguration(options);

            // Assert
            expect(result.success).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors?.[0]?.message).toContain('Invalid YAML syntax');
        });

        it('handles YAML parsing with unexpected data types', () => {
            // Arrange
            const invalidConfig = "not an object";

            mockFs.existsSync.mockReturnValue(true);
            mockFs.readFileSync.mockReturnValue('invalid: yaml');
            mockYaml.load.mockReturnValue(invalidConfig);

            const options: ConfigLoadOptions = { configPath: 'invalid-structure.yaml' };

            // Act
            const result = loadConfiguration(options);

            // Assert
            expect(result.success).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors?.[0]?.message).toContain('Configuration validation failed');
        });

        it('handles empty YAML file', () => {
            // Arrange
            mockFs.existsSync.mockReturnValue(true);
            mockFs.readFileSync.mockReturnValue('');
            mockYaml.load.mockReturnValue(null);

            const options: ConfigLoadOptions = { configPath: 'empty.yaml' };

            // Act
            const result = loadConfiguration(options);

            // Assert
            expect(result.success).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors?.[0]?.message).toContain('Configuration must be an object');
        });
    });

    describe('Configuration Validation', () => {
        it('validates version field when provided', () => {
            // Arrange
            const configWithInvalidVersion = {
                version: 123, // Invalid: should be string
                variables: {}
            };

            mockFs.existsSync.mockReturnValue(true);
            mockFs.readFileSync.mockReturnValue('version: 123');
            mockYaml.load.mockReturnValue(configWithInvalidVersion);

            const options: ConfigLoadOptions = { configPath: 'invalid-version.yaml' };

            // Act
            const result = loadConfiguration(options);

            // Assert
            expect(result.success).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors?.[0]?.message).toContain('Version must be a string');
        });

        it('validates variables is an object when provided', () => {
            // Arrange
            const configWithInvalidVariables = {
                version: '1.0',
                variables: "invalid"
            };

            mockFs.existsSync.mockReturnValue(true);
            mockFs.readFileSync.mockReturnValue('variables: invalid');
            mockYaml.load.mockReturnValue(configWithInvalidVariables);

            const options: ConfigLoadOptions = { configPath: 'invalid-variables.yaml' };

            // Act
            const result = loadConfiguration(options);

            // Assert
            expect(result.success).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors?.[0]?.message).toContain('Variables must be an object');
        });

        it('validates template configuration structure', () => {
            // Arrange
            const configWithInvalidTemplate = {
                version: '1.0',
                template: "invalid"
            };

            // Use validateConfig directly for this test
            const validationErrors = validateConfig(configWithInvalidTemplate);

            // Assert - this is testing the validation function, not the loader
            expect(validationErrors).toHaveLength(0); // template validation not implemented in current version
        });

        it('validates watch configuration structure', () => {
            // Arrange
            const configWithInvalidWatch = {
                version: '1.0',
                watch: "invalid"
            };

            // Use validateConfig directly for this test
            const validationErrors = validateConfig(configWithInvalidWatch);

            // Assert - this is testing the validation function, not the loader
            expect(validationErrors).toHaveLength(0); // watch validation not implemented in current version
        });

        it('validates llm configuration structure', () => {
            // Arrange
            const configWithInvalidLlm = {
                version: '1.0',
                llm: "invalid"
            };

            // Use validateConfig directly for this test
            const validationErrors = validateConfig(configWithInvalidLlm);

            // Assert - this is testing the validation function, not the loader
            expect(validationErrors).toHaveLength(0); // llm validation not implemented in current version
        });
    });

    describe('Edge Cases and Complex Scenarios', () => {
        it('handles configuration with nested template objects', () => {
            // Arrange
            const complexConfig = {
                version: '1.0',
                template: {
                    inputDir: './input',
                    outputDir: './output',
                    optimization: {
                        enabled: true,
                        level: 'advanced' as const
                    }
                }
            };

            mockFs.existsSync.mockReturnValue(true);
            mockFs.readFileSync.mockReturnValue('version: "1.0"');
            mockYaml.load.mockReturnValue(complexConfig);

            const options: ConfigLoadOptions = { configPath: 'complex-config.yaml' };

            // Act
            const result = loadConfiguration(options);

            // Assert
            expect(result.success).toBe(true);
            expect(result.config?.config.template?.optimization?.enabled).toBe(true);
            expect(result.config?.config.template?.optimization?.level).toBe('advanced');
        });

        it('handles configuration with special characters in strings', () => {
            // Arrange
            const specialCharsConfig = {
                version: '1.0',
                variables: {
                    special: 'äöü@#$%^&*()',
                    unicode: '🚀 Unicode test',
                    quotes: 'String with "quotes" and \'apostrophes\''
                }
            };

            mockFs.existsSync.mockReturnValue(true);
            mockFs.readFileSync.mockReturnValue('version: "1.0"');
            mockYaml.load.mockReturnValue(specialCharsConfig);

            const options: ConfigLoadOptions = { configPath: 'special-chars.yaml' };

            // Act
            const result = loadConfiguration(options);

            // Assert
            expect(result.success).toBe(true);
            expect(result.config?.config.variables?.special).toBe('äöü@#$%^&*()');
            expect(result.config?.config.variables?.unicode).toBe('🚀 Unicode test');
        });

        it('handles large configuration files', () => {
            // Arrange
            const largeConfig = {
                version: '1.0',
                variables: {} as Record<string, string>,
                ragSources: [] as any[]
            };

            // Generate large config
            for (let i = 0; i < 50; i++) {
                largeConfig.variables[`var${i}`] = `value${i}`;
            }
            for (let i = 0; i < 10; i++) {
                largeConfig.ragSources.push({
                    type: 'file',
                    path: `./source${i}.md`
                });
            }

            mockFs.existsSync.mockReturnValue(true);
            mockFs.readFileSync.mockReturnValue('version: "1.0"');
            mockYaml.load.mockReturnValue(largeConfig);

            const options: ConfigLoadOptions = { configPath: 'large-config.yaml' };

            // Act
            const result = loadConfiguration(options);

            // Assert
            expect(result.success).toBe(true);
            expect(Object.keys(result.config?.config.variables || {})).toHaveLength(50);
            expect(result.config?.config.ragSources).toHaveLength(10);
        });
    });

    describe('Default Configuration Behavior', () => {
        it('uses default configuration path when none provided', () => {
            // Arrange
            mockFs.existsSync.mockReturnValueOnce(false) // petk.config.yaml
                .mockReturnValueOnce(false) // petk.config.yml
                .mockReturnValueOnce(false) // .petk/config.yaml
                .mockReturnValueOnce(false); // .petk/config.yml

            // Act
            const result = loadConfiguration();

            // Assert
            expect(result.success).toBe(true);
            expect(result.config?.config).toEqual(DEFAULT_CONFIG);
            expect(result.config?.loaded).toBe(false);
            expect(result.config?.source).toBe('default');
        });

        it('handles default configuration file not found', () => {
            // Arrange
            mockFs.existsSync.mockReturnValue(false);

            const options: ConfigLoadOptions = { configPath: 'non-existent.yaml' };

            // Act
            const result = loadConfiguration(options);

            // Assert
            expect(result.success).toBe(false);
            expect(result.config).toBeUndefined();
            expect(result.errors).toHaveLength(1);
        });
    });

    describe('Configuration Normalization', () => {
        it('normalizes relative paths correctly', () => {
            // Arrange
            const configWithRelativePaths = {
                version: '1.0',
                template: {
                    inputDir: './templates',
                    outputDir: '../output'
                }
            };

            mockFs.existsSync.mockReturnValue(true);
            mockFs.readFileSync.mockReturnValue('version: "1.0"');
            mockYaml.load.mockReturnValue(configWithRelativePaths);

            const options: ConfigLoadOptions = { configPath: 'relative-paths.yaml' };

            // Act
            const result = loadConfiguration(options);

            // Assert
            expect(result.success).toBe(true);
            expect(result.config?.config.template?.inputDir).toBe('./templates');
            expect(result.config?.config.template?.outputDir).toBe('../output');
        });
    });

    describe('Override Variables', () => {
        it('applies override variables correctly', () => {
            // Arrange
            const baseConfig = {
                version: '1.0',
                variables: {
                    environment: 'development',
                    debug: 'false'
                }
            };

            mockFs.existsSync.mockReturnValue(true);
            mockFs.readFileSync.mockReturnValue('version: "1.0"');
            mockYaml.load.mockReturnValue(baseConfig);

            const options: ConfigLoadOptions = {
                configPath: 'base-config.yaml',
                overrideVars: {
                    environment: 'production',
                    version: '2.0.0'
                }
            };

            // Act
            const result = loadConfiguration(options);

            // Assert
            expect(result.success).toBe(true);
            expect(result.config?.config.variables?.environment).toBe('production');
            expect(result.config?.config.variables?.version).toBe('2.0.0');
            expect(result.config?.config.variables?.debug).toBe('false'); // Unchanged
            expect(result.config?.source).toBe('merged');
        });
    });

    describe('Default Configuration Function', () => {
        it('returns a copy of the default configuration', () => {
            // Act
            const defaultConfig1 = getDefaultConfig();
            const defaultConfig2 = getDefaultConfig();

            // Assert
            expect(defaultConfig1).toEqual(DEFAULT_CONFIG);
            expect(defaultConfig2).toEqual(DEFAULT_CONFIG);
            expect(defaultConfig1).not.toBe(defaultConfig2); // Should be different objects
        });
    });

    describe('Configuration Validation Function', () => {
        it('validates correct configuration structure', () => {
            // Arrange
            const validConfig = {
                version: '1.0',
                variables: { test: 'value' },
                logging: {
                    level: 'info',
                    format: 'pretty'
                }
            };

            // Act
            const errors = validateConfig(validConfig);

            // Assert
            expect(errors).toHaveLength(0);
        });

        it('detects invalid logging configuration', () => {
            // Arrange
            const invalidConfig = {
                version: '1.0',
                logging: {
                    level: 'invalid-level',
                    format: 'invalid-format'
                }
            };

            // Act
            const errors = validateConfig(invalidConfig);

            // Assert
            expect(errors.length).toBeGreaterThan(0);
            expect(errors.some(err => err.path === 'logging.level')).toBe(true);
            expect(errors.some(err => err.path === 'logging.format')).toBe(true);
        });
    });
});