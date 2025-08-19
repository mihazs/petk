import { describe, it, expect } from 'vitest';
import { load } from 'js-yaml';
import { convertToYaml, validateContentItems } from '../src/converter/yaml-converter.js';
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
    HorizontalRuleItem
} from '../src/types.js';

const createValidParagraphItem = (): ParagraphItem => ({
    id: 'p1',
    type: 'paragraph',
    order: 1,
    sourceLineStart: 1,
    sourceLineEnd: 1,
    text: 'This is a test paragraph.'
});

const createValidHeadingItem = (): HeadingItem => ({
    id: 'h1',
    type: 'heading',
    order: 2,
    sourceLineStart: 3,
    sourceLineEnd: 3,
    text: 'Test Heading',
    level: 2
});

const createValidImageItem = (): ImageItem => ({
    id: 'img1',
    type: 'image',
    order: 3,
    sourceLineStart: 5,
    sourceLineEnd: 5,
    src: '/path/to/image.jpg',
    alt: 'Test image',
    title: 'A test image'
});

const createValidAudioItem = (): AudioItem => ({
    id: 'audio1',
    type: 'audio',
    order: 4,
    sourceLineStart: 7,
    sourceLineEnd: 7,
    src: '/path/to/audio.mp3',
    duration: 120,
    format: 'mp3'
});

const createValidVideoItem = (): VideoItem => ({
    id: 'video1',
    type: 'video',
    order: 5,
    sourceLineStart: 9,
    sourceLineEnd: 9,
    src: '/path/to/video.mp4',
    duration: 300,
    format: 'mp4'
});

const createValidListItem = (): ListItem => ({
    id: 'list1',
    type: 'list',
    order: 6,
    sourceLineStart: 11,
    sourceLineEnd: 13,
    listType: 'unordered',
    items: [
        { text: 'First item', order: 0 },
        { text: 'Second item', order: 1 }
    ]
});

const createValidCodeBlockItem = (): CodeBlockItem => ({
    id: 'code1',
    type: 'code_block',
    order: 7,
    sourceLineStart: 15,
    sourceLineEnd: 17,
    code: 'console.log("Hello World");',
    language: 'javascript'
});

const createValidTableItem = (): TableItem => ({
    id: 'table1',
    type: 'table',
    order: 8,
    sourceLineStart: 19,
    sourceLineEnd: 22,
    headers: ['Name', 'Age'],
    rows: [
        ['Alice', '25'],
        ['Bob', '30']
    ]
});

const createValidBlockquoteItem = (): BlockquoteItem => ({
    id: 'quote1',
    type: 'blockquote',
    order: 9,
    sourceLineStart: 24,
    sourceLineEnd: 24,
    content: [createValidParagraphItem()]
});

const createValidLinkItem = (): LinkItem => ({
    id: 'link1',
    type: 'link',
    order: 10,
    sourceLineStart: 26,
    sourceLineEnd: 26,
    href: 'https://example.com',
    text: 'Example Link'
});

const createValidHorizontalRuleItem = (): HorizontalRuleItem => ({
    id: 'hr1',
    type: 'horizontal_rule',
    order: 11,
    sourceLineStart: 28,
    sourceLineEnd: 28
});

