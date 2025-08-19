import type { Token } from 'marked';
// Note: Types are defined locally in this file - removed unused imports

export interface MultimodalDetectionResult {
    isMultimodal: boolean;
    mediaType?: 'image' | 'audio' | 'video';
    src?: string;
    metadata?: Record<string, unknown>;
    originalToken: Token;
}

export interface MultimodalDetectionContext {
    enableVideoDetection: boolean;
    enableAudioDetection: boolean;
    supportedImageFormats: string[];
    supportedVideoFormats: string[];
    supportedAudioFormats: string[];
}

const DEFAULT_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff'];
const DEFAULT_VIDEO_FORMATS = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v'];
const DEFAULT_AUDIO_FORMATS = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma'];

const createDefaultDetectionContext = (): MultimodalDetectionContext => ({
    enableVideoDetection: true,
    enableAudioDetection: true,
    supportedImageFormats: DEFAULT_IMAGE_FORMATS,
    supportedVideoFormats: DEFAULT_VIDEO_FORMATS,
    supportedAudioFormats: DEFAULT_AUDIO_FORMATS
});

const extractFileExtension = (url: string): string => {
    const cleanUrl = url.split('?')[0].split('#')[0];
    const parts = cleanUrl.split('.');
    return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
};

const isImageFormat = (extension: string, context: MultimodalDetectionContext): boolean => {
    return context.supportedImageFormats.includes(extension);
};

const isVideoFormat = (extension: string, context: MultimodalDetectionContext): boolean => {
    return context.supportedVideoFormats.includes(extension);
};

const isAudioFormat = (extension: string, context: MultimodalDetectionContext): boolean => {
    return context.supportedAudioFormats.includes(extension);
};

const detectHtmlVideoTag = (text: string): MultimodalDetectionResult | null => {
    const videoTagRegex = /<video[^>]*>(.*?)<\/video>/gi;
    const srcRegex = /src=["']([^"']+)["']/i;
    const posterRegex = /poster=["']([^"']+)["']/i;
    
    const videoMatch = videoTagRegex.exec(text);
    if (!videoMatch) return null;
    
    const videoTag = videoMatch[0];
    const srcMatch = srcRegex.exec(videoTag);
    const posterMatch = posterRegex.exec(videoTag);
    
    if (!srcMatch) return null;
    
    return {
        isMultimodal: true,
        mediaType: 'video',
        src: srcMatch[1],
        metadata: {
            detectionMethod: 'html_tag',
            originalHtml: videoTag,
            poster: posterMatch?.[1]
        },
        originalToken: {} as Token
    };
};

const detectHtmlAudioTag = (text: string): MultimodalDetectionResult | null => {
    const audioTagRegex = /<audio[^>]*>(.*?)<\/audio>/gi;
    const srcRegex = /src=["']([^"']+)["']/i;
    
    const audioMatch = audioTagRegex.exec(text);
    if (!audioMatch) return null;
    
    const audioTag = audioMatch[0];
    const srcMatch = srcRegex.exec(audioTag);
    
    if (!srcMatch) return null;
    
    return {
        isMultimodal: true,
        mediaType: 'audio',
        src: srcMatch[1],
        metadata: {
            detectionMethod: 'html_tag',
            originalHtml: audioTag
        },
        originalToken: {} as Token
    };
};

const detectHtmlImageTag = (text: string): MultimodalDetectionResult | null => {
    const imgTagRegex = /<img[^>]*>/gi;
    const srcRegex = /src=["']([^"']+)["']/i;
    const altRegex = /alt=["']([^"']*)["']/i;
    const titleRegex = /title=["']([^"']*)["']/i;
    
    const imgMatch = imgTagRegex.exec(text);
    if (!imgMatch) return null;
    
    const imgTag = imgMatch[0];
    const srcMatch = srcRegex.exec(imgTag);
    const altMatch = altRegex.exec(imgTag);
    const titleMatch = titleRegex.exec(imgTag);
    
    if (!srcMatch) return null;
    
    return {
        isMultimodal: true,
        mediaType: 'image',
        src: srcMatch[1],
        metadata: {
            detectionMethod: 'html_tag',
            originalHtml: imgTag,
            alt: altMatch?.[1],
            title: titleMatch?.[1]
        },
        originalToken: {} as Token
    };
};

const detectMarkdownImageAsMultimedia = (token: Token, context: MultimodalDetectionContext): MultimodalDetectionResult | null => {
    if (token.type !== 'image') return null;
    
    const imageToken = token as Token & { href: string; text?: string; title?: string };
    const extension = extractFileExtension(imageToken.href);
    
    if (context.enableVideoDetection && isVideoFormat(extension, context)) {
        return {
            isMultimodal: true,
            mediaType: 'video',
            src: imageToken.href,
            metadata: {
                detectionMethod: 'markdown_image_as_video',
                originalExtension: extension,
                alt: imageToken.text,
                title: imageToken.title
            },
            originalToken: token
        };
    }
    
    if (context.enableAudioDetection && isAudioFormat(extension, context)) {
        return {
            isMultimodal: true,
            mediaType: 'audio',
            src: imageToken.href,
            metadata: {
                detectionMethod: 'markdown_image_as_audio',
                originalExtension: extension,
                title: imageToken.title
            },
            originalToken: token
        };
    }
    
    if (isImageFormat(extension, context)) {
        return {
            isMultimodal: true,
            mediaType: 'image',
            src: imageToken.href,
            metadata: {
                detectionMethod: 'markdown_image',
                originalExtension: extension,
                alt: imageToken.text,
                title: imageToken.title
            },
            originalToken: token
        };
    }
    
    return null;
};

const detectMultimodalInText = (text: string, context: MultimodalDetectionContext): MultimodalDetectionResult | null => {
    if (context.enableVideoDetection) {
        const videoContent = detectHtmlVideoTag(text);
        if (videoContent) return videoContent;
    }
    
    if (context.enableAudioDetection) {
        const audioContent = detectHtmlAudioTag(text);
        if (audioContent) return audioContent;
    }
    
    const imageContent = detectHtmlImageTag(text);
    if (imageContent) return imageContent;
    
    return null;
};

export const detectMultimodalContent = (
    token: Token,
    context: MultimodalDetectionContext = createDefaultDetectionContext()
): MultimodalDetectionResult => {
    const markdownMultimedia = detectMarkdownImageAsMultimedia(token, context);
    if (markdownMultimedia) {
        return markdownMultimedia;
    }
    
    if ('text' in token && typeof token.text === 'string') {
        const textMultimedia = detectMultimodalInText(token.text, context);
        if (textMultimedia) {
            textMultimedia.originalToken = token;
            return textMultimedia;
        }
    }
    
    if ('raw' in token && typeof token.raw === 'string') {
        const rawMultimedia = detectMultimodalInText(token.raw, context);
        if (rawMultimedia) {
            rawMultimedia.originalToken = token;
            return rawMultimedia;
        }
    }
    
    return {
        isMultimodal: false,
        originalToken: token
    };
};

export const createMultimodalDetectionContext = (options: Partial<MultimodalDetectionContext> = {}): MultimodalDetectionContext => ({
    ...createDefaultDetectionContext(),
    ...options
});

export const validateMultimodalDetection = (result: MultimodalDetectionResult): boolean => {
    if (!result || typeof result !== 'object') return false;
    if (!result.isMultimodal) return true;
    if (!result.mediaType || !['image', 'video', 'audio'].includes(result.mediaType)) return false;
    if (!result.src || typeof result.src !== 'string') return false;
    
    return true;
};