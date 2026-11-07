import { MeshoptDecoder } from "meshoptimizer/decoder";
import { MeshoptEncoder } from "meshoptimizer/encoder";

/**
 * Packed preview ("PDP1"): the public 3D preview in a compact file of our own, smaller than a
 * GLB and not a format 3D programs open. Several levels of detail follow each other (a light
 * one first), so the viewer can show the first level while the rest downloads.
 *
 *   "PDP1" | u32 header length | header JSON (padded to 4) | level 0 vertices | level 0 indices | level 1 …
 *
 * Each vertex is 8 bytes: x, y, z as 16-bit integers over the file's bounds (the scrambled
 * cloud's), then the normal as two 8-bit octahedral components. Vertex and index streams are
 * compressed with meshoptimizer. Positions and normals are stored scrambled (see scramble.ts);
 * the header says how to undo it.
 */

const MAGIC = 0x31504450; // "PDP1" read as a little-endian u32
const VERTEX_SIZE = 8;

export interface PackedScramble {
  key: number;
  amount: number;
  /** Radius of the real, centred model, for framing. */
  radius: number;
  /** Normals are scrambled too. */
  normals: boolean;
}

export interface MeshLevel {
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
}

interface LevelInfo {
  vertexCount: number;
  indexCount: number;
  vertexBytes: number;
  indexBytes: number;
}

interface Header {
  version: 1;
  levels: LevelInfo[];
  /** Box the 16-bit positions are spread over. */
  min: [number, number, number];
  max: [number, number, number];
  scramble: PackedScramble | null;
}

export interface PackedHeader extends Header {
  /** Byte offset where each level's vertex stream starts. */
  offsets: number[];
  /** Byte length of the whole file. */
  totalBytes: number;
}

const encodeOct = (x: number, y: number, z: number): [number, number] => {
  const sum = Math.abs(x) + Math.abs(y) + Math.abs(z) || 1;
  let px = x / sum;
  let py = y / sum;
  if (z < 0) {
    const ox = px;
    px = (1 - Math.abs(py)) * (ox >= 0 ? 1 : -1);
    py = (1 - Math.abs(ox)) * (py >= 0 ? 1 : -1);
  }
  return [Math.round(px * 127), Math.round(py * 127)];
};

const decodeOct = (ex: number, ey: number, out: Float32Array, at: number) => {
  let x = Math.max(ex / 127, -1);
  let y = Math.max(ey / 127, -1);
  const z = 1 - Math.abs(x) - Math.abs(y);
  if (z < 0) {
    const ox = x;
    x = (1 - Math.abs(y)) * (ox >= 0 ? 1 : -1);
    y = (1 - Math.abs(ox)) * (y >= 0 ? 1 : -1);
  }
  const length = Math.hypot(x, y, z) || 1;
  out[at] = x / length;
  out[at + 1] = y / length;
  out[at + 2] = z / length;
};

/**
 * Packs the levels (already scrambled, vertices in their final order) into one file.
 * Reorders each level for compression first.
 */
export async function encodePackedPreview(
  levels: MeshLevel[],
  scramble: PackedScramble | null,
): Promise<Uint8Array<ArrayBuffer>> {
  await MeshoptEncoder.ready;
  const min: [number, number, number] = [Infinity, Infinity, Infinity];
  const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];
  for (const level of levels) {
    for (let i = 0; i < level.positions.length; i += 3) {
      for (let axis = 0; axis < 3; axis++) {
        min[axis] = Math.min(min[axis], level.positions[i + axis]);
        max[axis] = Math.max(max[axis], level.positions[i + axis]);
      }
    }
  }
  const span = max.map((value, axis) => value - min[axis] || 1);

  const infos: LevelInfo[] = [];
  const blocks: Uint8Array[] = [];
  for (const level of levels) {
    const vertexCount = level.positions.length / 3;
    const raw = new ArrayBuffer(vertexCount * VERTEX_SIZE);
    const view = new DataView(raw);
    for (let v = 0; v < vertexCount; v++) {
      for (let axis = 0; axis < 3; axis++) {
        const unit = (level.positions[v * 3 + axis] - min[axis]) / span[axis];
        view.setInt16(v * VERTEX_SIZE + axis * 2, Math.round(unit * 65535) - 32768, true);
      }
      const [ox, oy] = encodeOct(level.normals[v * 3], level.normals[v * 3 + 1], level.normals[v * 3 + 2]);
      view.setInt8(v * VERTEX_SIZE + 6, ox);
      view.setInt8(v * VERTEX_SIZE + 7, oy);
    }
    const vertexBlock = MeshoptEncoder.encodeVertexBuffer(new Uint8Array(raw), vertexCount, VERTEX_SIZE);
    const indexBlock = MeshoptEncoder.encodeIndexBuffer(
      new Uint8Array(level.indices.buffer, level.indices.byteOffset, level.indices.byteLength),
      level.indices.length,
      4,
    );
    infos.push({
      vertexCount,
      indexCount: level.indices.length,
      vertexBytes: vertexBlock.byteLength,
      indexBytes: indexBlock.byteLength,
    });
    blocks.push(vertexBlock, indexBlock);
  }

  const header: Header = { version: 1, levels: infos, min, max, scramble };
  const json = new TextEncoder().encode(JSON.stringify(header));
  const jsonLength = Math.ceil(json.length / 4) * 4;
  const total = 8 + jsonLength + blocks.reduce((sum, block) => sum + block.byteLength, 0);
  const file = new Uint8Array(total);
  const view = new DataView(file.buffer);
  view.setUint32(0, MAGIC, true);
  view.setUint32(4, jsonLength, true);
  file.fill(0x20, 8, 8 + jsonLength);
  file.set(json, 8);
  let offset = 8 + jsonLength;
  for (const block of blocks) {
    file.set(block, offset);
    offset += block.byteLength;
  }
  return file;
}

