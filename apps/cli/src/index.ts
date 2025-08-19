#!/usr/bin/env node

import { Command } from 'commander';
import { GlobalOptions } from './types.js';
import { validateCommand } from './commands/validate-command.js';
import { convertCommand, displayConvertResult } from './commands/convert-command.js';

const createProgram = (): Command => {
    const program = new Command();
    
    program
        .name('petk')
        .description('Template processing toolkit with advanced features')
        .version('0.1.0');
    
    return program;
};

const addGlobalOptions = (program: Command): Command => {
    return program
        .option('-c, --config <path>', 'path to config file', './petk.config.yaml')
        .option('-w, --watch', 'watch for file changes', false)
        .option('--vars <vars>', 'variables as key=value pairs', parseVars)
        .option('--rag <query>', 'RAG query for context enhancement');
};

const parseVars = (value: string): Record<string, string> => {
    const vars: Record<string, string> = {};
    const pairs = value.split(',');
    
    pairs.forEach(pair => {
        const [key, val] = pair.split('=');
        if (key && val) {
            vars[key.trim()] = val.trim();
        }
    });
    
    return vars;
};

interface CommanderGlobalOptions {
    config?: string;
    watch?: boolean;
    vars?: Record<string, string>;
    rag?: string;
}

const extractGlobalOptions = (options: CommanderGlobalOptions): GlobalOptions => ({
    config: options.config,
    watch: options.watch,
    vars: options.vars,
    rag: options.rag
});

const addBuildCommand = (program: Command): Command => {
    return program
        .command('build')
        .description('process template with engine')
        .argument('<input>', 'input template file')
        .option('-o, --output <file>', 'output file path')
        .option('--optimize', 'enable optimization', false)
        .action(async (input: string, options: { output?: string; optimize?: boolean }) => {
            const globalOptions = extractGlobalOptions(program.opts() as CommanderGlobalOptions);
            const buildOptions = { ...globalOptions, output: options.output, optimize: options.optimize };
            
            console.log('Build command:', { input, options: buildOptions });
            process.stdout.write('Build functionality will be implemented with @petk/engine integration\n');
        });
};

const addConvertCommand = (program: Command): Command => {
    return program
        .command('convert')
        .description('convert markdown to structured format')
        .argument('<input>', 'input markdown file')
        .option('-o, --output <file>', 'output file path')
        .option('-f, --format <format>', 'output format (yaml|json)', 'yaml')
        .option('--eval', 'evaluate expressions in content', false)
        .action(async (input: string, options: { output?: string; format?: string; eval?: boolean }) => {
            const globalOptions = extractGlobalOptions(program.opts() as CommanderGlobalOptions);
            const convertOptions = {
                ...globalOptions,
                output: options.output,
                format: (options.format as 'yaml' | 'json') || 'yaml',
                eval: options.eval
            };
            
            const result = await convertCommand(input, convertOptions);
            displayConvertResult(result);
        });
};


const addOptimizeCommand = (program: Command): Command => {
    return program
        .command('optimize')
        .description('optimize template for performance and size')
        .argument('<input>', 'input template file')
        .option('-o, --output <file>', 'output file path')
        .option('-m, --model <model>', 'LLM model for optimization')
        .option('-i, --iterations <n>', 'optimization iterations', '3')
        .action(async (input: string, options: { output?: string; model?: string; iterations?: string }) => {
            const globalOptions = extractGlobalOptions(program.opts() as CommanderGlobalOptions);
            const optimizeOptions = {
                ...globalOptions,
                output: options.output,
                model: options.model,
                iterations: parseInt(options.iterations || '3', 10)
            };
            
            console.log('Optimize command:', { input, options: optimizeOptions });
            process.stdout.write('Optimization functionality will be implemented in Phase 5\n');
        });
};

const setupCommands = (program: Command): Command => {
    const programWithOptions = addGlobalOptions(program);
    
    addBuildCommand(programWithOptions);
    addConvertCommand(programWithOptions);
    validateCommand(programWithOptions);
    addOptimizeCommand(programWithOptions);
    
    return programWithOptions;
};

const handleErrors = (program: Command): void => {
    program.exitOverride((err) => {
        if (err.code === 'commander.help' || err.code === 'commander.version') {
            process.exit(0);
        }
        
        process.stderr.write(`Error: ${err.message}\n`);
        process.exit(1);
    });
};

const runCli = async (): Promise<void> => {
    try {
        const program = createProgram();
        const programWithCommands = setupCommands(program);
        
        handleErrors(programWithCommands);
        
        await programWithCommands.parseAsync(process.argv);
    } catch (error) {
        process.stderr.write(`CLI Error: ${error}\n`);
        process.exit(1);
    }
};

if (import.meta.url === `file://${process.argv[1]}`) {
    runCli();
}

export { runCli, createProgram, setupCommands };