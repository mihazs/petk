import { promises as fs } from 'fs';
import path from 'path';
import { convertMarkdown } from '@petk/converter';
import { ConvertOptions } from '../types.js';
import * as yaml from 'js-yaml';

interface NodeJSError extends Error {
    code?: string;
}

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

const validateConvertInput = (input: string): { isValid: boolean; error?: string } => {
    if (!input || typeof input !== 'string') {
        return { isValid: false, error: 'Input must be a non-empty string' };
    }
    
    if (input.length === 0) {
        return { isValid: false, error: 'Input filename cannot be empty' };
    }
    
    if (input.length > 260) { // Windows MAX_PATH limit
        return { isValid: false, error: 'Input filename too long (max 260 characters)' };
    }
    
    // Security: Check for path traversal attempts
    if (input.includes('..') || input.includes('\0')) {
        return { isValid: false, error: 'Invalid characters in filename (security)' };
    }
    
    // Check for valid markdown extension
    if (!input.endsWith('.md')) {
        return { isValid: false, error: 'Input must be a .md file' };
    }
    
    // Security: Ensure filename doesn't start with special characters
    const filename = input.split('/').pop() || input.split('\\').pop() || input;
    if (filename.startsWith('.') && filename !== '.md') {
        return { isValid: false, error: 'Hidden files not allowed' };
    }
    
    return { isValid: true };
};

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
        // Security: Resolve path to prevent traversal attacks
        const resolvedPath = path.resolve(inputPath);
        
        // Check if file exists and is accessible
        await fs.access(resolvedPath, fs.constants.R_OK);
        
        // Check file stats for additional validation
        const stats = await fs.stat(resolvedPath);
        
        // Security: Ensure it's a file, not a directory or special file
        if (!stats.isFile()) {
            throw new Error('Input must be a regular file');
        }
        
        // Performance: Check file size limit (50MB)
        const maxSize = 50 * 1024 * 1024;
        if (stats.size > maxSize) {
            throw new Error(`File too large: ${stats.size} bytes (max: ${maxSize})`);
        }
        
        // Performance: Check available memory before reading large files
        if (stats.size > 10 * 1024 * 1024) { // 10MB threshold
            const memUsage = process.memoryUsage();
            const availableMemory = memUsage.heapTotal - memUsage.heapUsed;
            if (stats.size > availableMemory * 0.5) {
                throw new Error('Insufficient memory to process file');
            }
        }
        
        return await fs.readFile(resolvedPath, 'utf-8');
    } catch (error) {
        if (error instanceof Error) {
            // Cast to NodeJS.ErrnoException to access code property
            const nodeError = error as NodeJSError;
            
            // Provide more specific error messages
            if (nodeError.code === 'ENOENT') {
                throw new Error(`Input file '${inputPath}' does not exist`);
            }
            if (nodeError.code === 'EACCES') {
                throw new Error(`Permission denied reading file '${inputPath}'`);
            }
            if (nodeError.code === 'EISDIR') {
                throw new Error(`'${inputPath}' is a directory, not a file`);
            }
            throw new Error(`Cannot read input file '${inputPath}': ${error.message}`);
        }
        throw new Error(`Cannot read input file '${inputPath}': Unknown error`);
    }
};

const writeOutputFile = async (outputPath: string, content: string): Promise<void> => {
    try {
        // Security: Resolve path to prevent traversal attacks
        const resolvedPath = path.resolve(outputPath);
        const outputDir = path.dirname(resolvedPath);
        
        // Security: Validate output path doesn't escape working directory
        const workingDir = process.cwd();
        if (!resolvedPath.startsWith(workingDir)) {
            throw new Error('Output path outside working directory not allowed');
        }
        
        // Performance: Check available disk space (basic check via memory)
        const contentSize = Buffer.byteLength(content, 'utf-8');
        const memUsage = process.memoryUsage();
        if (contentSize > memUsage.heapTotal * 0.8) {
            throw new Error('Content too large to write safely');
        }
        
        // Create output directory with proper error handling
        try {
            await fs.mkdir(outputDir, { recursive: true });
        } catch (mkdirError) {
            if (mkdirError instanceof Error) {
                const nodeError = mkdirError as NodeJSError;
                if (nodeError.code !== 'EEXIST') {
                    throw new Error(`Cannot create output directory '${outputDir}': ${mkdirError.message}`);
                }
            }
        }
        
        // Check if output file already exists and warn
        try {
            await fs.access(resolvedPath);
            // File exists, we'll overwrite it
        } catch {
            // File doesn't exist, which is fine
        }
        
        // Write the file
        await fs.writeFile(resolvedPath, content, 'utf-8');
        
    } catch (error) {
        if (error instanceof Error) {
            // Cast to NodeJS.ErrnoException to access code property
            const nodeError = error as NodeJSError;
            
            // Provide more specific error messages
            if (nodeError.code === 'EACCES') {
                throw new Error(`Permission denied writing to '${outputPath}'`);
            }
            if (nodeError.code === 'ENOSPC') {
                throw new Error(`No space left on device for '${outputPath}'`);
            }
            if (nodeError.code === 'EROFS') {
                throw new Error(`Read-only filesystem, cannot write to '${outputPath}'`);
            }
            throw error; // Re-throw our custom errors or other errors with original message
        }
        throw new Error(`Cannot write output file '${outputPath}': Unknown error`);
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
    
    const processedOptions = processConvertOptions(input, options);
    
    return executeConvertProcess(input, processedOptions);
};

export const displayConvertResult = (result: ConvertResult): void => {
    if (result.success) {
        process.stdout.write(`✅ ${result.message}\n`);
        if (result.outputFile) {
            process.stdout.write(`📄 Output: ${result.outputFile} (${result.format.toUpperCase()})\n`);
        }
        if (result.stats) {
            process.stdout.write(`📊 Stats: ${result.stats.itemCount} items, ${result.stats.inputSize} → ${result.stats.outputSize} bytes\n`);
        }
    } else {
        process.stderr.write(`❌ ${result.message}\n`);
    }
    
    process.stdout.write(`⏱️  Duration: ${result.duration}ms\n`);
};