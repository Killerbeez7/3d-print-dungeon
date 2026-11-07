import type { BufferGeometry, Material } from "three";

/**
 * Scrambled mesh: every vertex is moved by a pseudo-random offset (from a hash of its index and
 * a key) before the file is made, and the viewer's vertex shader moves it back. The file, and
 * the vertex buffers a WebGL capture tool dumps, hold a shapeless cloud; only the shader's
 * output on screen is the model. A determined person can read the shader and undo it, so this
 * stops casual ripping (network tab, buffer dumpers), not an expert.
 *
 * Normals can be scrambled too (each vertex's axes swapped and flipped by a keyed choice of the
 * 48 signed axis permutations), so the surface directions don't give the shape away either.
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

/** The 6 axis orders; with 3 sign bits they make the 48 signed permutations. */
const PERMUTATIONS = [
  [0, 1, 2],
  [0, 2, 1],
  [1, 0, 2],
  [1, 2, 0],
  [2, 0, 1],
  [2, 1, 0],
] as const;
/** Mixes the normal hash apart from the position offsets of the same vertex. */
const NORMAL_SALT = 0x9e3779b9;

/** Which signed axis permutation a vertex's normal gets (0-47). */
export function normalCode(vertex: number, key: number): number {
  return hash32(((Math.imul(vertex, 3) + key) >>> 0) ^ NORMAL_SALT) % 48;
}

/** Scrambles unit normals in place: out[k] = ±n[perm[k]]. */
export function scrambleNormals(normals: Float32Array, key: number): void {
  for (let i = 0; i < normals.length / 3; i++) {
    const code = normalCode(i, key);
    const perm = PERMUTATIONS[code % 6];
    const signs = Math.floor(code / 6);
    const n = [normals[i * 3], normals[i * 3 + 1], normals[i * 3 + 2]];
    for (let k = 0; k < 3; k++) normals[i * 3 + k] = ((signs >> k) & 1 ? -1 : 1) * n[perm[k]];
  }
}

/** The inverse of scrambleNormals (what the shader does), for tests and tools. */
export function unscrambleNormals(normals: Float32Array, key: number): void {
  for (let i = 0; i < normals.length / 3; i++) {
    const code = normalCode(i, key);
    const perm = PERMUTATIONS[code % 6];
    const signs = Math.floor(code / 6);
    const out = [normals[i * 3], normals[i * 3 + 1], normals[i * 3 + 2]];
    for (let k = 0; k < 3; k++) normals[i * 3 + perm[k]] = ((signs >> k) & 1 ? -1 : 1) * out[k];
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
vec3 scrambleAxis(int i) {
  return vec3(i == 0 ? 1.0 : 0.0, i == 1 ? 1.0 : 0.0, i == 2 ? 1.0 : 0.0);
}
ivec3 scramblePermutation(uint p) {
  if (p == 0u) return ivec3(0, 1, 2);
  if (p == 1u) return ivec3(0, 2, 1);
  if (p == 2u) return ivec3(1, 0, 2);
  if (p == 3u) return ivec3(1, 2, 0);
  if (p == 4u) return ivec3(2, 0, 1);
  return ivec3(2, 1, 0);
}
vec3 unscrambleNormal(vec3 o) {
  uint code = scrambleHash((uint(gl_VertexID) * 3u + scrambleKey) ^ 0x9e3779b9u) % 48u;
  ivec3 p = scramblePermutation(code % 6u);
  uint s = code / 6u;
  vec3 signs = vec3((s & 1u) != 0u ? -1.0 : 1.0, (s & 2u) != 0u ? -1.0 : 1.0, (s & 4u) != 0u ? -1.0 : 1.0);
  vec3 v = o * signs;
  return v.x * scrambleAxis(p.x) + v.y * scrambleAxis(p.y) + v.z * scrambleAxis(p.z);
}
`;

/** Makes a three.js material undo the scramble in its vertex shader (and the normals', if set). */
export function unscrambleInShader(material: Material, key: number, amount: number, normals = false): void {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.scrambleKey = { value: key >>> 0 };
    shader.uniforms.scrambleAmount = { value: amount };
    let vertex = shader.vertexShader.replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
      transformed -= vec3(scrambleOffset(0u), scrambleOffset(1u), scrambleOffset(2u)) * scrambleAmount;`,
    );
    if (normals) {
      vertex = vertex.replace(
        "#include <beginnormal_vertex>",
        `#include <beginnormal_vertex>
      objectNormal = unscrambleNormal(objectNormal);`,
      );
    }
    shader.vertexShader = GLSL + vertex;
  };
  material.customProgramCacheKey = () => (normals ? "unscramble-n" : "unscramble");
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