/** Is this the start of a packed preview (rather than, say, an older GLB preview)? */
export const isPackedPreview = (bytes: Uint8Array) =>
  bytes.byteLength >= 4 && new DataView(bytes.buffer, bytes.byteOffset, 4).getUint32(0, true) === MAGIC;

/** The header, once enough of the file has arrived to read it (null until then). */
export function readPackedHeader(bytes: Uint8Array): PackedHeader | null {
  if (!isPackedPreview(bytes) || bytes.byteLength < 8) return null;
  const jsonLength = new DataView(bytes.buffer, bytes.byteOffset + 4, 4).getUint32(0, true);
  if (bytes.byteLength < 8 + jsonLength) return null;
  const header = JSON.parse(new TextDecoder().decode(bytes.subarray(8, 8 + jsonLength)).trim()) as Header;
  const offsets: number[] = [];
  let offset = 8 + jsonLength;
  for (const level of header.levels) {
    offsets.push(offset);
    offset += level.vertexBytes + level.indexBytes;
  }
  return { ...header, offsets, totalBytes: offset };
}

/** Whether level `index` has fully arrived. */
export const hasLevel = (header: PackedHeader, received: number, index: number) =>
  received >= header.offsets[index] + header.levels[index].vertexBytes + header.levels[index].indexBytes;

/** Decodes one level: positions and normals as stored (still scrambled), and the triangles. */
export async function decodePackedLevel(bytes: Uint8Array, header: PackedHeader, index: number): Promise<MeshLevel> {
  await MeshoptDecoder.ready;
  const info = header.levels[index];
  const start = header.offsets[index];
  const raw = new Uint8Array(info.vertexCount * VERTEX_SIZE);
  MeshoptDecoder.decodeVertexBuffer(raw, info.vertexCount, VERTEX_SIZE, bytes.subarray(start, start + info.vertexBytes));
  const indices = new Uint32Array(info.indexCount);
  MeshoptDecoder.decodeIndexBuffer(
    new Uint8Array(indices.buffer),
    info.indexCount,
    4,
    bytes.subarray(start + info.vertexBytes, start + info.vertexBytes + info.indexBytes),
  );

  const view = new DataView(raw.buffer);
  const positions = new Float32Array(info.vertexCount * 3);
  const normals = new Float32Array(info.vertexCount * 3);
  const span = header.max.map((value, axis) => value - header.min[axis] || 1);
  for (let v = 0; v < info.vertexCount; v++) {
    for (let axis = 0; axis < 3; axis++) {
      const unit = (view.getInt16(v * VERTEX_SIZE + axis * 2, true) + 32768) / 65535;
      positions[v * 3 + axis] = header.min[axis] + unit * span[axis];
    }
    decodeOct(view.getInt8(v * VERTEX_SIZE + 6), view.getInt8(v * VERTEX_SIZE + 7), normals, v * 3);
  }
  return { positions, normals, indices };
}

/** Reorders a mesh's vertices and triangles for better compression (before scrambling). */
export async function optimizeForPacking(level: MeshLevel): Promise<MeshLevel> {
  await MeshoptEncoder.ready;
  const indices = level.indices.slice();
  const [remap, unique] = MeshoptEncoder.reorderMesh(indices, true, true);
  const positions = new Float32Array(unique * 3);
  const normals = new Float32Array(unique * 3);
  for (let i = 0; i < remap.length; i++) {
    const target = remap[i];
    if (target === 0xffffffff) continue;
    positions.set(level.positions.subarray(i * 3, i * 3 + 3), target * 3);
    normals.set(level.normals.subarray(i * 3, i * 3 + 3), target * 3);
  }
  return { positions, normals, indices };
}
