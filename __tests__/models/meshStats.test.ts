import { describe, expect, it } from "vitest";

import { writeGlb } from "@/features/models/utils/lightPreview";
import { glbMeshStats } from "@/features/models/utils/meshStats";

// A closed box of the given size (12 triangles, outward faces).
const box = (w: number, h: number, d: number) => {
  const v = [
    [0, 0, 0],
    [w, 0, 0],
    [w, h, 0],
    [0, h, 0],
    [0, 0, d],
    [w, 0, d],
    [w, h, d],
    [0, h, d],
  ];
  const faces = [
    [0, 2, 1],
    [0, 3, 2],
    [4, 5, 6],
    [4, 6, 7],
    [0, 1, 5],
    [0, 5, 4],
    [2, 3, 7],
    [2, 7, 6],
    [1, 2, 6],
    [1, 6, 5],
    [0, 4, 7],
    [0, 7, 3],
  ];
  const positions = new Float32Array(v.flat());
  return writeGlb(positions, new Float32Array(positions.length), new Uint32Array(faces.flat()));
};

describe("glbMeshStats", () => {
  it("measures the size and volume of a closed box", () => {
    const stats = glbMeshStats(box(20, 30, 10));
    expect(stats?.size).toEqual([20, 30, 10]);
    expect(stats?.volume).toBeCloseTo(6000, 3);
    expect(stats?.triangles).toBe(12);
  });

  it("gives the same volume whichever way the faces wind", () => {
    const stats = glbMeshStats(box(10, 10, 10));
    expect(stats?.volume).toBeCloseTo(1000, 3);
  });

  it("returns null for something that isn't a GLB", () => {
    expect(glbMeshStats(new ArrayBuffer(40))).toBeNull();
    expect(
      glbMeshStats(new TextEncoder().encode("solid stl file").buffer as ArrayBuffer),
    ).toBeNull();
  });
});
