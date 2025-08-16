export var estimateTokens = function(text) {
    if (typeof text !== "string") throw new Error("estimateTokens: invalid input");
    var s = text.trim();
    if (s === "") return 0;
    return Math.ceil(s.length / 4);
};

//# sourceMappingURL=estimate-tokens.js.map