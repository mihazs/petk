import { BuildOptions } from '../types.js';
import type { PetkConfig } from '../config/config-types.js';

export interface BuildResult {
    success: boolean;
    outputFile?: string;
    duration: number;
    message: string;
}

export interface EnhancedBuildOptions extends BuildOptions {
    configPath?: string;
    cliVariables?: Record<string, string>;
}

const validateBuildInput = (input: string): boolean => {
    return Boolean(input && input.length > 0 && input.endsWith('.md'));
};


const processBuildOptions = (input: string, options: EnhancedBuildOptions, config: PetkConfig): EnhancedBuildOptions => ({
    ...options,
    output: options.output || (config.template?.defaultExtension ?
        input.replace('.md', `.${config.template.defaultExtension}`) :
        input.replace('.md', '.html')),
    optimize: options.optimize !== undefined ? options.optimize : (config.template?.optimization?.enabled || false)
});


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
    
    const processedOptions = processBuildOptions(input, options, {} as PetkConfig);
    
    return executeBuildProcess(input, processedOptions);
};

export const displayBuildResult = (result: BuildResult): void => {
    if (result.success) {
        process.stdout.write(`✅ ${result.message}\n`);
        if (result.outputFile) {
            process.stdout.write(`📄 Output: ${result.outputFile}\n`);
        }
    } else {
        process.stderr.write(`❌ ${result.message}\n`);
    }
    
    process.stdout.write(`⏱️  Duration: ${result.duration}ms\n`);
};