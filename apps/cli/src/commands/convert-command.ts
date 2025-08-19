import { promises as fs } from 'fs';
import path from 'path';
import { convertMarkdown } from '@petk/converter';
import { ConvertOptions, CommandContext } from '../types.js';
import * as yaml from 'js-yaml';

export interface ConvertResult {
    success: boolean;
    outputFile?: string;
    duration: number;
    message: string;
    format: 'yaml' | 'json';
    stats?: {
        inputSize: number;
        outputSize: number;
        itemCount: number;
    };
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

const readInputFile = async (inputPath: string): Promise<string> => {
    try {
        await fs.access(inputPath);
        return await fs.readFile(inputPath, 'utf-8');
    } catch (error) {
        throw new Error(`Cannot read input file '${inputPath}': ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

const writeOutputFile = async (outputPath: string, content: string): Promise<void> => {
    try {
        const outputDir = path.dirname(outputPath);
        await fs.mkdir(outputDir, { recursive: true });
        await fs.writeFile(outputPath, content, 'utf-8');
    } catch (error) {
        throw new Error(`Cannot write output file '${outputPath}': ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

const convertToTargetFormat = (yamlContent: string, format: 'yaml' | 'json'): string => {
    if (format === 'json') {
        try {
            const parsed = yaml.load(yamlContent);
            return JSON.stringify(parsed, null, 2);
        } catch (error) {
            throw new Error(`Failed to convert YAML to JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    return yamlContent;
};

const executeConvertProcess = async (input: string, processedOptions: ConvertOptions): Promise<ConvertResult> => {
    const startTime = Date.now();
    
    try {
        const outputFile = processedOptions.output || input.replace('.md', '.yaml');
        const format = processedOptions.format || 'yaml';
        
        const markdownContent = await readInputFile(input);
        const inputSize = markdownContent.length;
        
        const conversionResult = await convertMarkdown(markdownContent, input);
        
        if (!conversionResult.success) {
            throw new Error(conversionResult.error?.message || 'Conversion failed');
        }
        
        const yamlContent = yaml.dump(conversionResult.data);
        const convertedContent = convertToTargetFormat(yamlContent, format);
        const outputSize = convertedContent.length;
        
        await writeOutputFile(outputFile, convertedContent);
        
        const duration = Date.now() - startTime;
        
        return {
            success: true,
            outputFile,
            duration,
            format,
            message: `Convert completed: ${input} -> ${outputFile} (${format.toUpperCase()}, ${duration}ms)`,
            stats: {
                inputSize,
                outputSize,
                itemCount: conversionResult.data?.metadata?.statistics?.contentItems || 0
            }
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
        if (result.stats) {
            console.log(`📊 Stats: ${result.stats.itemCount} items, ${result.stats.inputSize} → ${result.stats.outputSize} bytes`);
        }
    } else {
        console.error(`❌ ${result.message}`);
    }
    
    console.log(`⏱️  Duration: ${result.duration}ms`);
};