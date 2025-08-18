import { OptimizeOptions, CommandContext } from '../types.js';

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

const createOptimizeContext = (input: string, options: OptimizeOptions): CommandContext => ({
    options,
    args: [input]
});

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
    
    const context = createOptimizeContext(input, options);
    const processedOptions = processOptimizeOptions(input, options);
    
    return executeOptimizeProcess(input, processedOptions);
};

export const displayOptimizeResult = (result: OptimizeResult): void => {
    if (result.success) {
        console.log(`✅ ${result.message}`);
        if (result.outputFile) {
            console.log(`📄 Output: ${result.outputFile}`);
        }
        console.log(`🤖 Model: ${result.model}`);
        console.log(`🔄 Iterations: ${result.iterations}`);
        
        if (result.optimizationStats.compressionRatio > 0) {
            console.log('\n📊 Optimization Statistics:');
            console.log(`  📈 Compression: ${result.optimizationStats.compressionRatio}%`);
            console.log(`  🔢 Original size: ${result.optimizationStats.originalSize} bytes`);
            console.log(`  🗜️  Optimized size: ${result.optimizationStats.optimizedSize} bytes`);
            console.log(`  🎯 Tokens reduced: ${result.optimizationStats.tokensReduced}`);
        }
    } else {
        console.error(`❌ ${result.message}`);
    }
    
    console.log(`⏱️  Duration: ${result.duration}ms`);
    console.log('📋 Note: Full optimization functionality will be implemented in Phase 5');
};