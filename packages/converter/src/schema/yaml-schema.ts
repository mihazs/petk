export const YAML_SCHEMA_VERSION = '1.0.0';

export interface DocumentMetadata {
    title?: string;
    description?: string;
    language?: string;
    created_at: string;
    source_file: string;
    content_summary: {
        total_items: number;
        content_types: Record<string, number>;
    };
}

export interface ProcessingMetadata {
    converted_at: string;
    converter_version: string;
    processing_time_ms: number;
    warnings?: string[];
}

export interface BaseContentItem {
    order: number;
    metadata?: Record<string, unknown>;
}

export interface TextContent extends BaseContentItem {
    type: 'text';
    content: string;
    format?: 'plain' | 'markdown';
}

export interface HeadingContent extends BaseContentItem {
    type: 'heading';
    content: string;
    level: 1 | 2 | 3 | 4 | 5 | 6;
    anchor?: string;
}

export interface ListContent extends BaseContentItem {
    type: 'list';
    list_type: 'ordered' | 'unordered';
    items: ListItem[];
}

export interface ListItem {
    content: string;
    order: number;
    nested_items?: ListItem[];
}

export interface CodeContent extends BaseContentItem {
    type: 'code';
    content: string;
    language?: string;
    filename?: string;
    line_numbers?: boolean;
}

export interface QuoteContent extends BaseContentItem {
    type: 'quote';
    content: string;
    citation?: string;
}

export interface LinkContent extends BaseContentItem {
    type: 'link';
    text: string;
    url: string;
    title?: string;
}

export interface TableContent extends BaseContentItem {
    type: 'table';
    headers: string[];
    rows: string[][];
    caption?: string;
}

export interface ImageContent extends BaseContentItem {
    type: 'image';
    src: string;
    alt: string;
    title?: string;
    width?: number;
    height?: number;
    format?: string;
    size_bytes?: number;
}

export interface AudioContent extends BaseContentItem {
    type: 'audio';
    src: string;
    title?: string;
    duration_seconds?: number;
    format?: string;
    size_bytes?: number;
    controls?: boolean;
    autoplay?: boolean;
    loop?: boolean;
}

export interface VideoContent extends BaseContentItem {
    type: 'video';
    src: string;
    title?: string;
    poster?: string;
    width?: number;
    height?: number;
    duration_seconds?: number;
    format?: string;
    size_bytes?: number;
    controls?: boolean;
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
}

export interface SeparatorContent extends BaseContentItem {
    type: 'separator';
    style?: 'line' | 'dashed' | 'dotted';
}

export interface ContainerContent extends BaseContentItem {
    type: 'container';
    container_type: 'div' | 'section' | 'article' | 'aside';
    children: ContentItem[];
    attributes?: Record<string, string>;
}

export type ContentItem = 
    | TextContent
    | HeadingContent
    | ListContent
    | CodeContent
    | QuoteContent
    | LinkContent
    | TableContent
    | ImageContent
    | AudioContent
    | VideoContent
    | SeparatorContent
    | ContainerContent;

export interface YamlDocument {
    version: string;
    metadata: DocumentMetadata;
    content: ContentItem[];
    processing: ProcessingMetadata;
}

export type ContentType = ContentItem['type'];

export const CONTENT_TYPES: ContentType[] = [
    'text',
    'heading',
    'list',
    'code',
    'quote',
    'link',
    'table',
    'image',
    'audio',
    'video',
    'separator',
    'container'
];

export const MULTIMODAL_TYPES: ContentType[] = [
    'image',
    'audio',
    'video'
];

export const TEXT_TYPES: ContentType[] = [
    'text',
    'heading',
    'list',
    'code',
    'quote',
    'link'
];

export const STRUCTURAL_TYPES: ContentType[] = [
    'table',
    'separator',
    'container'
];

export function createDocumentMetadata(
    sourceFile: string,
    contentItems: ContentItem[],
    options: {
        title?: string;
        description?: string;
        language?: string;
    } = {}
): DocumentMetadata {
    const contentTypeCounts = contentItems.reduce((counts, item) => {
        counts[item.type] = (counts[item.type] || 0) + 1;
        return counts;
    }, {} as Record<string, number>);

    return {
        title: options.title,
        description: options.description,
        language: options.language || 'en',
        created_at: new Date().toISOString(),
        source_file: sourceFile,
        content_summary: {
            total_items: contentItems.length,
            content_types: contentTypeCounts
        }
    };
}

export function createProcessingMetadata(
    converterVersion: string,
    processingTimeMs: number,
    warnings: string[] = []
): ProcessingMetadata {
    return {
        converted_at: new Date().toISOString(),
        converter_version: converterVersion,
        processing_time_ms: processingTimeMs,
        warnings: warnings.length > 0 ? warnings : undefined
    };
}

export function createYamlDocument(
    sourceFile: string,
    contentItems: ContentItem[],
    converterVersion: string,
    processingTimeMs: number,
    options: {
        title?: string;
        description?: string;
        language?: string;
        warnings?: string[];
    } = {}
): YamlDocument {
    return {
        version: YAML_SCHEMA_VERSION,
        metadata: createDocumentMetadata(sourceFile, contentItems, options),
        content: contentItems,
        processing: createProcessingMetadata(
            converterVersion,
            processingTimeMs,
            options.warnings
        )
    };
}

export function isMultimodalContent(content: ContentItem): content is ImageContent | AudioContent | VideoContent {
    return MULTIMODAL_TYPES.includes(content.type);
}

export function isTextContent(content: ContentItem): content is TextContent | HeadingContent | ListContent | CodeContent | QuoteContent | LinkContent {
    return TEXT_TYPES.includes(content.type);
}

export function isStructuralContent(content: ContentItem): content is TableContent | SeparatorContent | ContainerContent {
    return STRUCTURAL_TYPES.includes(content.type);
}

export function validateContentItem(item: unknown): item is ContentItem {
    if (!item || typeof item !== 'object') {
        return false;
    }

    const obj = item as Record<string, unknown>;
    
    if (typeof obj.type !== 'string' || !CONTENT_TYPES.includes(obj.type as ContentType)) {
        return false;
    }

    if (typeof obj.order !== 'number') {
        return false;
    }

    return true;
}

export function sortContentByOrder(content: ContentItem[]): ContentItem[] {
    return [...content].sort((a, b) => a.order - b.order);
}