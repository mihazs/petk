import { Token } from 'marked';
import { ContentItem, YamlDocument } from '../schema/yaml-schema.js';
import { Result, ConversionError } from './error-types.js';

export interface ConversionOptions {
    readonly sourceFile: string;
    readonly converterVersion: string;
    readonly metadata?: {
        readonly title?: string;
        readonly description?: string;
        readonly language?: string;
    };
    readonly processing?: {
        readonly preserveSourcePositions?: boolean;
        readonly enableWarnings?: boolean;
        readonly strictMode?: boolean;
        readonly maxContentItems?: number;
    };
    readonly multimodal?: {
        readonly enableImageDetection?: boolean;
        readonly enableAudioDetection?: boolean;
        readonly enableVideoDetection?: boolean;
        readonly extractMetadata?: boolean;
    };
    readonly yaml?: {
        readonly indent?: number;
        readonly lineWidth?: number;
        readonly sortKeys?: boolean;
        readonly quotingType?: 'default' | 'single' | 'double';
    };
}

export interface PipelineMetadata {
    readonly sourceFile: string;
    readonly processingStartTime: number;
    readonly warnings: readonly string[];
    readonly sourcePositions: ReadonlyMap<number, SourcePosition>;
    readonly contentItemCount: number;
}

export interface SourcePosition {
    readonly line: number;
    readonly column: number;
    readonly offset: number;
    readonly length?: number;
}

export interface IntermediateContentItem {
    readonly type: ContentItem['type'];
    readonly order: number;
    readonly originalPosition: SourcePosition;
    readonly content: unknown;
    readonly attributes: ReadonlyMap<string, string>;
    readonly metadata: ReadonlyMap<string, unknown>;
    readonly warnings: readonly string[];
}

export interface MediaMetadata {
    readonly src: string;
    readonly format?: string;
    readonly size?: number;
    readonly width?: number;
    readonly height?: number;
    readonly duration?: number;
    readonly title?: string;
    readonly alt?: string;
    readonly attributes: ReadonlyMap<string, string>;
}

export interface ListItemIntermediate {
    readonly content: string;
    readonly order: number;
    readonly nestedItems: readonly ListItemIntermediate[];
    readonly originalPosition: SourcePosition;
}

export interface TableCellIntermediate {
    readonly content: string;
    readonly isHeader: boolean;
    readonly alignment?: 'left' | 'right' | 'center';
}

export interface TableRowIntermediate {
    readonly cells: readonly TableCellIntermediate[];
    readonly isHeader: boolean;
}

export interface ValidationContext {
    readonly options: ConversionOptions;
    readonly metadata: PipelineMetadata;
    readonly contentItems: readonly IntermediateContentItem[];
}

export interface ContentTypeHandler {
    readonly supportedTypes: readonly ContentItem['type'][];
    readonly canHandle: (token: Token, context: ValidationContext) => boolean;
    readonly transform: (token: Token, context: ValidationContext) => Result<IntermediateContentItem, ConversionError>;
    readonly validate: (item: IntermediateContentItem, context: ValidationContext) => Result<ContentItem, ConversionError>;
}

export interface PipelineStage<TInput, TOutput> {
    readonly name: string;
    readonly execute: (input: TInput, options: ConversionOptions, metadata: PipelineMetadata) => Result<TOutput, ConversionError>;
}

export type MarkdownParseStage = PipelineStage<string, readonly Token[]>;
export type AstTransformStage = PipelineStage<readonly Token[], readonly IntermediateContentItem[]>;
export type ContentValidationStage = PipelineStage<readonly IntermediateContentItem[], readonly ContentItem[]>;
export type YamlConversionStage = PipelineStage<readonly ContentItem[], YamlDocument>;

export interface ConversionPipeline {
    readonly markdownParse: MarkdownParseStage;
    readonly astTransform: AstTransformStage;
    readonly contentValidation: ContentValidationStage;
    readonly yamlConversion: YamlConversionStage;
}

export function createDefaultOptions(sourceFile: string): ConversionOptions {
    return {
        sourceFile,
        converterVersion: '1.0.0',
        processing: {
            preserveSourcePositions: true,
            enableWarnings: true,
            strictMode: false,
            maxContentItems: 10000
        },
        multimodal: {
            enableImageDetection: true,
            enableAudioDetection: true,
            enableVideoDetection: true,
            extractMetadata: true
        },
        yaml: {
            indent: 2,
            lineWidth: 120,
            sortKeys: false,
            quotingType: 'default'
        }
    };
}

