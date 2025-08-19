import { dump } from 'js-yaml';
import type {
    ContentItem,
    ParagraphItem,
    HeadingItem,
    ImageItem,
    AudioItem,
    VideoItem,
    ListItem,
    CodeBlockItem,
    TableItem,
    BlockquoteItem,
    LinkItem
} from '../types.js';

export interface YamlConversionOptions {
    indent?: number;
    lineWidth?: number;
    includeMetadata?: boolean;
    sortByOrder?: boolean;
    verbose?: boolean;
}

export interface YamlConversionResult<T> {
    success: boolean;
    data?: T;
    error?: YamlConversionError | ContentValidationError | EmptyContentError;
    metadata?: Record<string, unknown>;
}

export interface YamlConversionError {
    type: 'yaml_conversion_error';
    message: string;
    code: string;
    name: string;
    yamlError?: string;
}

export interface ContentValidationError {
    type: 'content_validation_error';
    message: string;
    code: string;
    name: string;
    invalidItems?: string[];
}

export interface EmptyContentError {
    type: 'empty_content_error';
    message: string;
    code: string;
    name: string;
}

const validateContentItem = (item: ContentItem): boolean => {
    if (!item || typeof item !== 'object') return false;
    if (!item.id || typeof item.id !== 'string') return false;
    if (!item.type || typeof item.type !== 'string') return false;
    if (typeof item.order !== 'number' || item.order < 0) return false;
    if (typeof item.sourceLineStart !== 'number' || item.sourceLineStart < 1) return false;
    if (typeof item.sourceLineEnd !== 'number' || item.sourceLineEnd < item.sourceLineStart) return false;

    switch (item.type) {
        case 'paragraph':
            return typeof (item as ParagraphItem).text === 'string';
        case 'heading':
            return typeof (item as HeadingItem).text === 'string';
        case 'image':
        case 'video':
        case 'audio':
            return typeof (item as ImageItem | VideoItem | AudioItem).src === 'string' &&
                   (item as ImageItem | VideoItem | AudioItem).src.length > 0;
        case 'list':
            return Array.isArray((item as ListItem).items);
        case 'code_block':
            return typeof (item as CodeBlockItem).code === 'string';
        case 'table':
            return Array.isArray((item as TableItem).rows);
        case 'blockquote':
            return Array.isArray((item as BlockquoteItem).content);
        case 'link':
            return typeof (item as LinkItem).href === 'string' &&
                   typeof (item as LinkItem).text === 'string';
        case 'horizontal_rule':
            return true;
        default:
            return false;
    }
};

const preprocessContentItems = (items: ContentItem[]): ContentItem[] => {
    const validItems = items.filter(validateContentItem);
    return validItems.sort((a, b) => a.order - b.order);
};

const createYamlDumpOptions = (options: YamlConversionOptions) => ({
    indent: options.indent || 2,
    lineWidth: options.lineWidth || 120,
    noRefs: true,
    sortKeys: false,
    quotingType: '"' as const,
    forceQuotes: false,
    condenseFlow: false,
    noArrayIndent: false
});

const createConversionMetadata = (options: YamlConversionOptions) => {
    if (!options.includeMetadata) return null;
    
    return {
        conversionTimestamp: new Date().toISOString(),
        converterVersion: '1.0.0',
        yamlOptions: {
            indent: options.indent || 2,
            lineWidth: options.lineWidth || 120
        }
    };
};

const logVerbose = (message: string, verbose?: boolean): void => {
    if (verbose) {
        process.stdout.write(`[YAML Converter] ${message}\n`);
    }
};

const createError = (type: string, message: string, details?: Record<string, unknown>, extra?: Record<string, unknown>): YamlConversionError | ContentValidationError | EmptyContentError => {
    const baseError = {
        message,
        code: type.toUpperCase(),
        name: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        ...details,
        ...extra
    };

    switch (type) {
        case 'yaml_conversion_error':
            return { type: 'yaml_conversion_error' as const, ...baseError };
        case 'content_validation_error':
            return { type: 'content_validation_error' as const, ...baseError };
        case 'empty_content_error':
            return { type: 'empty_content_error' as const, ...baseError };
        default:
            return { type: 'yaml_conversion_error' as const, ...baseError };
    }
};

export const convertToYaml = (
    contentItems: ContentItem[],
    options: YamlConversionOptions = {}
): YamlConversionResult<string> => {
    try {
        if (!Array.isArray(contentItems)) {
            return {
                success: false,
                error: createError('content_validation_error', 'Content items must be an array', {
                    details: { providedType: typeof contentItems }
                })
            };
        }

        logVerbose(`Starting YAML conversion for ${contentItems.length} items`, options.verbose);

        if (contentItems.length === 0) {
            return {
                success: false,
                error: createError('empty_content_error', 'Cannot convert empty content array to YAML', {
                    details: { itemCount: 0 }
                })
            };
        }

        const validItems = preprocessContentItems(contentItems);
        const invalidCount = contentItems.length - validItems.length;
        
        if (invalidCount > 0) {
            logVerbose(`Filtered out ${invalidCount} invalid items`, options.verbose);
        }

        if (validItems.length === 0) {
            return {
                success: false,
                error: createError('content_validation_error', 'No valid content items found after validation', {
                    details: {
                        totalItems: contentItems.length,
                        validItems: 0,
                        invalidItems: invalidCount
                    }
                })
            };
        }

        const yamlData = options.includeMetadata
            ? {
                metadata: createConversionMetadata(options),
                content: validItems
              }
            : validItems;

        const yamlOptions = createYamlDumpOptions(options);
        const yamlString = dump(yamlData, yamlOptions);

        logVerbose(`Successfully converted ${validItems.length} items to YAML`, options.verbose);

        return {
            success: true,
            data: yamlString,
            metadata: {
                itemsProcessed: validItems.length,
                itemsFiltered: invalidCount,
                yamlLength: yamlString.length
            }
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown YAML conversion error';
        
        return {
            success: false,
            error: createError('yaml_conversion_error', 'Failed to convert content items to YAML', {
                details: {
                    originalError: errorMessage,
                    itemCount: contentItems?.length || 0
                },
                yamlError: errorMessage
            })
        };
    }
};

export const validateContentItems = (items: ContentItem[]): YamlConversionResult<ContentItem[]> => {
    if (!Array.isArray(items)) {
        return {
            success: false,
            error: createError('content_validation_error', 'Items must be an array', {
                details: { providedType: typeof items }
            })
        };
    }

    const validItems = items.filter(validateContentItem);
    const invalidItems = items.filter(item => !validateContentItem(item));

    if (invalidItems.length > 0) {
        return {
            success: false,
            error: createError('content_validation_error', `Found ${invalidItems.length} invalid content items`, {
                details: {
                    totalItems: items.length,
                    validItems: validItems.length,
                    invalidItems: invalidItems.length
                },
                invalidItems: invalidItems.map((item, index) =>
                    `Item ${index}: missing or invalid ${!item?.id ? 'id' : !item?.type ? 'type' : 'properties'}`
                )
            })
        };
    }

    return {
        success: true,
        data: validItems
    };
};