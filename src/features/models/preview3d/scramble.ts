import type { BufferGeometry, Material } from "three";

/**
 * Scrambled mesh: every vertex is moved by a pseudo-random offset (from a hash of its index and
 * a key) before the file is made, and the viewer's vertex shader moves it back. The file, and
 * the vertex buffers a WebGL capture tool dumps, hold a shapeless cloud; only the shader's
 * output on screen is the model. A determined person can read the shader and undo it, so this
 * stops casual ripping (network tab, buffer dumpers), not an expert.
 */

/** 32-bit integer hash (lowbias32); identical in GLSL below. */
export function hash32(value: number): number {
  let x = value >>> 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x7feb352d) >>> 0;
  x ^= x >>> 15;
  x = Math.imul(x, 0x846ca68b) >>> 0;
  x ^= x >>> 16;
  return x >>> 0;
}

/** Offset for one axis of one vertex, in [-1, 1). */
export function scrambleOffset(vertex: number, axis: number, key: number): number {
  const h = hash32((Math.imul(vertex, 3) + axis + key) >>> 0);
  return ((h & 0xffffff) / 16777216) * 2 - 1;
}

/** Moves every vertex by `amount` × its offset (in place). */
export function scramblePositions(positions: Float32Array, key: number, amount: number): void {
  for (let i = 0; i < positions.length / 3; i++) {
    for (let axis = 0; axis < 3; axis++) positions[i * 3 + axis] += scrambleOffset(i, axis, key) * amount;
  }
}

const GLSL = /* glsl */ `
uniform uint scrambleKey;
uniform float scrambleAmount;
uint scrambleHash(uint x) {
  x ^= x >> 16u; x *= 0x7feb352du; x ^= x >> 15u; x *= 0x846ca68bu; x ^= x >> 16u;
  return x;
}
float scrambleOffset(uint axis) {
  uint h = scrambleHash(uint(gl_VertexID) * 3u + axis + scrambleKey);
  return float(h & 0xffffffu) / 16777216.0 * 2.0 - 1.0;
}
`;

/** Makes a three.js material undo the scramble in its vertex shader. */
export function unscrambleInShader(material: Material, key: number, amount: number): void {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.scrambleKey = { value: key >>> 0 };
    shader.uniforms.scrambleAmount = { value: amount };
    shader.vertexShader = GLSL + shader.vertexShader.replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
      transformed -= vec3(scrambleOffset(0u), scrambleOffset(1u), scrambleOffset(2u)) * scrambleAmount;`,
    );
  };
  material.customProgramCacheKey = () => "unscramble";
}

/** Scrambles a geometry's positions (normals stay: they don't give the shape away on their own). */
export function scrambleGeometry(geometry: BufferGeometry, key: number, amount: number): BufferGeometry {
  const copy = geometry.clone();
  const position = copy.getAttribute("position");
  const values = new Float32Array(position.array as ArrayLike<number>);
  scramblePositions(values, key, amount);
  position.array.set(values);
  position.needsUpdate = true;
  return copy;
}
