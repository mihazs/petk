import type { Token, TokensList } from 'marked';
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
    LinkItem,
    HorizontalRuleItem,
    ConversionError,
    ConversionOptions
} from '../types.js';
import { detectMultimodalContent, createMultimodalDetectionContext } from '../converter/multimodal-detector.js';

export type TransformResult = {
    success: true;
    contentItems: ContentItem[];
    metadata: TransformMetadata;
} | {
    success: false;
    error: ConversionError;
    partialItems?: ContentItem[];
};

export interface TransformMetadata {
    totalItems: number;
    itemTypes: Record<string, number>;
    transformedAt: string;
}

export interface TransformContext {
    options: ConversionOptions;
    sourceFilename: string;
    idCounter: number;
}

const createTransformError = (message: string, code: string, token?: Token): ConversionError => {
    const error = new Error(message) as ConversionError;
    error.code = code;
    error.context = token ? `Token type: ${token.type}` : undefined;
    return error;
};

const generateContentItemId = (context: TransformContext, type: string): string => {
    const id = `${type}_${context.idCounter}`;
    context.idCounter += 1;
    return id;
};

const getSourceLines = (token: Token): { start: number; end: number } => {
    return { start: 1, end: 1 };
};

const transformParagraphToken = (token: Token & { type: 'paragraph' }, context: TransformContext, order: number): ParagraphItem => ({
    id: generateContentItemId(context, 'paragraph'),
    type: 'paragraph',
    order,
    sourceLineStart: getSourceLines(token).start,
    sourceLineEnd: getSourceLines(token).end,
    text: token.text || ''
});

const transformHeadingToken = (token: Token & { type: 'heading' }, context: TransformContext, order: number): HeadingItem => ({
    id: generateContentItemId(context, 'heading'),
    type: 'heading',
    order,
    sourceLineStart: getSourceLines(token).start,
    sourceLineEnd: getSourceLines(token).end,
    level: (token.depth || 1) as 1 | 2 | 3 | 4 | 5 | 6,
    text: token.text || '',
    anchor: generateAnchor(token.text || '')
});

const transformImageToken = (token: Token & { type: 'image' }, context: TransformContext, order: number): ImageItem => ({
    id: generateContentItemId(context, 'image'),
    type: 'image',
    order,
    sourceLineStart: getSourceLines(token).start,
    sourceLineEnd: getSourceLines(token).end,
    src: token.href || '',
    alt: token.text,
    title: token.title
});

const transformListToken = (token: Token & { type: 'list' }, context: TransformContext, order: number): ListItem => ({
    id: generateContentItemId(context, 'list'),
    type: 'list',
    order,
    sourceLineStart: getSourceLines(token).start,
    sourceLineEnd: getSourceLines(token).end,
    listType: token.ordered ? 'ordered' : 'unordered',
    items: transformListItems(token.items || [])
});

const transformCodeBlockToken = (token: Token & { type: 'code' }, context: TransformContext, order: number): CodeBlockItem => ({
    id: generateContentItemId(context, 'code_block'),
    type: 'code_block',
    order,
    sourceLineStart: getSourceLines(token).start,
    sourceLineEnd: getSourceLines(token).end,
    language: token.lang,
    code: token.text || '',
    highlighted: false
});

const transformTableToken = (token: Token & { type: 'table' }, context: TransformContext, order: number): TableItem => ({
    id: generateContentItemId(context, 'table'),
    type: 'table',
    order,
    sourceLineStart: getSourceLines(token).start,
    sourceLineEnd: getSourceLines(token).end,
    headers: token.header?.map((cell: any) => cell.text || '') || [],
    rows: token.rows?.map((row: any) => row.map((cell: any) => cell.text || '')) || [],
    alignment: token.align as ('left' | 'center' | 'right')[] | undefined
});

const transformBlockquoteToken = (token: Token & { type: 'blockquote' }, context: TransformContext, order: number): BlockquoteItem => ({
    id: generateContentItemId(context, 'blockquote'),
    type: 'blockquote',
    order,
    sourceLineStart: getSourceLines(token).start,
    sourceLineEnd: getSourceLines(token).end,
    content: token.tokens ? transformTokensToContentItems({ ...token.tokens, links: {} } as TokensList, context, 0).contentItems : []
});

const transformLinkToken = (token: Token & { type: 'link' }, context: TransformContext, order: number): LinkItem => ({
    id: generateContentItemId(context, 'link'),
    type: 'link',
    order,
    sourceLineStart: getSourceLines(token).start,
    sourceLineEnd: getSourceLines(token).end,
    href: token.href || '',
    text: token.text || '',
    title: token.title
});

const transformHorizontalRuleToken = (token: Token & { type: 'hr' }, context: TransformContext, order: number): HorizontalRuleItem => ({
    id: generateContentItemId(context, 'horizontal_rule'),
    type: 'horizontal_rule',
    order,
    sourceLineStart: getSourceLines(token).start,
    sourceLineEnd: getSourceLines(token).end
});