describe('YAML Converter', () => {
    describe('convertToYaml', () => {
        describe('success cases', () => {
            it('should convert valid content items to YAML', () => {
                const contentItems: ContentItem[] = [
                    createValidParagraphItem(),
                    createValidHeadingItem()
                ];

                const result = convertToYaml(contentItems);

                expect(result.success).toBe(true);
                expect(result.data).toBeDefined();
                expect(result.error).toBeUndefined();
                expect(result.metadata).toBeDefined();
                expect(result.metadata?.itemsProcessed).toBe(2);
                expect(result.metadata?.itemsFiltered).toBe(0);
                expect(typeof result.data).toBe('string');

                const parsedYaml = load(result.data!);
                expect(parsedYaml).toBeDefined();
                expect(Array.isArray(parsedYaml)).toBe(true);
            });

            it('should handle all content types correctly', () => {
                const contentItems: ContentItem[] = [
                    createValidParagraphItem(),
                    createValidHeadingItem(),
                    createValidImageItem(),
                    createValidAudioItem(),
                    createValidVideoItem(),
                    createValidListItem(),
                    createValidCodeBlockItem(),
                    createValidTableItem(),
                    createValidLinkItem(),
                    createValidHorizontalRuleItem()
                ];

                const result = convertToYaml(contentItems);

                expect(result.success).toBe(true);
                expect(result.data).toBeDefined();
                expect(result.metadata?.itemsProcessed).toBe(10);
                expect(result.metadata?.itemsFiltered).toBe(0);

                const parsedYaml = load(result.data!) as ContentItem[];
                expect(parsedYaml).toHaveLength(10);
                
                const types = parsedYaml.map(item => item.type);
                expect(types).toContain('paragraph');
                expect(types).toContain('heading');
                expect(types).toContain('image');
                expect(types).toContain('audio');
                expect(types).toContain('video');
                expect(types).toContain('list');
                expect(types).toContain('code_block');
                expect(types).toContain('table');
                expect(types).toContain('link');
                expect(types).toContain('horizontal_rule');
            });

            it('should include metadata when option is enabled', () => {
                const contentItems: ContentItem[] = [createValidParagraphItem()];
                const options = { includeMetadata: true };

                const result = convertToYaml(contentItems, options);

                expect(result.success).toBe(true);
                expect(result.data).toBeDefined();

                const parsedYaml = load(result.data!) as any;
                expect(parsedYaml.metadata).toBeDefined();
                expect(parsedYaml.content).toBeDefined();
                expect(Array.isArray(parsedYaml.content)).toBe(true);
                expect(parsedYaml.content).toHaveLength(1);
            });

            it('should sort content by order when option is enabled', () => {
                const contentItems: ContentItem[] = [
                    { ...createValidParagraphItem(), order: 3 },
                    { ...createValidHeadingItem(), order: 1 },
                    { ...createValidImageItem(), order: 2 }
                ];
                const options = { sortByOrder: true };

                const result = convertToYaml(contentItems, options);

                expect(result.success).toBe(true);
                expect(result.data).toBeDefined();

                const parsedYaml = load(result.data!) as ContentItem[];
                expect(parsedYaml[0].order).toBe(1);
                expect(parsedYaml[1].order).toBe(2);
                expect(parsedYaml[2].order).toBe(3);
            });

            it('should handle verbose option without affecting output structure', () => {
                const contentItems: ContentItem[] = [createValidParagraphItem()];
                const options = { verbose: true };

                const result = convertToYaml(contentItems, options);

                expect(result.success).toBe(true);
                expect(result.data).toBeDefined();

                const parsedYaml = load(result.data!) as ContentItem[];
                expect(Array.isArray(parsedYaml)).toBe(true);
                expect(parsedYaml).toHaveLength(1);
            });
        });

        describe('error cases', () => {
            it('should return EmptyContentError for empty array', () => {
                const result = convertToYaml([]);

                expect(result.success).toBe(false);
                expect(result.data).toBeUndefined();
                expect(result.error).toBeDefined();
                expect(result.error?.type).toBe('empty_content_error');
                expect(result.error?.message).toContain('empty content array');
                expect(result.error?.code).toBe('EMPTY_CONTENT_ERROR');
            });

            it('should return ContentValidationError for non-array input', () => {
                const result = convertToYaml(null as any);

                expect(result.success).toBe(false);
                expect(result.data).toBeUndefined();
                expect(result.error).toBeDefined();
                expect(result.error?.type).toBe('content_validation_error');
                expect(result.error?.message).toContain('must be an array');
                expect(result.error?.code).toBe('CONTENT_VALIDATION_ERROR');
            });

            it('should filter out invalid items and succeed if valid items remain', () => {
                const contentItems: ContentItem[] = [
                    createValidParagraphItem(),
                    { id: '', type: 'paragraph', order: -1, sourceLineStart: 0, sourceLineEnd: 0, text: '' } as any,
                    createValidHeadingItem()
                ];

                const result = convertToYaml(contentItems);

                expect(result.success).toBe(true);
                expect(result.data).toBeDefined();
                expect(result.metadata?.itemsProcessed).toBe(2);
                expect(result.metadata?.itemsFiltered).toBe(1);
            });

            it('should return ContentValidationError if all items are invalid', () => {
                const contentItems: ContentItem[] = [
                    { id: '', type: 'paragraph', order: -1, sourceLineStart: 0, sourceLineEnd: 0, text: '' } as any,
                    { id: '', type: 'heading', order: -1, sourceLineStart: 0, sourceLineEnd: 0, text: '' } as any
                ];

                const result = convertToYaml(contentItems);

                expect(result.success).toBe(false);
                expect(result.data).toBeUndefined();
                expect(result.error).toBeDefined();
                expect(result.error?.type).toBe('content_validation_error');
                expect(result.error?.message).toContain('No valid content items');
            });
        });

        describe('YAML output validation', () => {
            it('should produce valid YAML that can be parsed back', () => {
                const contentItems: ContentItem[] = [
                    createValidParagraphItem(),
                    createValidImageItem()
                ];

                const result = convertToYaml(contentItems);

                expect(result.success).toBe(true);
                expect(result.data).toBeDefined();

                expect(() => load(result.data!)).not.toThrow();
                
                const parsedYaml = load(result.data!) as ContentItem[];
                expect(parsedYaml).toHaveLength(2);
                expect(parsedYaml[0].id).toBe('p1');
                expect(parsedYaml[0].type).toBe('paragraph');
                expect(parsedYaml[1].id).toBe('img1');
                expect(parsedYaml[1].type).toBe('image');
            });

            it('should maintain data integrity in round-trip conversion', () => {
                const originalItem = createValidImageItem();
                const contentItems: ContentItem[] = [originalItem];

                const result = convertToYaml(contentItems);
                const parsedYaml = load(result.data!) as ImageItem[];

                expect(parsedYaml[0]).toEqual(originalItem);
            });
        });
    });

    describe('validateContentItems', () => {
        describe('valid items', () => {
            it('should return success for valid content items', () => {
                const validItems: ContentItem[] = [
                    createValidParagraphItem(),
                    createValidImageItem(),
                    createValidListItem()
                ];

                const result = validateContentItems(validItems);

                expect(result.success).toBe(true);
                expect(result.data).toBeDefined();
                expect(result.data).toHaveLength(3);
                expect(result.error).toBeUndefined();
            });

            it('should validate all content types correctly', () => {
                const validItems: ContentItem[] = [
                    createValidParagraphItem(),
                    createValidHeadingItem(),
                    createValidImageItem(),
                    createValidAudioItem(),
                    createValidVideoItem(),
                    createValidListItem(),
                    createValidCodeBlockItem(),
                    createValidTableItem(),
                    createValidBlockquoteItem(),
                    createValidLinkItem(),
                    createValidHorizontalRuleItem()
                ];

                const result = validateContentItems(validItems);

                expect(result.success).toBe(true);
                expect(result.data).toHaveLength(11);
            });
        });

        describe('invalid items', () => {
            it('should return error for non-array input', () => {
                const result = validateContentItems('not an array' as any);

                expect(result.success).toBe(false);
                expect(result.error).toBeDefined();
                expect(result.error?.type).toBe('content_validation_error');
                expect(result.error?.message).toContain('must be an array');
            });

            it('should return error for items with missing required fields', () => {
                const invalidItems: ContentItem[] = [
                    { id: '', type: 'paragraph', order: 1, sourceLineStart: 1, sourceLineEnd: 1, text: 'valid' } as any,
                    { type: 'paragraph', order: 2, sourceLineStart: 2, sourceLineEnd: 2, text: 'missing id' } as any,
                    { id: 'h1', order: 3, sourceLineStart: 3, sourceLineEnd: 3, text: 'missing type' } as any
                ];

                const result = validateContentItems(invalidItems);

                expect(result.success).toBe(false);
                expect(result.error).toBeDefined();
                expect(result.error?.type).toBe('content_validation_error');
                expect(result.error?.message).toContain('invalid content items');
            });

            it('should return error for items with invalid data types', () => {
                const invalidItems: ContentItem[] = [
                    { id: 123, type: 'paragraph', order: 1, sourceLineStart: 1, sourceLineEnd: 1, text: 'valid' } as any,
                    { id: 'p2', type: 'paragraph', order: '2', sourceLineStart: 2, sourceLineEnd: 2, text: 'valid' } as any
                ];

                const result = validateContentItems(invalidItems);

                expect(result.success).toBe(false);
                expect(result.error).toBeDefined();
                expect(result.error?.invalidItems).toBeDefined();
                expect(result.error?.invalidItems?.length).toBeGreaterThan(0);
            });

            it('should return error for items with invalid order numbers', () => {
                const invalidItems: ContentItem[] = [
                    { id: 'p1', type: 'paragraph', order: -1, sourceLineStart: 1, sourceLineEnd: 1, text: 'negative order' } as any,
                    { id: 'p2', type: 'paragraph', order: 1.5, sourceLineStart: 2, sourceLineEnd: 2, text: 'decimal order' } as any
                ];

                const result = validateContentItems(invalidItems);

                expect(result.success).toBe(false);
                expect(result.error).toBeDefined();
            });

            it('should return error for items with invalid line numbers', () => {
                const invalidItems: ContentItem[] = [
                    { id: 'p1', type: 'paragraph', order: 1, sourceLineStart: 0, sourceLineEnd: 1, text: 'invalid start' } as any,
                    { id: 'p2', type: 'paragraph', order: 2, sourceLineStart: 3, sourceLineEnd: 2, text: 'end before start' } as any
                ];

                const result = validateContentItems(invalidItems);

                expect(result.success).toBe(false);
                expect(result.error).toBeDefined();
            });
        });

        describe('mixed valid and invalid items', () => {
            it('should return error when any items are invalid', () => {
                const mixedItems: ContentItem[] = [
                    createValidParagraphItem(),
                    { id: '', type: 'paragraph', order: -1, sourceLineStart: 0, sourceLineEnd: 0, text: '' } as any,
                    createValidHeadingItem()
                ];

                const result = validateContentItems(mixedItems);

                expect(result.success).toBe(false);
                expect(result.error).toBeDefined();
                expect(result.error?.type).toBe('content_validation_error');
            });
        });
    });

    describe('error objects structure', () => {
        it('should have correct error structure for YamlConversionError', () => {
            const result = convertToYaml(null as any);

            expect(result.error).toBeDefined();
            expect(result.error?.type).toBeDefined();
            expect(result.error?.message).toBeDefined();
            expect(result.error?.code).toBeDefined();
            expect(result.error?.name).toBeDefined();
        });

        it('should have correct error structure for ContentValidationError', () => {
            const result = validateContentItems('invalid' as any);

            expect(result.error).toBeDefined();
            expect(result.error?.type).toBe('content_validation_error');
            expect(result.error?.message).toBeDefined();
            expect(result.error?.code).toBe('CONTENT_VALIDATION_ERROR');
            expect(result.error?.name).toBeDefined();
        });

        it('should have correct error structure for EmptyContentError', () => {
            const result = convertToYaml([]);

            expect(result.error).toBeDefined();
            expect(result.error?.type).toBe('empty_content_error');
            expect(result.error?.message).toBeDefined();
            expect(result.error?.code).toBe('EMPTY_CONTENT_ERROR');
            expect(result.error?.name).toBeDefined();
        });
    });
});