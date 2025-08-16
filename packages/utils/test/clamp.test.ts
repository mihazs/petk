import { clamp } from "../src/clamp";
import { describe, it, expect } from "vitest";

describe("clamp", () => {
    it("returns min when value is less than min", () => {
        expect(clamp(-5, 0, 10)).toBe(0);
    });

    it("returns max when value is greater than max", () => {
        expect(clamp(15, 0, 10)).toBe(10);
    });

    it("returns value when within bounds", () => {
        expect(clamp(5, 0, 10)).toBe(5);
        expect(clamp(0, 0, 10)).toBe(0);
        expect(clamp(10, 0, 10)).toBe(10);
    });
});