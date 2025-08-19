import { OptimizeOptions } from '../types.js';

export interface OptimizeResult {
    success: boolean;
    inputFile: string;
    outputFile?: string;
    model: string;
    iterations: number;
    duration: number;
    message: string;
    optimizationStats: {
        originalSize: number;
        optimizedSize: number;
        compressionRatio: number;
        tokensReduced: number;
    };
}

const validateOptimizeInput = (input: string): boolean => {
    return Boolean(input && input.length > 0);
};

const processOptimizeOptions = (input: string, options: OptimizeOptions): OptimizeOptions => {
    const model = options.model || 'gpt-4';
    const iterations = options.iterations || 1;
    const outputFile = options.output || `${input.replace(/\.[^.]+$/, '')}-optimized${input.match(/\.[^.]+$/)?.[0] || ''}`;

    return {
        ...options,
        output: outputFile,
        model,
        iterations
    };
};

const executeOptimizeProcess = async (input: string, processedOptions: OptimizeOptions): Promise<OptimizeResult> => {
    const startTime = Date.now();
    
    try {
        const outputFile = processedOptions.output || input;
        const model = processedOptions.model || 'gpt-4';
        const iterations = processedOptions.iterations || 1;
        
        // Mock optimization stats for demonstration
        const originalSize = 1000;
        const optimizedSize = 750;
        const compressionRatio = ((originalSize - optimizedSize) / originalSize) * 100;
        const tokensReduced = Math.floor(compressionRatio * 10);
        
        const duration = Date.now() - startTime;
        
        return {
            success: true,
            inputFile: input,
            outputFile,
            model,
            iterations,
            duration,
            optimizationStats: {
                originalSize,
                optimizedSize,
                compressionRatio: Math.round(compressionRatio * 100) / 100,
                tokensReduced
            },
            message: `Optimization completed: ${input} -> ${outputFile} using ${model} (${iterations} iteration${iterations > 1 ? 's' : ''}, ${duration}ms)`
        };
    } catch (error) {
        const duration = Date.now() - startTime;
        return {
            success: false,
            inputFile: input,
            model: processedOptions.model || 'gpt-4',
            iterations: processedOptions.iterations || 1,
            duration,
            optimizationStats: {
                originalSize: 0,
                optimizedSize: 0,
                compressionRatio: 0,
                tokensReduced: 0
            },
            message: `Optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
};

const handleOptimizeError = (input: string, error: string): OptimizeResult => ({
    success: false,
    inputFile: input,
    model: 'gpt-4',
    iterations: 1,
    duration: 0,
    optimizationStats: {
        originalSize: 0,
        optimizedSize: 0,
        compressionRatio: 0,
        tokensReduced: 0
    },
    message: `Optimization validation failed for ${input}: ${error}`
});

export const optimizeCommand = async (input: string, options: OptimizeOptions): Promise<OptimizeResult> => {
    if (!validateOptimizeInput(input)) {
        return handleOptimizeError(input, 'Input file path is required');
    }
    
    const processedOptions = processOptimizeOptions(input, options);
    
    return executeOptimizeProcess(input, processedOptions);
};

export const displayOptimizeResult = (result: OptimizeResult): void => {
    if (result.success) {
        process.stdout.write(`✅ ${result.message}\n`);
        if (result.outputFile) {
            process.stdout.write(`📄 Output: ${result.outputFile}\n`);
        }
        process.stdout.write(`🤖 Model: ${result.model}\n`);
        process.stdout.write(`🔄 Iterations: ${result.iterations}\n`);
        
        if (result.optimizationStats.compressionRatio > 0) {
            process.stdout.write('\n📊 Optimization Statistics:\n');
            process.stdout.write(`  📈 Compression: ${result.optimizationStats.compressionRatio}%\n`);
            process.stdout.write(`  🔢 Original size: ${result.optimizationStats.originalSize} bytes\n`);
            process.stdout.write(`  🗜️  Optimized size: ${result.optimizationStats.optimizedSize} bytes\n`);
            process.stdout.write(`  🎯 Tokens reduced: ${result.optimizationStats.tokensReduced}\n`);
        }
    } else {
        process.stderr.write(`❌ ${result.message}\n`);
    }
    
    process.stdout.write(`⏱️  Duration: ${result.duration}ms\n`);
    process.stdout.write('📋 Note: Full optimization functionality will be implemented in Phase 5\n');
};