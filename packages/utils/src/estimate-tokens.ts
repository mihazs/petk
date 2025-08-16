export const estimateTokens = (text: string): number =>
    text.trim() === '' ? 0 : text.trim().split(/\s+/u).length;