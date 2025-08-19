import { parseMarkdownToTokens } from './parser/markdown-parser.js';
import { transformMarkdownTokens } from './parser/ast-transformer.js';
import { convertToYaml } from './converter/yaml-converter.js';
import type {
    ConversionOptions,
    ConversionResult,
    MarkdownToYamlOutput,
    ConversionError,
    YamlOutput,
    ContentItem
} from './types.js';

export interface MarkdownToYamlConverter {
    convert: (markdownContent: string, options?: ConversionOptions) => Promise<ConversionResult>;
    convertSync: (markdownContent: string, options?: ConversionOptions) => ConversionResult;
}

export interface ConverterContext {
    sourceFilename: string;
    options: ConversionOptions;
}

const createConversionError = (message: string, code: string, originalError?: Error): ConversionError => {
    const error = new Error(message) as ConversionError;
    error.code = code;
    error.context = originalError ? `Original error: ${originalError.message}` : undefined;
    return error;
};

const createDefaultOptions = (): ConversionOptions => ({
    includeMetadata: true,
    includeStructure: true,
    preserveFormatting: true,
    processMultimodal: true,
    generateToc: true,
    customParsing: {},
    yamlIndent: 2,
    yamlLineWidth: 120,
    yamlSortKeys: false,
    yamlFlowLevel: -1
});

const mergeOptions = (userOptions: ConversionOptions = {}): ConversionOptions => ({
    ...createDefaultOptions(),
    ...userOptions
});

const createConverterContext = (sourceFilename: string, options: ConversionOptions): ConverterContext => ({
    sourceFilename,
    options
});

const convertMarkdownToYaml = (markdownContent: string, context: ConverterContext): ConversionResult => {
    try {
        if (!markdownContent || typeof markdownContent !== 'string') {
            return {
                success: false,
                error: createConversionError(
                    'Invalid markdown content provided',
                    'INVALID_INPUT'
                )
            };
        }

        if (markdownContent.trim().length === 0) {
            return {
                success: false,
                error: createConversionError(
                    'Empty markdown content provided',
                    'EMPTY_INPUT'
                )
            };
        }

        const parseResult = parseMarkdownToTokens(markdownContent, context.options, {
            totalStages: 1,
            currentStage: 0,
            warnings: [],
            processingTime: 0,
            memoryUsage: { initial: 0, peak: 0, final: 0 }
        });

        if (!parseResult.success) {
            return {
                success: false,
                error: createConversionError(
                    `Markdown parsing failed: ${parseResult.error?.message || 'Unknown error'}`,
                    'PARSING_FAILED',
                    parseResult.error instanceof Error ? parseResult.error : undefined
                )
            };
        }

        const tokensWithLinks = Object.assign(parseResult.data, { links: {} });
        const transformResult = transformMarkdownTokens(tokensWithLinks, {
            sourceFilename: context.sourceFilename,
            options: context.options,
            idCounter: 0
        });

        if (!transformResult.success) {
            return {
                success: false,
                error: createConversionError(
                    `Token transformation failed: ${transformResult.error?.message || 'Unknown error'}`,
                    'TRANSFORMATION_FAILED',
                    transformResult.error instanceof Error ? transformResult.error : undefined
                )
            };
        }

        const yamlResult = convertToYaml(transformResult.contentItems, {
            includeMetadata: context.options.includeMetadata,
            indent: context.options.yamlIndent || 2,
            lineWidth: context.options.yamlLineWidth || 120
        });

        if (!yamlResult.success) {
            return {
                success: false,
                error: createConversionError(
                    `YAML conversion failed: ${yamlResult.error?.message || 'Unknown error'}`,
                    'YAML_CONVERSION_FAILED',
                    yamlResult.error instanceof Error ? yamlResult.error : undefined
                )
            };
        }

        const output: MarkdownToYamlOutput = createMarkdownToYamlOutput(
            yamlResult.data || '',
            transformResult.contentItems,
            context
        );

        return {
            success: true,
            data: output
        };

    } catch (error) {
        const conversionError = error instanceof Error 
            ? createConversionError(
                `Unexpected conversion error: ${error.message}`,
                'UNEXPECTED_ERROR',
                error
            )
            : createConversionError(
                'Unknown conversion error occurred',
                'UNKNOWN_ERROR'
            );

        return {
            success: false,
            error: conversionError
        };
    }
};

