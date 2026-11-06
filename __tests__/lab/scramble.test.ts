import { describe, expect, it } from "vitest";

import { hash32, scrambleOffset, scramblePositions } from "@/features/lab/mesh/scramble";

describe("scrambled mesh", () => {
  it("hashes exactly like 32-bit unsigned arithmetic (what the GLSL version does)", () => {
    // The same lowbias32 steps with BigInt, wrapping at 2^32 like a GLSL uint.
    const reference = (value: number) => {
      const mask = 0xffffffffn;
      let x = BigInt(value >>> 0);
      x ^= x >> 16n;
      x = (x * 0x7feb352dn) & mask;
      x ^= x >> 15n;
      x = (x * 0x846ca68bn) & mask;
      x ^= x >> 16n;
      return Number(x);
    };
    for (const value of [0, 1, 2, 3, 1234, 99999, 0x7fffffff, 0x80000000, 0xffffffff, 123456789]) {
      expect(hash32(value)).toBe(reference(value));
    }
  });

  it("gives offsets in [-1, 1) that differ per vertex and axis", () => {
    const values = new Set<number>();
    for (let v = 0; v < 50; v++) {
      for (let axis = 0; axis < 3; axis++) {
        const offset = scrambleOffset(v, axis, 1234);
        expect(offset).toBeGreaterThanOrEqual(-1);
        expect(offset).toBeLessThan(1);
        values.add(offset);
      }
    }
    expect(values.size).toBe(150);
  });

  it("moves points far from where they were, and subtracting the same offsets restores them", () => {
    const original = new Float32Array([0, 0, 0, 1, 2, 3, -4, 5, 6]);
    const scrambled = original.slice();
    scramblePositions(scrambled, 99, 10);
    expect(Math.max(...scrambled.map((value, i) => Math.abs(value - original[i])))).toBeGreaterThan(1);
    for (let i = 0; i < 3; i++) {
      for (let axis = 0; axis < 3; axis++) {
        expect(scrambled[i * 3 + axis] - scrambleOffset(i, axis, 99) * 10).toBeCloseTo(original[i * 3 + axis], 4);
      }
    }
  });
});

describe("rip test links", () => {
  it("round-trips a test and rejects anything that isn't one", async () => {
    const { decodeRipTest, encodeRipTest } = await import("@/features/lab/mesh/ripTest");
    const test = { path: "models/converted/abc123/rip-test/m1-x2.glb", key: 4000000000, amount: 27.5, radius: 30.6 };
    expect(decodeRipTest(encodeRipTest(test))).toEqual(test);
    expect(decodeRipTest(null)).toBeNull();
    expect(decodeRipTest("not-a-token")).toBeNull();
    expect(decodeRipTest(encodeRipTest({ ...test, path: "models/original/abc123/secret.stl" }))).toBeNull();
    expect(decodeRipTest(encodeRipTest({ ...test, path: "models/converted/abc/rip-test/../../x.glb" }))).toBeNull();
  });
});
