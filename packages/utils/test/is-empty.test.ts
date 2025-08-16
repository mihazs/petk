import { isEmpty } from "../src/is-empty";
import { describe, it, expect } from "vitest";

describe("isEmpty", () => {
    it("returns true for null and undefined", () => {
        expect(isEmpty(null)).toBe(true);
        expect(isEmpty(undefined)).toBe(true);
    });

    it("returns true for empty string, array, object", () => {
        expect(isEmpty("")).toBe(true);
        expect(isEmpty([])).toBe(true);
        expect(isEmpty({})).toBe(true);
    });

    it("returns false for non-empty string, array, object", () => {
        expect(isEmpty("a")).toBe(false);
        expect(isEmpty([1])).toBe(false);
        expect(isEmpty({ a: 1 })).toBe(false);
    });

    it("returns false for numbers and booleans", () => {
        expect(isEmpty(0)).toBe(false);
        expect(isEmpty(false)).toBe(false);
    });
});