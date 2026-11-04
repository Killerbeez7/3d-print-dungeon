/**
 * Size and volume of the model in a GLB file (the 3D preview), read without three.js.
 * Model files carry no units; 3D printing files are almost always in millimetres, so the
 * numbers are reported as mm and cm³.
 */
export interface MeshStats {
  /** Bounding box in file units: x (width), y (height, the viewer's up), z (depth). */
  size: [number, number, number];
  /** Enclosed volume in cubic file units (mm³); 0 when the surface isn't closed. */
  volume: number;
  triangles: number;
}

const GLB_MAGIC = 0x46546c67;
const CHUNK_JSON = 0x4e4f534a;
const CHUNK_BIN = 0x004e4942;
const COMPONENTS: Record<string, number> = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };
const BYTES: Record<number, number> = { 5121: 1, 5123: 2, 5125: 4, 5126: 4 };

interface Accessor {
  bufferView?: number;
  byteOffset?: number;
  componentType: number;
  count: number;
  type: string;
}
interface BufferView {
  byteOffset?: number;
  byteLength: number;
  byteStride?: number;
}
interface Node {
  mesh?: number;
  children?: number[];
  scale?: [number, number, number];
}
interface Gltf {
  scene?: number;
  scenes?: { nodes?: number[] }[];
  nodes?: Node[];
  meshes?: {
    primitives: { attributes: Record<string, number>; indices?: number; mode?: number }[];
  }[];
  accessors?: Accessor[];
  bufferViews?: BufferView[];
}

function readAccessor(gltf: Gltf, bin: DataView, index: number): Float64Array {
  const accessor = gltf.accessors![index];
  const view = gltf.bufferViews![accessor.bufferView ?? 0];
  const components = COMPONENTS[accessor.type] ?? 1;
  const size = BYTES[accessor.componentType] ?? 4;
  const stride = view.byteStride || components * size;
  const start = (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
  const out = new Float64Array(accessor.count * components);
  for (let i = 0; i < accessor.count; i++) {
    for (let c = 0; c < components; c++) {
      const at = start + i * stride + c * size;
      out[i * components + c] =
        accessor.componentType === 5126
          ? bin.getFloat32(at, true)
          : accessor.componentType === 5125
            ? bin.getUint32(at, true)
            : accessor.componentType === 5123
              ? bin.getUint16(at, true)
              : bin.getUint8(at);
    }
  }
  return out;
}

/** Size and volume of every triangle mesh in the file's scene; null if it isn't a GLB. */
export function glbMeshStats(buffer: ArrayBuffer): MeshStats | null {
  const data = new DataView(buffer);
  if (buffer.byteLength < 20 || data.getUint32(0, true) !== GLB_MAGIC) return null;

  let gltf: Gltf | null = null;
  let bin: DataView | null = null;
  for (let offset = 12; offset + 8 <= buffer.byteLength; ) {
    const length = data.getUint32(offset, true);
    const type = data.getUint32(offset + 4, true);
    if (type === CHUNK_JSON) {
      gltf = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, offset + 8, length)));
    } else if (type === CHUNK_BIN) {
      bin = new DataView(buffer, offset + 8, length);
    }
    offset += 8 + length;
  }
  if (!gltf || !bin || !gltf.meshes?.length) return null;

  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  let volume = 0;
  let triangles = 0;

  const addMesh = (meshIndex: number, scale: number[]) => {
    for (const primitive of gltf!.meshes![meshIndex].primitives) {
      if (primitive.mode !== undefined && primitive.mode !== 4) continue; // triangles only
      const position = primitive.attributes.POSITION;
      if (position === undefined) continue;
      const p = readAccessor(gltf!, bin!, position);
      for (let i = 0; i < p.length; i++) p[i] *= scale[i % 3];
      for (let i = 0; i < p.length; i += 3) {
        for (let axis = 0; axis < 3; axis++) {
          min[axis] = Math.min(min[axis], p[i + axis]);
          max[axis] = Math.max(max[axis], p[i + axis]);
        }
      }
      const index =
        primitive.indices !== undefined ? readAccessor(gltf!, bin!, primitive.indices) : null;
      const count = index ? index.length : p.length / 3;
      for (let t = 0; t + 2 < count; t += 3) {
        const a = (index ? index[t] : t) * 3;
        const b = (index ? index[t + 1] : t + 1) * 3;
        const c = (index ? index[t + 2] : t + 2) * 3;
        // Signed volume of the tetrahedron (origin, a, b, c).
        volume +=
          (p[a] * (p[b + 1] * p[c + 2] - p[b + 2] * p[c + 1]) -
            p[a + 1] * (p[b] * p[c + 2] - p[b + 2] * p[c]) +
            p[a + 2] * (p[b] * p[c + 1] - p[b + 1] * p[c])) /
          6;
        triangles++;
      }
    }
  };

  const visit = (nodeIndex: number, scale: number[], depth: number) => {
    const node = gltf!.nodes?.[nodeIndex];
    if (!node || depth > 32) return;
    const s = node.scale ?? [1, 1, 1];
    const next = [scale[0] * s[0], scale[1] * s[1], scale[2] * s[2]];
    if (node.mesh !== undefined) addMesh(node.mesh, next);
    node.children?.forEach((child) => visit(child, next, depth + 1));
  };

  const roots = gltf.scenes?.[gltf.scene ?? 0]?.nodes;
  if (roots?.length) roots.forEach((root) => visit(root, [1, 1, 1], 0));
  else gltf.meshes.forEach((_, i) => addMesh(i, [1, 1, 1]));

  if (!triangles) return null;
  return {
    size: [max[0] - min[0], max[1] - min[1], max[2] - min[2]],
    volume: Math.abs(volume),
    triangles,
  };
}

/** Typical density of PLA filament, g/cm³. */
export const PLA_DENSITY = 1.24;
