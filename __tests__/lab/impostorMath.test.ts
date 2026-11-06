import { describe, expect, it } from "vitest";

import {
  decodeDirection,
  encodeDirection,
  frameBasis,
  frameDirection,
  orbitDirection,
  type Vec3,
} from "@/features/lab/impostor/impostorMath";

const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const length = (a: Vec3) => Math.sqrt(dot(a, a));

describe("impostor maths", () => {
  it("round-trips directions on the upper hemisphere", () => {
    for (let yaw = 0; yaw < 6.28; yaw += 0.37) {
      for (let pitch = 0; pitch <= 1.5; pitch += 0.21) {
        const direction = orbitDirection(yaw, pitch);
        const back = decodeDirection(...encodeDirection(direction));
        for (let k = 0; k < 3; k++) expect(back[k]).toBeCloseTo(direction[k], 5);
      }
    }
  });

  it("puts straight up in the middle of the square and the horizon on its edge", () => {
    const [u, v] = encodeDirection([0, 1, 0]);
    expect(u).toBeCloseTo(0.5);
    expect(v).toBeCloseTo(0.5);
    // A corner of the grid is a horizontal view.
    expect(frameDirection(0, 0, 8)[1]).toBeCloseTo(0);
  });

  it("gives every frame a right and up axis at right angles to its direction", () => {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const direction = frameDirection(i, j, 8);
        const { right, up } = frameBasis(direction);
        expect(length(right)).toBeCloseTo(1);
        expect(length(up)).toBeCloseTo(1);
        expect(dot(right, direction)).toBeCloseTo(0);
        expect(dot(up, direction)).toBeCloseTo(0);
        expect(dot(right, up)).toBeCloseTo(0);
      }
    }
  });

  it("keeps up pointing upward for side views, so the model stands upright", () => {
    const { up } = frameBasis(orbitDirection(1, 0.2));
    expect(up[1]).toBeGreaterThan(0.9);
  });
});
