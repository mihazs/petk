// Restricts a number to be within the specified min and max bounds.
export function clamp(value, min, max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
}

//# sourceMappingURL=clamp.js.map