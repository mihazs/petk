export type Result<T, E> = Success<T> | Failure<E>;

export interface Success<T> {
    readonly success: true;
    readonly data: T;
}

export interface Failure<E> {
    readonly success: false;
    readonly error: E;
}

export function createSuccess<T>(data: T): Success<T> {
    return { success: true, data };
}

export function createFailure<E>(error: E): Failure<E> {
    return { success: false, error };
}

export function isSuccess<T, E>(result: Result<T, E>): result is Success<T> {
    return result.success;
}

export function isFailure<T, E>(result: Result<T, E>): result is Failure<E> {
    return !result.success;
}

export interface ErrorContext {
    readonly sourcePosition?: {
        line: number;
        column: number;
        offset: number;
    };
    readonly sourceFile?: string;
    readonly originalText?: string;
    readonly metadata?: Record<string, unknown>;
}

export interface BaseError {
    readonly type: string;
    readonly message: string;
    readonly context?: ErrorContext;
    readonly cause?: Error;
}

export interface MarkdownParseError extends BaseError {
    readonly type: 'markdown_parse_error';
    readonly parseErrorType: 'syntax_error' | 'encoding_error' | 'file_access_error' | 'memory_limit_error';
}

export interface AstTransformError extends BaseError {
    readonly type: 'ast_transform_error';
    readonly transformErrorType: 'unknown_token' | 'invalid_html' | 'missing_attributes' | 'content_validation_error';
    readonly tokenType?: string;
    readonly htmlContent?: string;
}

export interface ContentValidationError extends BaseError {
    readonly type: 'content_validation_error';
    readonly validationErrorType: 'empty_content' | 'invalid_order' | 'missing_required_field' | 'invalid_content_type';
    readonly fieldName?: string;
    readonly expectedType?: string;
    readonly actualValue?: unknown;
}

export interface YamlConversionError extends BaseError {
    readonly type: 'yaml_conversion_error';
    readonly conversionErrorType: 'serialization_error' | 'schema_validation_error' | 'circular_reference' | 'output_formatting_error';
}

export interface PipelineError extends BaseError {
    readonly type: 'pipeline_error';
    readonly pipelineStage: 'markdown_parsing' | 'ast_transformation' | 'content_validation' | 'yaml_conversion';
    readonly originalError: ConversionError;
}

export type ConversionError = 
    | MarkdownParseError 
    | AstTransformError 
    | ContentValidationError 
    | YamlConversionError 
    | PipelineError;

export function createMarkdownParseError(
    parseErrorType: MarkdownParseError['parseErrorType'],
    message: string,
    context?: ErrorContext,
    cause?: Error
): MarkdownParseError {
    return {
        type: 'markdown_parse_error',
        parseErrorType,
        message,
        context,
        cause
    };
}

export function createAstTransformError(
    transformErrorType: AstTransformError['transformErrorType'],
    message: string,
    options: {
        context?: ErrorContext;
        cause?: Error;
        tokenType?: string;
        htmlContent?: string;
    } = {}
): AstTransformError {
    return {
        type: 'ast_transform_error',
        transformErrorType,
        message,
        context: options.context,
        cause: options.cause,
        tokenType: options.tokenType,
        htmlContent: options.htmlContent
    };
}

export function createContentValidationError(
    validationErrorType: ContentValidationError['validationErrorType'],
    message: string,
    options: {
        context?: ErrorContext;
        cause?: Error;
        fieldName?: string;
        expectedType?: string;
        actualValue?: unknown;
    } = {}
): ContentValidationError {
    return {
        type: 'content_validation_error',
        validationErrorType,
        message,
        context: options.context,
        cause: options.cause,
        fieldName: options.fieldName,
        expectedType: options.expectedType,
        actualValue: options.actualValue
    };
}

export function createYamlConversionError(
    conversionErrorType: YamlConversionError['conversionErrorType'],
    message: string,
    context?: ErrorContext,
    cause?: Error
): YamlConversionError {
    return {
        type: 'yaml_conversion_error',
        conversionErrorType,
        message,
        context,
        cause
    };
}

export function createPipelineError(
    pipelineStage: PipelineError['pipelineStage'],
    originalError: ConversionError,
    message?: string
): PipelineError {
    return {
        type: 'pipeline_error',
        pipelineStage,
        originalError,
        message: message || `Pipeline failed at ${pipelineStage} stage: ${originalError.message}`
    };
}

export function formatError(error: ConversionError): string {
    const baseMessage = `[${error.type.toUpperCase()}] ${error.message}`;
    
    if (error.context?.sourcePosition) {
        const pos = error.context.sourcePosition;
        return `${baseMessage} at line ${pos.line}, column ${pos.column}`;
    }
    
    if (error.context?.sourceFile) {
        return `${baseMessage} in file ${error.context.sourceFile}`;
    }
    
    return baseMessage;
}

export function extractErrorChain(error: ConversionError): string[] {
    const chain = [formatError(error)];
    
    if (error.type === 'pipeline_error') {
        chain.push(...extractErrorChain(error.originalError));
    }
    
    if (error.cause) {
        chain.push(`Caused by: ${error.cause.message}`);
    }
    
    return chain;
}

export function isRecoverableError(error: ConversionError): boolean {
    switch (error.type) {
        case 'markdown_parse_error':
            return error.parseErrorType !== 'file_access_error' && error.parseErrorType !== 'memory_limit_error';
        case 'ast_transform_error':
            return error.transformErrorType === 'unknown_token' || error.transformErrorType === 'invalid_html';
        case 'content_validation_error':
            return error.validationErrorType !== 'empty_content';
        case 'yaml_conversion_error':
            return error.conversionErrorType !== 'circular_reference';
        case 'pipeline_error':
            return isRecoverableError(error.originalError);
        default:
            return false;
    }
}