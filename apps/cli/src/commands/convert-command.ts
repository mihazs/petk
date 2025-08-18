import { ConvertOptions, CommandContext } from '../types.js';

export interface ConvertResult {
    success: boolean;
    outputFile?: string;
    duration: number;
    message: string;
    format: 'yaml' | 'json';
}

const validateConvertInput = (input: string): boolean => {
    return Boolean(input && input.length > 0 && input.endsWith('.md'));
};

const createConvertContext = (input: string, options: ConvertOptions): CommandContext => ({
    options,
    args: [input]
});

const processConvertOptions = (input: string, options: ConvertOptions): ConvertOptions => {
    const format = options.format || 'yaml';
    const extension = format === 'json' ? '.json' : '.yaml';
    
    return {
        ...options,
        output: options.output || input.replace('.md', extension),
        format,
        eval: options.eval || false
    };
};

const executeConvertProcess = async (input: string, processedOptions: ConvertOptions): Promise<ConvertResult> => {
    const startTime = Date.now();
    
    try {
        const outputFile = processedOptions.output || input.replace('.md', '.yaml');
        const format = processedOptions.format || 'yaml';
        
        const duration = Date.now() - startTime;
        
        return {
            success: true,
            outputFile,
            duration,
            format,
            message: `Convert completed: ${input} -> ${outputFile} (${format.toUpperCase()}, ${duration}ms)`
        };
    } catch (error) {
        const duration = Date.now() - startTime;
        return {
            success: false,
            duration,
            format: processedOptions.format || 'yaml',
            message: `Convert failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
};

const handleConvertError = (input: string, error: string): ConvertResult => ({
    success: false,
    duration: 0,
    format: 'yaml',
    message: `Convert validation failed for ${input}: ${error}`
});

export const convertCommand = async (input: string, options: ConvertOptions): Promise<ConvertResult> => {
    if (!validateConvertInput(input)) {
        return handleConvertError(input, 'Input must be a valid .md file');
    }
    
    const context = createConvertContext(input, options);
    const processedOptions = processConvertOptions(input, options);
    
    return executeConvertProcess(input, processedOptions);
};

export const displayConvertResult = (result: ConvertResult): void => {
    if (result.success) {
        console.log(`✅ ${result.message}`);
        if (result.outputFile) {
            console.log(`📄 Output: ${result.outputFile} (${result.format.toUpperCase()})`);
        }
        if (result.format) {
            console.log(`🔧 Format: ${result.format.toUpperCase()}`);
        }
    } else {
        console.error(`❌ ${result.message}`);
    }
    
    console.log(`⏱️  Duration: ${result.duration}ms`);
    console.log('📋 Note: Convert functionality will be implemented in Phase 4');
};