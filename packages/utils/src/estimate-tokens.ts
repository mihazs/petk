export const estimateTokens = (text: string): number => {
    if (typeof text !== "string") throw new Error("estimateTokens: invalid input");
    const s = text.trim();
    if (s === "") return 0;
    return Math.ceil(s.length / 4);
};