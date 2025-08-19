import { marked, Token, MarkedOptions } from 'marked';
import { Result, createSuccess, createFailure, createMarkdownParseError } from '../types/error-types.js';
import {
    ConversionOptions,
    PipelineMetadata,
    SourcePosition,
    shouldPreserveSourcePositions
} from '../types/pipeline-types.js';

export function parseMarkdownToTokens(
    markdown: string,
    options: ConversionOptions,
    _metadata: PipelineMetadata
): Result<readonly Token[], import('../types/error-types.js').MarkdownParseError> {
    try {
        validateMarkdownInput(markdown, options);
        
        const tokens = marked.lexer(markdown, createMarkedOptions(options));
        
        const processedTokens = shouldPreserveSourcePositions(options) 
            ? enhanceTokensWithSourcePositions(tokens, markdown)
            : tokens;

        return createSuccess(processedTokens);
    } catch (error) {
        return createFailure(createParseError(error, markdown, options));
    }
}

function validateMarkdownInput(markdown: string, _options: ConversionOptions): void {
    if (typeof markdown !== 'string') {
        throw new Error('Markdown input must be a string');
    }
    
    if (markdown.length === 0) {
        throw new Error('Markdown input cannot be empty');
    }
    
    const maxSize = 50 * 1024 * 1024; // 50MB limit
    if (markdown.length > maxSize) {
        throw new Error(`Markdown input too large: ${markdown.length} bytes (max: ${maxSize})`);
    }
    
    try {
        const buffer = Buffer.from(markdown, 'utf8');
        if (buffer.toString('utf8') !== markdown) {
            throw new Error('Invalid UTF-8 encoding detected');
        }
    } catch {
        throw new Error('Failed to validate UTF-8 encoding');
    }
}

function createMarkedOptions(options: ConversionOptions): MarkedOptions {
    const strictMode = options.processing?.strictMode ?? false;
    
    return {
        async: false,
        breaks: false,
        gfm: true,
        pedantic: strictMode,
        silent: !strictMode,
        walkTokens: createWalkTokensFunction(options)
    };
}

function createWalkTokensFunction(options: ConversionOptions) {
    const multimodalEnabled = options.multimodal?.enableImageDetection ||
                             options.multimodal?.enableAudioDetection ||
                             options.multimodal?.enableVideoDetection;

    if (!multimodalEnabled) {
        return undefined;
    }

    return (token: Token) => {
        if (token.type === 'html') {
            const mediaMatches = detectMediaElements(token.text || token.raw, options);
            if (mediaMatches.length > 0) {
                // Add metadata to track media elements
                (token as Token & { mediaElements?: MediaDetectionResult[] }).mediaElements = mediaMatches;
            }
        }
    };
}

function detectMediaElements(html: string, options: ConversionOptions): MediaDetectionResult[] {
    const results: MediaDetectionResult[] = [];
    
    if (options.multimodal?.enableImageDetection) {
        const imageMatches = html.matchAll(/<img[^>]*>/gi);
        for (const match of imageMatches) {
            results.push({
                type: 'image',
                element: match[0],
                startIndex: match.index ?? 0
            });
        }
    }
    
    if (options.multimodal?.enableAudioDetection) {
        const audioMatches = html.matchAll(/<audio[^>]*>.*?<\/audio>/gis);
        for (const match of audioMatches) {
            results.push({
                type: 'audio',
                element: match[0],
                startIndex: match.index ?? 0
            });
        }
    }
    
    if (options.multimodal?.enableVideoDetection) {
        const videoMatches = html.matchAll(/<video[^>]*>.*?<\/video>/gis);
        for (const match of videoMatches) {
            results.push({
                type: 'video',
                element: match[0],
                startIndex: match.index ?? 0
            });
        }
    }
    
    return results;
}

interface MediaDetectionResult {
    readonly type: 'image' | 'audio' | 'video';
    readonly element: string;
    readonly startIndex: number;
}

function enhanceTokensWithSourcePositions(tokens: Token[], markdown: string): Token[] {
    const lines = markdown.split('\n');
    const lineOffsets = calculateLineOffsets(lines);
    
    return tokens.map(token => enhanceTokenWithPosition(token, lineOffsets));
}

function calculateLineOffsets(lines: readonly string[]): readonly number[] {
    const offsets: number[] = [0];
    let currentOffset = 0;
    
    for (let i = 0; i < lines.length - 1; i++) {
        currentOffset += lines[i].length + 1; // +1 for newline
        offsets.push(currentOffset);
    }
    
    return offsets;
}