const generateAnchor = (text: string): string => {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
};

const transformListItems = (items: any[]): string[] => {
    return items.map(item => {
        if (typeof item === 'string') return item;
        if (item.text) return item.text;
        return '';
    });
};

const createMultimodalContentItem = (
    detectionResult: import('../converter/multimodal-detector.js').MultimodalDetectionResult,
    context: TransformContext,
    order: number
): ContentItem | null => {
    if (!detectionResult.isMultimodal || !detectionResult.mediaType || !detectionResult.src) {
        return null;
    }

    const baseProps = {
        id: generateContentItemId(context, detectionResult.mediaType),
        order,
        sourceLineStart: getSourceLines(detectionResult.originalToken).start,
        sourceLineEnd: getSourceLines(detectionResult.originalToken).end,
        src: detectionResult.src
    };

    switch (detectionResult.mediaType) {
        case 'image':
            return {
                ...baseProps,
                type: 'image',
                alt: detectionResult.metadata?.alt as string | undefined,
                title: detectionResult.metadata?.title as string | undefined
            } as ImageItem;
        case 'video':
            return {
                ...baseProps,
                type: 'video',
                thumbnail: detectionResult.metadata?.poster as string | undefined
            } as VideoItem;
        case 'audio':
            return {
                ...baseProps,
                type: 'audio'
            } as AudioItem;
        default:
            return null;
    }
};

const transformSingleToken = (token: Token, context: TransformContext, order: number): ContentItem | null => {
    try {
        const multimodalDetection = detectMultimodalContent(token, createMultimodalDetectionContext({
            enableVideoDetection: context.options.processMultimodal || true,
            enableAudioDetection: context.options.processMultimodal || true
        }));

        if (multimodalDetection.isMultimodal) {
            const multimodalItem = createMultimodalContentItem(multimodalDetection, context, order);
            if (multimodalItem) {
                return multimodalItem;
            }
        }

        switch (token.type) {
            case 'paragraph':
                return transformParagraphToken(token as Token & { type: 'paragraph' }, context, order);
            case 'heading':
                return transformHeadingToken(token as Token & { type: 'heading' }, context, order);
            case 'image':
                return transformImageToken(token as Token & { type: 'image' }, context, order);
            case 'list':
                return transformListToken(token as Token & { type: 'list' }, context, order);
            case 'code':
                return transformCodeBlockToken(token as Token & { type: 'code' }, context, order);
            case 'table':
                return transformTableToken(token as Token & { type: 'table' }, context, order);
            case 'blockquote':
                return transformBlockquoteToken(token as Token & { type: 'blockquote' }, context, order);
            case 'link':
                return transformLinkToken(token as Token & { type: 'link' }, context, order);
            case 'hr':
                return transformHorizontalRuleToken(token as Token & { type: 'hr' }, context, order);
            case 'space':
            case 'text':
                return null;
            default:
                console.warn(`Unhandled token type: ${token.type}`);
                return null;
        }
    } catch (error) {
        console.error(`Error transforming token type ${token.type}:`, error);
        return null;
    }
};

const createTransformMetadata = (contentItems: ContentItem[]): TransformMetadata => {
    const itemTypes = contentItems.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return {
        totalItems: contentItems.length,
        itemTypes,
        transformedAt: new Date().toISOString()
    };
};

const transformTokensToContentItems = (tokens: TokensList, context: TransformContext, startOrder: number): { contentItems: ContentItem[]; nextOrder: number } => {
    const contentItems: ContentItem[] = [];
    let currentOrder = startOrder;

    for (const token of tokens) {
        const transformed = transformSingleToken(token, context, currentOrder);
        if (transformed) {
            contentItems.push(transformed);
            currentOrder += 1;
        }
    }

    return { contentItems, nextOrder: currentOrder };
};

export const transformMarkdownTokens = (tokens: TokensList, context: TransformContext): TransformResult => {
    try {
        if (!tokens || tokens.length === 0) {
            return {
                success: false,
                error: createTransformError(
                    'No tokens provided for transformation',
                    'EMPTY_TOKENS'
                )
            };
        }

        const { contentItems } = transformTokensToContentItems(tokens, context, 0);
        const metadata = createTransformMetadata(contentItems);

        return {
            success: true,
            contentItems,
            metadata
        };
    } catch (error) {
        const transformError = error instanceof Error 
            ? createTransformError(
                `Token transformation failed: ${error.message}`,
                'TRANSFORM_FAILED'
            )
            : createTransformError(
                'Unknown transformation error occurred',
                'UNKNOWN_ERROR'
            );

        return {
            success: false,
            error: transformError
        };
    }
};

export const validateContentItems = (items: ContentItem[]): boolean => {
    if (!Array.isArray(items)) return false;
    
    return items.every(item => 
        typeof item === 'object' && 
        item !== null && 
        'id' in item && 
        'type' in item && 
        'order' in item &&
        typeof item.id === 'string' &&
        typeof item.type === 'string' &&
        typeof item.order === 'number'
    );
};