const createMarkdownToYamlOutput = (
    yamlOutput: string,
    contentItems: ContentItem[],
    context: ConverterContext
): MarkdownToYamlOutput => {
    const now = new Date().toISOString();
    
    return {
        metadata: {
            title: extractTitle(contentItems),
            author: undefined,
            createdAt: now,
            modifiedAt: now,
            source: {
                filename: context.sourceFilename,
                path: context.sourceFilename,
                size: 0,
                encoding: 'utf-8'
            },
            parsing: {
                parser: 'marked',
                version: '16.2.0',
                timestamp: now,
                options: context.options.customParsing || {}
            },
            statistics: {
                totalLines: 0,
                contentItems: contentItems.length,
                wordCount: calculateWordCount(contentItems),
                characterCount: calculateCharacterCount(contentItems),
                multimodalItems: countMultimodalItems(contentItems)
            }
        },
        content: contentItems,
        structure: {
            headings: extractHeadingStructure(contentItems),
            tableOfContents: context.options.generateToc ? generateTableOfContents(contentItems) : [],
            multimodalAssets: extractMultimodalAssets(contentItems)
        }
    };
};

const extractTitle = (contentItems: ContentItem[]): string | undefined => {
    const firstHeading = contentItems.find(item => item.type === 'heading' && (item as any).level === 1);
    return (firstHeading as any)?.text;
};

const calculateWordCount = (contentItems: ContentItem[]): number => {
    return contentItems.reduce((count, item) => {
        if (item.type === 'paragraph' || item.type === 'heading') {
            return count + ((item as any).text?.split(/\s+/).length || 0);
        }
        return count;
    }, 0);
};

const calculateCharacterCount = (contentItems: ContentItem[]): number => {
    return contentItems.reduce((count, item) => {
        if (item.type === 'paragraph' || item.type === 'heading') {
            return count + ((item as any).text?.length || 0);
        }
        return count;
    }, 0);
};

const countMultimodalItems = (contentItems: ContentItem[]): number => {
    return contentItems.filter(item =>
        item.type === 'image' || item.type === 'audio' || item.type === 'video'
    ).length;
};

const extractHeadingStructure = (contentItems: ContentItem[]): any[] => {
    return contentItems
        .filter(item => item.type === 'heading')
        .map(heading => ({
            id: heading.id,
            level: (heading as any).level,
            text: (heading as any).text,
            order: heading.order,
            children: []
        }));
};

const generateTableOfContents = (contentItems: ContentItem[]): any[] => {
    return contentItems
        .filter(item => item.type === 'heading')
        .map(heading => ({
            id: heading.id,
            title: (heading as any).text,
            level: (heading as any).level,
            anchor: (heading as any).anchor || heading.id
        }));
};

const extractMultimodalAssets = (contentItems: ContentItem[]): any[] => {
    return contentItems
        .filter(item => item.type === 'image' || item.type === 'audio' || item.type === 'video')
        .map(item => ({
            id: item.id,
            type: item.type,
            src: (item as any).src,
            contentItemId: item.id,
            metadata: {}
        }));
};

export const createConverter = (sourceFilename: string = 'unknown.md'): MarkdownToYamlConverter => {
    return {
        convert: async (markdownContent: string, options?: ConversionOptions): Promise<ConversionResult> => {
            const mergedOptions = mergeOptions(options);
            const context = createConverterContext(sourceFilename, mergedOptions);
            return convertMarkdownToYaml(markdownContent, context);
        },

        convertSync: (markdownContent: string, options?: ConversionOptions): ConversionResult => {
            const mergedOptions = mergeOptions(options);
            const context = createConverterContext(sourceFilename, mergedOptions);
            return convertMarkdownToYaml(markdownContent, context);
        }
    };
};

export const convertMarkdown = async (
    markdownContent: string, 
    sourceFilename: string = 'unknown.md',
    options?: ConversionOptions
): Promise<ConversionResult> => {
    const converter = createConverter(sourceFilename);
    return converter.convert(markdownContent, options);
};

export const convertMarkdownSync = (
    markdownContent: string, 
    sourceFilename: string = 'unknown.md',
    options?: ConversionOptions
): ConversionResult => {
    const converter = createConverter(sourceFilename);
    return converter.convertSync(markdownContent, options);
};

export * from './types.js';
export * from './parser/markdown-parser.js';
export { transformMarkdownTokens, validateContentItems } from './parser/ast-transformer.js';
export { convertToYaml, validateContentItems as validateContentItemsYaml } from './converter/yaml-converter.js';