/**
 * Hemi-octahedral impostor maths, shared by the baker (TypeScript) and mirrored in the viewer's
 * shader (GLSL). A view direction on the upper hemisphere (y >= 0) maps to a point in the unit
 * square; the square is split into a grid of frames, one pre-rendered view per grid point.
 */

export type Vec3 = [number, number, number];

const normalize = ([x, y, z]: Vec3): Vec3 => {
  const length = Math.hypot(x, y, z) || 1;
  return [x / length, y / length, z / length];
};

const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

/** Direction (upper hemisphere) → point in [0, 1]². */
export function encodeDirection(direction: Vec3): [number, number] {
  const [x, , z] = direction;
  const y = Math.max(direction[1], 0);
  const sum = Math.abs(x) + y + Math.abs(z) || 1;
  const px = x / sum;
  const pz = z / sum;
  return [(px + pz) * 0.5 + 0.5, (px - pz) * 0.5 + 0.5];
}

/** Point in [0, 1]² → direction on the upper hemisphere. */
export function decodeDirection(u: number, v: number): Vec3 {
  const fx = u * 2 - 1;
  const fy = v * 2 - 1;
  const px = (fx + fy) * 0.5;
  const pz = (fx - fy) * 0.5;
  const y = Math.max(1 - Math.abs(px) - Math.abs(pz), 0);
  return normalize([px, y, pz]);
}

/** Direction of the frame at grid cell (i, j) in an N × N grid. */
export function frameDirection(i: number, j: number, grid: number): Vec3 {
  return decodeDirection(i / (grid - 1), j / (grid - 1));
}

/**
 * Screen axes for a camera looking back at the model from `direction` with world-up y, so the
 * baker and the viewer agree on which way is "right" and "up" in every frame. Straight down has
 * no defined right, so it falls back to +x.
 */
export function frameBasis(direction: Vec3): { right: Vec3; up: Vec3 } {
  let right = cross([0, 1, 0], direction);
  if (Math.hypot(...right) < 1e-4) right = [1, 0, 0];
  right = normalize(right);
  return { right, up: cross(direction, right) };
}

/** View direction for an orbit angle (yaw around y, pitch above the horizon), in radians. */
export function orbitDirection(yaw: number, pitch: number): Vec3 {
  const c = Math.cos(pitch);
  return [c * Math.sin(yaw), Math.sin(pitch), c * Math.cos(yaw)];
}