function enhanceTokenWithPosition(token: Token, lineOffsets: readonly number[]): Token {
    if (!('raw' in token) || typeof token.raw !== 'string') {
        return token;
    }

    const position = findTokenPosition(token.raw, lineOffsets);
    
    return {
        ...token,
        meta: {
            ...('meta' in token ? token.meta : {}),
            sourcePosition: position
        }
    };
}

function findTokenPosition(tokenRaw: string, lineOffsets: readonly number[]): SourcePosition {
    for (let line = 0; line < lineOffsets.length; line++) {
        const lineStart = lineOffsets[line];
        const lineEnd = line < lineOffsets.length - 1 ? lineOffsets[line + 1] - 1 : Infinity;
        
        if (lineStart <= tokenRaw.length && tokenRaw.length <= lineEnd) {
            return {
                line: line + 1,
                column: tokenRaw.length - lineStart + 1,
                offset: lineStart,
                length: tokenRaw.length
            };
        }
    }
    
    return {
        line: 1,
        column: 1,
        offset: 0,
        length: tokenRaw.length
    };
}

function createParseError(
    error: unknown, 
    markdown: string, 
    options: ConversionOptions
): import('../types/error-types.js').MarkdownParseError {
    const message = error instanceof Error ? error.message : String(error);
    
    if (message.includes('encoding') || message.includes('UTF-8')) {
        return createMarkdownParseError(
            'encoding_error',
            `Encoding error: ${message}`,
            {
                sourceFile: options.sourceFile,
                originalText: markdown.substring(0, 100)
            },
            error instanceof Error ? error : undefined
        );
    }
    
    if (message.includes('too large') || message.includes('memory')) {
        return createMarkdownParseError(
            'memory_limit_error',
            `Memory or size limit exceeded: ${message}`,
            {
                sourceFile: options.sourceFile,
                metadata: { inputSize: markdown.length }
            },
            error instanceof Error ? error : undefined
        );
    }
    
    if (message.includes('access') || message.includes('permission')) {
        return createMarkdownParseError(
            'file_access_error',
            `File access error: ${message}`,
            {
                sourceFile: options.sourceFile
            },
            error instanceof Error ? error : undefined
        );
    }
    
    return createMarkdownParseError(
        'syntax_error',
        `Markdown syntax error: ${message}`,
        {
            sourceFile: options.sourceFile,
            originalText: extractErrorContext(markdown, message)
        },
        error instanceof Error ? error : undefined
    );
}

function extractErrorContext(markdown: string, _errorMessage: string): string {
    if (typeof markdown !== 'string' || markdown === null) {
        return 'Invalid markdown input';
    }
    
    const lines = markdown.split('\n');
    const maxLines = 5;
    const contextLines = lines.slice(0, maxLines);
    
    if (lines.length > maxLines) {
        contextLines.push('...');
    }
    
    return contextLines.join('\n');
}

export function createMarkdownParseStage(): import('../types/pipeline-types.js').MarkdownParseStage {
    return {
        name: 'markdown_parse',
        execute: parseMarkdownToTokens
    };
}

export function isMarkdownParseError(error: unknown): error is import('../types/error-types.js').MarkdownParseError {
    return typeof error === 'object' && 
           error !== null && 
           'type' in error && 
           error.type === 'markdown_parse_error';
}

export function validateMarkdownSize(markdown: string, maxSizeMB = 50): boolean {
    const maxBytes = maxSizeMB * 1024 * 1024;
    return Buffer.byteLength(markdown, 'utf8') <= maxBytes;
}

export function getMarkdownStats(markdown: string): MarkdownStats {
    const lines = markdown.split('\n');
    const words = markdown.split(/\s+/).filter(word => word.length > 0);
    const characters = markdown.length;
    const bytes = Buffer.byteLength(markdown, 'utf8');
    
    const headingMatches = markdown.match(/^#+\s/gm) || [];
    // Match standard markdown links: [text](url) but exclude images: ![text](url)
    const linkMatches = markdown.match(/(?<!!)\[([^\]]*)\]\(([^)]+)\)/g) || [];
    const imageMatches = markdown.match(/!\[.*?\]\(.*?\)/g) || [];
    const codeBlockMatches = markdown.match(/```[\s\S]*?```/g) || [];
    
    return {
        lines: lines.length,
        words: words.length,
        characters,
        bytes,
        headings: headingMatches.length,
        links: linkMatches.length,
        images: imageMatches.length,
        codeBlocks: codeBlockMatches.length
    };
}

export interface MarkdownStats {
    readonly lines: number;
    readonly words: number;
    readonly characters: number;
    readonly bytes: number;
    readonly headings: number;
    readonly links: number;
    readonly images: number;
    readonly codeBlocks: number;
}