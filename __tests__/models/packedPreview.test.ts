import { describe, expect, it } from "vitest";

import { decodePackedLevel, hasLevel, isPackedPreview, readPackedHeader } from "@/features/models/preview3d/packedPreview";
import { scrambleOffset, unscrambleNormals } from "@/features/models/preview3d/scramble";
import { makePackedPreview } from "@/features/models/utils/lightPreview";

/** A sphere-ish blob with `segments²` × 2 triangles, as a triangle soup. */
function sphereSoup(segments: number, radius: number): Float32Array {
  const point = (i: number, j: number) => {
    const theta = (i / segments) * Math.PI;
    const phi = (j / segments) * Math.PI * 2;
    const r = radius * (1 + 0.05 * Math.sin(5 * phi) * Math.sin(4 * theta));
    return [r * Math.sin(theta) * Math.cos(phi), r * Math.cos(theta), r * Math.sin(theta) * Math.sin(phi)];
  };
  const out: number[] = [];
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < segments; j++) {
      const a = point(i, j), b = point(i + 1, j), c = point(i + 1, j + 1), d = point(i, j + 1);
      out.push(...a, ...b, ...c, ...a, ...c, ...d);
    }
  }
  return new Float32Array(out);
}

describe("packed previews", () => {
  it("packs a light level then the full one, readable as the file arrives", async () => {
    const soup = sphereSoup(160, 20); // 51,200 triangles
    const preview = await makePackedPreview(soup, { fullTriangles: 40_000, liteTriangles: 10_000 });
    const bytes = preview.bytes;
    expect(isPackedPreview(bytes)).toBe(true);

    // Before the header has arrived there is nothing to read.
    expect(readPackedHeader(bytes.subarray(0, 6))).toBeNull();
    const header = readPackedHeader(bytes)!;
    expect(header.levels).toHaveLength(2);
    expect(header.totalBytes).toBe(bytes.byteLength);
    expect(header.scramble?.normals).toBe(true);

    // The light level is complete well before the end of the file.
    const liteEnd = header.offsets[1];
    expect(hasLevel(header, liteEnd, 0)).toBe(true);
    expect(hasLevel(header, liteEnd, 1)).toBe(false);
    expect(liteEnd).toBeLessThan(bytes.byteLength / 2);

    // Far smaller than a GLB of the same mesh (32 bytes per triangle).
    expect(bytes.byteLength).toBeLessThan(preview.triangles * 32 * 0.45);
  });

  it("decodes each level; undoing the scramble gives the real surface back", async () => {
    const soup = sphereSoup(120, 20);
    const preview = await makePackedPreview(soup, { fullTriangles: 20_000, liteTriangles: 5_000 });
    const header = readPackedHeader(preview.bytes)!;
    const { key, amount } = header.scramble!;

    for (const index of [0, 1]) {
      const level = await decodePackedLevel(preview.bytes, header, index);
      expect(level.indices.length / 3).toBe(header.levels[index].indexCount / 3);
      let farFromSurface = 0;
      let worst = 0;
      for (let v = 0; v < level.positions.length / 3; v++) {
        const stored = [0, 1, 2].map((axis) => level.positions[v * 3 + axis]);
        const real = stored.map((value, axis) => value - scrambleOffset(v, axis, key) * amount);
        // Stored points are scattered; real ones lie on the blob (radius 19-21).
        if (Math.abs(Math.hypot(...stored) - 20) > 2) farFromSurface++;
        worst = Math.max(worst, Math.abs(Math.hypot(...real) - 20));
      }
      expect(farFromSurface).toBeGreaterThan(level.positions.length / 3 / 2);
      expect(worst).toBeLessThan(1.1); // the bumps reach ±1; quantization adds < 0.01

      // Normals: unscrambled, they all agree with the surface (all along or all against the
      // radius, depending on winding); as stored they agree with it only by chance.
      const agreement = (normals: Float32Array) => {
        let along = 0;
        for (let v = 0; v < normals.length / 3; v++) {
          const real = [0, 1, 2].map((axis) => level.positions[v * 3 + axis] - scrambleOffset(v, axis, key) * amount);
          const length = Math.hypot(...real);
          const dot = (real[0] * normals[v * 3] + real[1] * normals[v * 3 + 1] + real[2] * normals[v * 3 + 2]) / length;
          if (dot > 0.8) along++;
          if (dot < -0.8) along--;
        }
        return Math.abs(along) / (normals.length / 3);
      };
      const restored = level.normals.slice();
      unscrambleNormals(restored, key);
      expect(agreement(restored)).toBeGreaterThan(0.9);
      expect(agreement(level.normals)).toBeLessThan(0.2);
    }
  });
});
