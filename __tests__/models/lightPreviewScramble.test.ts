import { describe, expect, it } from "vitest";

import { makeLightPreview } from "@/features/models/utils/lightPreview";
import { scrambleOffset } from "@/features/models/preview3d/scramble";

/** A closed box (12 triangles) as a triangle soup. */
function boxSoup(size: number): Float32Array {
  const s = size / 2;
  const v = [
    [-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s],
    [-s, -s, s], [s, -s, s], [s, s, s], [-s, s, s],
  ];
  const faces = [
    [0, 2, 1], [0, 3, 2], [4, 5, 6], [4, 6, 7], [0, 1, 5], [0, 5, 4],
    [3, 6, 2], [3, 7, 6], [0, 4, 7], [0, 7, 3], [1, 2, 6], [1, 6, 5],
  ];
  return new Float32Array(faces.flatMap((face) => face.flatMap((index) => v[index])));
}

/** The JSON chunk and the vertex positions of a GLB written by lightPreview. */
function readGlb(glb: ArrayBuffer) {
  const view = new DataView(glb);
  const jsonLength = view.getUint32(12, true);
  const json = JSON.parse(new TextDecoder().decode(new Uint8Array(glb, 20, jsonLength)));
  const binStart = 20 + jsonLength + 8;
  const count = json.accessors[0].count as number;
  const positions = new Float32Array(glb.slice(binStart, binStart + count * 12));
  return { json, positions };
}

describe("scrambled light previews", () => {
  it("stores the key in the file, scatters the points, and the key restores the real shape", async () => {
    const preview = await makeLightPreview(boxSoup(20));
    const { json, positions } = readGlb(preview.glb);

    const pd = json.meshes[0].extras.pd as number[];
    expect(pd).toHaveLength(3);
    const [key, amount, radius] = pd;
    expect(preview.scramble).toEqual({ key, amount, radius });
    // A 20 mm box centred at the origin reaches its corners at sqrt(3) * 10.
    expect(radius).toBeCloseTo(Math.sqrt(3) * 10, 3);

    // In the file the corners are scattered: far from where they belong.
    const restored = positions.map((value, i) => value - scrambleOffset(Math.floor(i / 3), i % 3, key) * amount);
    const moved = Math.max(...positions.map((value, i) => Math.abs(value - restored[i])));
    expect(moved).toBeGreaterThan(5);
    // Undoing the offsets puts every point back on the box (all coordinates ±10).
    for (const value of restored) expect(Math.abs(Math.abs(value) - 10)).toBeLessThan(1e-3);
  });

  it("leaves the mesh plain when asked (the lab compares methods)", async () => {
    const preview = await makeLightPreview(boxSoup(20), undefined, { scramble: false });
    const { json, positions } = readGlb(preview.glb);
    expect(preview.scramble).toBeNull();
    expect(json.meshes[0].extras).toBeUndefined();
    for (const value of positions) expect(Math.abs(Math.abs(value) - 10)).toBeLessThan(1e-3);
  });
});
