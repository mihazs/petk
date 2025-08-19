import { describe, it, expect } from 'vitest';
import { parseMarkdownToTokens, getMarkdownStats, validateMarkdownSize } from '../src/parser/markdown-parser.js';
import { ConversionOptions } from '../src/types/pipeline-types.js';

describe('Markdown Parser', () => {
    describe('parseMarkdownToTokens', () => {
        const defaultOptions: ConversionOptions = {
            sourceFile: 'test.md',
            converterVersion: '1.0.0',
            multimodal: {
                enableImageDetection: false,
                enableAudioDetection: false,
                enableVideoDetection: false
            },
            processing: {
                strictMode: false
            }
        };

        const defaultMetadata = {
            startTime: Date.now(),
            processingStartTime: Date.now(),
            sourceFile: 'test.md',
            warnings: [],
            sourcePositions: new Map(),
            contentItemCount: 0
        };

        it('should parse simple markdown successfully', () => {
            const markdown = '# Hello World\n\nThis is a test.';
            const result = parseMarkdownToTokens(markdown, defaultOptions, defaultMetadata);
            
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBeInstanceOf(Array);
                expect(result.data.length).toBeGreaterThan(0);
                
                // Check for heading token
                const headingToken = result.data.find(token => token.type === 'heading');
                expect(headingToken).toBeDefined();
                if (headingToken && 'text' in headingToken) {
                    expect(headingToken.text).toBe('Hello World');
                }
            }
        });

        it('should parse markdown with multimodal content when enabled', () => {
            const markdown = `# Test
            
<img src="test.jpg" alt="Test image">

<audio controls>
  <source src="test.mp3" type="audio/mpeg">
</audio>

<video controls>
  <source src="test.mp4" type="video/mp4">
</video>`;

            const multimodalOptions: ConversionOptions = {
                ...defaultOptions,
                multimodal: {
                    enableImageDetection: true,
                    enableAudioDetection: true,
                    enableVideoDetection: true
                }
            };

            const result = parseMarkdownToTokens(markdown, multimodalOptions, defaultMetadata);
            
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBeInstanceOf(Array);
                
                // Check for HTML tokens that contain media elements
                const htmlTokens = result.data.filter(token => token.type === 'html');
                expect(htmlTokens.length).toBeGreaterThan(0);
            }
        });

        it('should handle strict mode correctly', () => {
            const markdown = '# Hello World\n\nThis is a test with *emphasis*.';
            const strictOptions: ConversionOptions = {
                ...defaultOptions,
                processing: {
                    strictMode: true
                }
            };

            const result = parseMarkdownToTokens(markdown, strictOptions, defaultMetadata);
            
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBeInstanceOf(Array);
                expect(result.data.length).toBeGreaterThan(0);
            }
        });

        it('should return error for invalid input', () => {
            // @ts-expect-error Testing invalid input
            const result = parseMarkdownToTokens(null, defaultOptions, defaultMetadata);
            
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.type).toBe('markdown_parse_error');
                expect(result.error.message).toContain('string');
            }
        });

        it('should return error for empty input', () => {
            const result = parseMarkdownToTokens('', defaultOptions, defaultMetadata);
            
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.type).toBe('markdown_parse_error');
                expect(result.error.message).toContain('empty');
            }
        });

        it('should return error for oversized input', () => {
            // Create a string larger than 50MB
            const largeMarkdown = 'a'.repeat(51 * 1024 * 1024);
            const result = parseMarkdownToTokens(largeMarkdown, defaultOptions, defaultMetadata);
            
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.type).toBe('markdown_parse_error');
                expect(result.error.message).toContain('too large');
            }
        });

        it('should parse complex markdown with various elements', () => {
            const markdown = `# Main Title

## Subtitle

This is a paragraph with **bold** and *italic* text.

- List item 1
- List item 2
  - Nested item

1. Numbered item
2. Another numbered item

\`\`\`javascript
console.log('code block');
\`\`\`

> This is a blockquote

[Link text](https://example.com)

![Image alt](image.jpg)`;

            const result = parseMarkdownToTokens(markdown, defaultOptions, defaultMetadata);
            
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBeInstanceOf(Array);
                expect(result.data.length).toBeGreaterThan(0);
                
                // Check for various token types
                const tokenTypes = result.data.map(token => token.type);
                expect(tokenTypes).toContain('heading');
                expect(tokenTypes).toContain('paragraph');
                expect(tokenTypes).toContain('list');
                expect(tokenTypes).toContain('code');
                expect(tokenTypes).toContain('blockquote');
            }
        });
    });

    describe('getMarkdownStats', () => {
        it('should calculate basic statistics correctly', () => {
            const markdown = `# Title

This is a paragraph with some words.

## Another heading

- List item
- Another item

\`\`\`
code block
\`\`\`

[Link](https://example.com)

![Image](image.jpg)`;

            const stats = getMarkdownStats(markdown);

            expect(stats.lines).toBeGreaterThan(0);
            expect(stats.words).toBeGreaterThan(0);
            expect(stats.characters).toBe(markdown.length);
            expect(stats.bytes).toBeGreaterThanOrEqual(markdown.length);
            expect(stats.headings).toBe(2);
            expect(stats.links).toBe(1);
            expect(stats.images).toBe(1);
            expect(stats.codeBlocks).toBe(1);
        });

        it('should handle empty markdown', () => {
            const stats = getMarkdownStats('');

            expect(stats.lines).toBe(1); // Empty string still has one "line"
            expect(stats.words).toBe(0);
            expect(stats.characters).toBe(0);
            expect(stats.bytes).toBe(0);
            expect(stats.headings).toBe(0);
            expect(stats.links).toBe(0);
            expect(stats.images).toBe(0);
            expect(stats.codeBlocks).toBe(0);
        });

        it('should count multiple elements correctly', () => {
            const markdown = `# H1
## H2
### H3

[Link 1](url1) and [Link 2](url2)

![Image 1](img1.jpg)
![Image 2](img2.jpg)
![Image 3](img3.jpg)

\`\`\`
Block 1
\`\`\`

\`\`\`javascript
Block 2
\`\`\``;

            const stats = getMarkdownStats(markdown);

            expect(stats.headings).toBe(3);
            expect(stats.links).toBe(2);
            expect(stats.images).toBe(3);
            expect(stats.codeBlocks).toBe(2);
        });
    });

    describe('validateMarkdownSize', () => {
        it('should validate normal sized markdown', () => {
            const markdown = 'This is a normal sized markdown document.';
            expect(validateMarkdownSize(markdown)).toBe(true);
        });

        it('should reject oversized markdown with default limit', () => {
            // Create a string larger than 50MB
            const largeMarkdown = 'a'.repeat(51 * 1024 * 1024);
            expect(validateMarkdownSize(largeMarkdown)).toBe(false);
        });

        it('should respect custom size limit', () => {
            const markdown = 'a'.repeat(2 * 1024 * 1024); // 2MB
            expect(validateMarkdownSize(markdown, 1)).toBe(false); // 1MB limit
            expect(validateMarkdownSize(markdown, 3)).toBe(true);  // 3MB limit
        });

        it('should handle empty markdown', () => {
            expect(validateMarkdownSize('')).toBe(true);
        });
    });
});