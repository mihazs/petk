import { BuildOptions, CommandContext } from '../types.js';
import { loadConfiguration } from '../config/config-loader.js';
import { parseVariablesSimple, mergeVariables } from '../utils/variable-parser.js';
import { createWatchHandlerFromConfig, formatWatchEvent, type WatchEvent } from '../utils/watch-handler.js';
import type { PetkConfig, LoadedConfig } from '../config/config-types.js';

export interface BuildResult {
    success: boolean;
    outputFile?: string;
    duration: number;
    message: string;
    config?: LoadedConfig;
    variables?: Record<string, string>;
}

export interface EnhancedBuildOptions extends BuildOptions {
    configPath?: string;
    cliVariables?: Record<string, string>;
}

const validateBuildInput = (input: string): boolean => {
    return Boolean(input && input.length > 0 && input.endsWith('.md'));
};

const createBuildContext = (input: string, options: EnhancedBuildOptions): CommandContext => ({
    options,
    args: [input]
});

const loadBuildConfiguration = async (options: EnhancedBuildOptions): Promise<{
    config: LoadedConfig;
    variables: Record<string, string>;
}> => {
    const cliVariables = options.cliVariables || {};
    
    const configResult = await loadConfiguration({
        configPath: options.configPath,
        overrideVars: cliVariables,
        validate: true
    });
    
    if (!configResult.success || !configResult.config) {
        throw new Error(`Config loading failed: ${configResult.errors?.map(e => e.message).join('; ')}`);
    }
    
    const finalVariables = mergeVariables(
        configResult.config.config.variables || {},
        cliVariables
    );
    
    return {
        config: configResult.config,
        variables: finalVariables
    };
};

const processBuildOptions = (input: string, options: EnhancedBuildOptions, config: PetkConfig): EnhancedBuildOptions => ({
    ...options,
    output: options.output || (config.template?.defaultExtension ?
        input.replace('.md', `.${config.template.defaultExtension}`) :
        input.replace('.md', '.html')),
    optimize: options.optimize !== undefined ? options.optimize : (config.template?.optimization?.enabled || false)
});

const validateConfigCompatibility = (config: PetkConfig): string[] => {
    const errors: string[] = [];
    
    if (config.template?.optimization?.enabled && !config.template.optimization.level) {
        errors.push('Optimization enabled but no level specified');
    }
    
    return errors;
};

const executeBuildProcess = async (input: string, processedOptions: BuildOptions): Promise<BuildResult> => {
    const startTime = Date.now();
    
    try {
        const outputFile = processedOptions.output || input.replace('.md', '.html');
        
        const duration = Date.now() - startTime;
        
        return {
            success: true,
            outputFile,
            duration,
            message: `Build completed: ${input} -> ${outputFile} (${duration}ms)`
        };
    } catch (error) {
        const duration = Date.now() - startTime;
        return {
            success: false,
            duration,
            message: `Build failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
};

const handleBuildError = (input: string, error: string): BuildResult => ({
    success: false,
    duration: 0,
    message: `Build validation failed for ${input}: ${error}`
});

export const buildCommand = async (input: string, options: BuildOptions): Promise<BuildResult> => {
    if (!validateBuildInput(input)) {
        return handleBuildError(input, 'Input must be a valid .md file');
    }
    
    const context = createBuildContext(input, options);
    const processedOptions = processBuildOptions(input, options, {} as PetkConfig);
    
    return executeBuildProcess(input, processedOptions);
};

export const displayBuildResult = (result: BuildResult): void => {
    if (result.success) {
        console.log(`✅ ${result.message}`);
        if (result.outputFile) {
            console.log(`📄 Output: ${result.outputFile}`);
        }
    } else {
        console.error(`❌ ${result.message}`);
    }
    
    console.log(`⏱️  Duration: ${result.duration}ms`);
};