export function createPipelineMetadata(
    sourceFile: string,
    processingStartTime: number = Date.now()
): PipelineMetadata {
    return {
        sourceFile,
        processingStartTime,
        warnings: [],
        sourcePositions: new Map(),
        contentItemCount: 0
    };
}

export function addWarning(
    metadata: PipelineMetadata,
    warning: string
): PipelineMetadata {
    return {
        ...metadata,
        warnings: [...metadata.warnings, warning]
    };
}

export function addSourcePosition(
    metadata: PipelineMetadata,
    itemIndex: number,
    position: SourcePosition
): PipelineMetadata {
    const newPositions = new Map(metadata.sourcePositions);
    newPositions.set(itemIndex, position);
    return {
        ...metadata,
        sourcePositions: newPositions
    };
}

export function updateContentItemCount(
    metadata: PipelineMetadata,
    count: number
): PipelineMetadata {
    return {
        ...metadata,
        contentItemCount: count
    };
}

export function createValidationContext(
    options: ConversionOptions,
    metadata: PipelineMetadata,
    contentItems: readonly IntermediateContentItem[]
): ValidationContext {
    return {
        options,
        metadata,
        contentItems
    };
}

export function isWithinContentLimit(
    metadata: PipelineMetadata,
    options: ConversionOptions
): boolean {
    const maxItems = options.processing?.maxContentItems ?? 10000;
    return metadata.contentItemCount <= maxItems;
}

export function shouldPreserveSourcePositions(options: ConversionOptions): boolean {
    return options.processing?.preserveSourcePositions ?? true;
}

export function shouldEnableWarnings(options: ConversionOptions): boolean {
    return options.processing?.enableWarnings ?? true;
}

export function isStrictMode(options: ConversionOptions): boolean {
    return options.processing?.strictMode ?? false;
}

export function isMultimodalEnabled(options: ConversionOptions): boolean {
    const multimodal = options.multimodal;
    return !!(multimodal?.enableImageDetection || 
              multimodal?.enableAudioDetection || 
              multimodal?.enableVideoDetection);
}

export function shouldExtractMetadata(options: ConversionOptions): boolean {
    return options.multimodal?.extractMetadata ?? true;
}

export function getYamlOptions(options: ConversionOptions) {
    return {
        indent: options.yaml?.indent ?? 2,
        lineWidth: options.yaml?.lineWidth ?? 120,
        sortKeys: options.yaml?.sortKeys ?? false,
        quotingType: options.yaml?.quotingType ?? 'default' as const
    };
}

export function createIntermediateContentItem(
    type: ContentItem['type'],
    order: number,
    originalPosition: SourcePosition,
    content: unknown,
    attributes: ReadonlyMap<string, string> = new Map(),
    metadata: ReadonlyMap<string, unknown> = new Map(),
    warnings: readonly string[] = []
): IntermediateContentItem {
    return {
        type,
        order,
        originalPosition,
        content,
        attributes,
        metadata,
        warnings
    };
}

export function createMediaMetadata(
    src: string,
    options: {
        readonly format?: string;
        readonly size?: number;
        readonly width?: number;
        readonly height?: number;
        readonly duration?: number;
        readonly title?: string;
        readonly alt?: string;
        readonly attributes?: ReadonlyMap<string, string>;
    } = {}
): MediaMetadata {
    return {
        src,
        format: options.format,
        size: options.size,
        width: options.width,
        height: options.height,
        duration: options.duration,
        title: options.title,
        alt: options.alt,
        attributes: options.attributes ?? new Map()
    };
}

export function createListItemIntermediate(
    content: string,
    order: number,
    originalPosition: SourcePosition,
    nestedItems: readonly ListItemIntermediate[] = []
): ListItemIntermediate {
    return {
        content,
        order,
        nestedItems,
        originalPosition
    };
}

export function createTableCellIntermediate(
    content: string,
    isHeader: boolean,
    alignment?: 'left' | 'right' | 'center'
): TableCellIntermediate {
    return {
        content,
        isHeader,
        alignment
    };
}

export function createTableRowIntermediate(
    cells: readonly TableCellIntermediate[],
    isHeader: boolean = false
): TableRowIntermediate {
    return {
        cells,
        isHeader
    };
}

export function mergeOptions(
    base: ConversionOptions,
    overrides: Partial<ConversionOptions>
): ConversionOptions {
    return {
        ...base,
        ...overrides,
        metadata: {
            ...base.metadata,
            ...overrides.metadata
        },
        processing: {
            ...base.processing,
            ...overrides.processing
        },
        multimodal: {
            ...base.multimodal,
            ...overrides.multimodal
        },
        yaml: {
            ...base.yaml,
            ...overrides.yaml
        }
    };
}