export interface MarkdownToYamlOutput {
    metadata: DocumentMetadata;
    content: ContentItem[];
    structure: DocumentStructure;
}

export interface DocumentMetadata {
    title?: string;
    author?: string;
    createdAt?: string;
    modifiedAt?: string;
    source: {
        filename: string;
        path: string;
        size: number;
        encoding: string;
    };
    parsing: {
        parser: 'marked';
        version: string;
        timestamp: string;
        options: Record<string, unknown>;
    };
    statistics: {
        totalLines: number;
        contentItems: number;
        wordCount: number;
        characterCount: number;
        multimodalItems: number;
    };
}

export interface DocumentStructure {
    headings: HeadingStructure[];
    tableOfContents: TocEntry[];
    multimodalAssets: MultimodalAsset[];
}

export interface HeadingStructure {
    id: string;
    level: number;
    text: string;
    order: number;
    children: HeadingStructure[];
}

export interface TocEntry {
    id: string;
    title: string;
    level: number;
    anchor: string;
    page?: number;
}

export interface MultimodalAsset {
    id: string;
    type: 'image' | 'audio' | 'video';
    src: string;
    contentItemId: string;
    metadata: Record<string, unknown>;
}

export interface BaseContentItem {
    id: string;
    type: string;
    order: number;
    sourceLineStart: number;
    sourceLineEnd: number;
}

export interface ParagraphItem extends BaseContentItem {
    type: 'paragraph';
    text: string;
    formatting?: TextFormatting[];
}

export interface HeadingItem extends BaseContentItem {
    type: 'heading';
    level: 1 | 2 | 3 | 4 | 5 | 6;
    text: string;
    anchor?: string;
}

export interface ImageItem extends BaseContentItem {
    type: 'image';
    src: string;
    alt?: string;
    title?: string;
    dimensions?: { width: number; height: number };
    format?: string;
}

export interface AudioItem extends BaseContentItem {
    type: 'audio';
    src: string;
    duration?: number;
    format?: string;
    transcript?: string;
}

export interface VideoItem extends BaseContentItem {
    type: 'video';
    src: string;
    duration?: number;
    format?: string;
    thumbnail?: string;
    captions?: string;
}

export interface ListItem extends BaseContentItem {
    type: 'list';
    listType: 'ordered' | 'unordered';
    items: ListItemContent[];
}

export interface CodeBlockItem extends BaseContentItem {
    type: 'code_block';
    language?: string;
    code: string;
    highlighted?: boolean;
}

export interface TableItem extends BaseContentItem {
    type: 'table';
    headers: string[];
    rows: string[][];
    alignment?: ('left' | 'center' | 'right')[];
}

export interface BlockquoteItem extends BaseContentItem {
    type: 'blockquote';
    content: ContentItem[];
}

export interface LinkItem extends BaseContentItem {
    type: 'link';
    href: string;
    text: string;
    title?: string;
}

export interface HorizontalRuleItem extends BaseContentItem {
    type: 'horizontal_rule';
}

export interface TextFormatting {
    type: 'bold' | 'italic' | 'strikethrough' | 'code';
    start: number;
    end: number;
}

export type ListItemContent = string | ContentItem[];

export type MultimodalContent = ImageItem | AudioItem | VideoItem;

export type ContentItem =
    | ParagraphItem
    | HeadingItem
    | ImageItem
    | AudioItem
    | VideoItem
    | ListItem
    | CodeBlockItem
    | TableItem
    | BlockquoteItem
    | LinkItem
    | HorizontalRuleItem;

export interface ConversionOptions {
    includeMetadata?: boolean;
    includeStructure?: boolean;
    preserveFormatting?: boolean;
    processMultimodal?: boolean;
    generateToc?: boolean;
    customParsing?: Record<string, unknown>;
    yamlIndent?: number;
    yamlLineWidth?: number;
    yamlSortKeys?: boolean;
    yamlFlowLevel?: number;
}

export interface YamlMetadata {
    sourceFile: string;
    generatedAt: string;
    totalItems: number;
    itemTypeCounts: Record<string, number>;
    version: string;
}

export interface YamlOutput {
    metadata: YamlMetadata;
    content: ContentItem[];
}

export interface ConversionError extends Error {
    code: string;
    line?: number;
    column?: number;
    context?: string;
}

export type ConversionResult = {
    success: true;
    data: MarkdownToYamlOutput;
} | {
    success: false;
    error: ConversionError;
    partialData?: Partial<MarkdownToYamlOutput>;
};