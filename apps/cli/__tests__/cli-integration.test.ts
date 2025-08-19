import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';

// Mock fs module
vi.mock('fs', () => ({
    promises: {
        readFile: vi.fn(),
        access: vi.fn(),
        stat: vi.fn()
    },
    readFileSync: vi.fn(),
    existsSync: vi.fn()
}));

// Mock the config loader
vi.mock('../src/config/config-loader.js', () => ({
    loadConfiguration: vi.fn()
}));

// Mock the validate command module
vi.mock('../src/commands/validate-command.js', () => ({
    validateCommand: vi.fn()
}));

describe('CLI Integration Tests', () => {
    let consoleLogSpy: ReturnType<typeof vi.spyOn>;
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
    let processExitSpy: ReturnType<typeof vi.spyOn>;
    
    beforeEach(() => {
        vi.clearAllMocks();
        consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        processExitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
            throw new Error('process.exit called');
        });
    });
    
    afterEach(() => {
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
        processExitSpy.mockRestore();
    });

    describe('Program Creation and Command Registration', () => {
        it('creates program with correct version and description', async () => {
            // Arrange & Act
            const { createProgram } = await import('../src/index.js');
            const program = createProgram();
            
            // Assert
            expect(program).toBeInstanceOf(Command);
            expect(program.name()).toBe('petk');
            expect(program.description()).toBe('Template processing toolkit with advanced features');
            expect(program.version()).toBe('0.1.0');
        });
        
        it('registers all required commands', async () => {
            // Arrange
            const { validateCommand } = await import('../src/commands/validate-command.js');
            
            // Act
            const { createProgram, setupCommands } = await import('../src/index.js');
            const program = createProgram();
            const programWithCommands = setupCommands(program);
            
            // Assert
            const commands = programWithCommands.commands.map(cmd => cmd.name());
            expect(commands).toContain('build');
            expect(commands).toContain('convert');
            expect(commands).toContain('optimize');
            expect(validateCommand).toHaveBeenCalledWith(program);
        });
        
        it('sets up global options correctly', async () => {
            // Arrange & Act
            const { createProgram, setupCommands } = await import('../src/index.js');
            const program = createProgram();
            const programWithCommands = setupCommands(program);
            
            // Assert
            const options = programWithCommands.options;
            const optionNames = options.map(opt => opt.long);
            expect(optionNames).toContain('--config');
            expect(optionNames).toContain('--watch');
            expect(optionNames).toContain('--vars');
            expect(optionNames).toContain('--rag');
        });
    });

    describe('CLI Argument Processing', () => {
        it('handles build command with correct arguments', async () => {
            // Arrange
            const { createProgram, setupCommands } = await import('../src/index.js');
            const program = createProgram();
            const programWithCommands = setupCommands(program);
            programWithCommands.exitOverride();
            
            // Act
            try {
                await programWithCommands.parseAsync(['node', 'petk', 'build', 'test.md']);
            } catch {
                // Expected due to mocking
            }
            
            // Assert
            expect(consoleLogSpy).toHaveBeenCalledWith(
                'Build command:',
                expect.objectContaining({
                    input: 'test.md',
                    options: expect.any(Object)
                })
            );
        });
        
        it('handles unknown command gracefully', async () => {
            // Arrange
            const { createProgram, setupCommands } = await import('../src/index.js');
            const program = createProgram();
            const programWithCommands = setupCommands(program);
            programWithCommands.exitOverride();
            
            // Act & Assert
            await expect(async () => {
                await programWithCommands.parseAsync(['node', 'petk', 'unknown-command']);
            }).rejects.toThrow();
        });
    });

    describe('Global Options Handling', () => {
        it('handles global config option', async () => {
            // Arrange
            const { createProgram, setupCommands } = await import('../src/index.js');
            const program = createProgram();
            const programWithCommands = setupCommands(program);
            programWithCommands.exitOverride();
            
            // Act
            try {
                await programWithCommands.parseAsync(['node', 'petk', '--config', 'custom.yaml', 'build', 'test.md']);
            } catch {
                // Expected due to mocking
            }
            
            // Assert
            const opts = programWithCommands.opts();
            expect(opts.config).toBe('custom.yaml');
        });
        
        it('handles global watch option', async () => {
            // Arrange
            const { createProgram, setupCommands } = await import('../src/index.js');
            const program = createProgram();
            const programWithCommands = setupCommands(program);
            programWithCommands.exitOverride();
            
            // Act
            try {
                await programWithCommands.parseAsync(['node', 'petk', '--watch', 'build', 'test.md']);
            } catch {
                // Expected due to mocking
            }
            
            // Assert
            const opts = programWithCommands.opts();
            expect(opts.watch).toBe(true);
        });
        
        it('handles vars option correctly', async () => {
            // Arrange
            const { createProgram, setupCommands } = await import('../src/index.js');
            const program = createProgram();
            const programWithCommands = setupCommands(program);
            programWithCommands.exitOverride();
            
            // Act
            try {
                await programWithCommands.parseAsync(['node', 'petk', '--vars', 'key1=value1,key2=value2', 'build', 'test.md']);
            } catch {
                // Expected due to mocking
            }
            
            // Assert
            const opts = programWithCommands.opts();
            expect(opts.vars).toEqual({
                key1: 'value1',
                key2: 'value2'
            });
        });
    });

    describe('Error Handling and Edge Cases', () => {
        it('handles missing required arguments gracefully', async () => {
            // Arrange
            const { createProgram, setupCommands } = await import('../src/index.js');
            const program = createProgram();
            const programWithCommands = setupCommands(program);
            programWithCommands.exitOverride();
            
            // Act & Assert
            await expect(async () => {
                await programWithCommands.parseAsync(['node', 'petk', 'build']);
            }).rejects.toThrow();
        });
        
        it('handles help display correctly', async () => {
            // Arrange
            const { createProgram, setupCommands } = await import('../src/index.js');
            const program = createProgram();
            const programWithCommands = setupCommands(program);
            programWithCommands.exitOverride();
            
            // Act & Assert
            await expect(async () => {
                await programWithCommands.parseAsync(['node', 'petk', '--help']);
            }).rejects.toThrow();
        });
        
        it('handles version display correctly', async () => {
            // Arrange
            const { createProgram, setupCommands } = await import('../src/index.js');
            const program = createProgram();
            const programWithCommands = setupCommands(program);
            programWithCommands.exitOverride();
            
            // Act & Assert
            await expect(async () => {
                await programWithCommands.parseAsync(['node', 'petk', '--version']);
            }).rejects.toThrow();
        });
    });

    describe('Command Integration and Workflow', () => {
        it('integrates build command with correct option parsing', async () => {
            // Arrange
            const { createProgram, setupCommands } = await import('../src/index.js');
            const program = createProgram();
            const programWithCommands = setupCommands(program);
            programWithCommands.exitOverride();
            
            // Act
            try {
                await programWithCommands.parseAsync([
                    'node', 'petk',
                    '--config', 'custom.yaml',
                    'build', 'input.md',
                    '--output', 'output.md',
                    '--optimize'
                ]);
            } catch {
                // Expected due to mocking
            }
            
            // Assert
            expect(consoleLogSpy).toHaveBeenCalledWith(
                'Build command:',
                expect.objectContaining({
                    input: 'input.md',
                    options: expect.objectContaining({
                        config: 'custom.yaml',
                        output: 'output.md',
                        optimize: true
                    })
                })
            );
        });
        
        it('integrates convert command with format options', async () => {
            // Arrange
            const { createProgram, setupCommands } = await import('../src/index.js');
            const program = createProgram();
            const programWithCommands = setupCommands(program);
            programWithCommands.exitOverride();
            
            // Act
            try {
                await programWithCommands.parseAsync([
                    'node', 'petk',
                    'convert', 'input.md',
                    '--format', 'json',
                    '--eval'
                ]);
            } catch {
                // Expected due to mocking
            }
            
            // Assert - Check that the duration log was called (new enhanced format)
            expect(consoleLogSpy).toHaveBeenCalledWith(
                expect.stringMatching(/⏱️\s+Duration: \d+ms/)
            );
        });
        
        it('integrates optimize command with model options', async () => {
            // Arrange
            const { createProgram, setupCommands } = await import('../src/index.js');
            const program = createProgram();
            const programWithCommands = setupCommands(program);
            programWithCommands.exitOverride();
            
            // Act
            try {
                await programWithCommands.parseAsync([
                    'node', 'petk',
                    'optimize', 'input.md',
                    '--model', 'gpt-4',
                    '--iterations', '5'
                ]);
            } catch {
                // Expected due to mocking
            }
            
            // Assert
            expect(consoleLogSpy).toHaveBeenCalledWith(
                'Optimize command:',
                expect.objectContaining({
                    input: 'input.md',
                    options: expect.objectContaining({
                        model: 'gpt-4',
                        iterations: 5
                    })
                })
            );
        });
        
        it('validates that all commands are properly registered', async () => {
            // Arrange & Act
            const { createProgram, setupCommands } = await import('../src/index.js');
            const program = createProgram();
            const programWithCommands = setupCommands(program);
            
            // Assert
            const commandNames = programWithCommands.commands.map(cmd => cmd.name());
            expect(commandNames).toContain('build');
            expect(commandNames).toContain('convert');
            expect(commandNames).toContain('optimize');
            // Note: validate command is added through validateCommand() function
        });
    });

    describe('Command Options Validation', () => {
        it('validates build command options are properly configured', async () => {
            // Arrange & Act
            const { createProgram, setupCommands } = await import('../src/index.js');
            const program = createProgram();
            const programWithCommands = setupCommands(program);
            const buildCommand = programWithCommands.commands.find(cmd => cmd.name() === 'build');
            
            // Assert
            expect(buildCommand).toBeDefined();
            const optionNames = buildCommand!.options.map(opt => opt.long);
            expect(optionNames).toContain('--output');
            expect(optionNames).toContain('--optimize');
        });
        
        it('validates convert command options are properly configured', async () => {
            // Arrange & Act
            const { createProgram, setupCommands } = await import('../src/index.js');
            const program = createProgram();
            const programWithCommands = setupCommands(program);
            const convertCommand = programWithCommands.commands.find(cmd => cmd.name() === 'convert');
            
            // Assert
            expect(convertCommand).toBeDefined();
            const optionNames = convertCommand!.options.map(opt => opt.long);
            expect(optionNames).toContain('--output');
            expect(optionNames).toContain('--format');
            expect(optionNames).toContain('--eval');
        });
        
        it('validates optimize command options are properly configured', async () => {
            // Arrange & Act
            const { createProgram, setupCommands } = await import('../src/index.js');
            const program = createProgram();
            const programWithCommands = setupCommands(program);
            const optimizeCommand = programWithCommands.commands.find(cmd => cmd.name() === 'optimize');
            
            // Assert
            expect(optimizeCommand).toBeDefined();
            const optionNames = optimizeCommand!.options.map(opt => opt.long);
            expect(optionNames).toContain('--output');
            expect(optionNames).toContain('--model');
            expect(optionNames).toContain('--iterations');
        });
    });
});