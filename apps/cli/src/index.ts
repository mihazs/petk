#!/usr/bin/env node

import { Command } from 'commander';
import { GlobalOptions } from './types.js';

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

const extractGlobalOptions = (options: any): GlobalOptions => ({
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
        .action(async (input: string, options: any) => {
            const globalOptions = extractGlobalOptions(program.opts());
            const buildOptions = { ...globalOptions, output: options.output, optimize: options.optimize };
            
            console.log('Build command:', { input, options: buildOptions });
            console.log('Build functionality will be implemented with @petk/engine integration');
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
        .action(async (input: string, options: any) => {
            const globalOptions = extractGlobalOptions(program.opts());
            const convertOptions = { 
                ...globalOptions, 
                output: options.output, 
                format: options.format,
                eval: options.eval 
            };
            
            console.log('Convert command:', { input, options: convertOptions });
            console.log('Convert functionality will be implemented in Phase 4');
        });
};

const addValidateCommand = (program: Command): Command => {
    return program
        .command('validate')
        .description('validate template structure and syntax')
        .argument('<input>', 'input template file')
        .option('--redteam', 'enable red team validation', false)
        .action(async (input: string, options: any) => {
            const globalOptions = extractGlobalOptions(program.opts());
            const validateOptions = { ...globalOptions, redteam: options.redteam };
            
            console.log('Validate command:', { input, options: validateOptions });
            console.log('Validation functionality will be implemented in Phase 4');
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
        .action(async (input: string, options: any) => {
            const globalOptions = extractGlobalOptions(program.opts());
            const optimizeOptions = { 
                ...globalOptions, 
                output: options.output, 
                model: options.model,
                iterations: parseInt(options.iterations, 10)
            };
            
            console.log('Optimize command:', { input, options: optimizeOptions });
            console.log('Optimization functionality will be implemented in Phase 5');
        });
};

const setupCommands = (program: Command): Command => {
    const programWithOptions = addGlobalOptions(program);
    
    addBuildCommand(programWithOptions);
    addConvertCommand(programWithOptions);
    addValidateCommand(programWithOptions);
    addOptimizeCommand(programWithOptions);
    
    return programWithOptions;
};

const handleErrors = (program: Command): void => {
    program.exitOverride((err) => {
        if (err.code === 'commander.help' || err.code === 'commander.version') {
            process.exit(0);
        }
        
        console.error('Error:', err.message);
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
        console.error('CLI Error:', error);
        process.exit(1);
    }
};

if (import.meta.url === `file://${process.argv[1]}`) {
    runCli();
}

export { runCli, createProgram, setupCommands };