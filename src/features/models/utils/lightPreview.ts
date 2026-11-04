import { MeshoptSimplifier } from "meshoptimizer/simplifier";

/**
 * Light previews: the public 3D viewer gets a reduced copy of the model, never
 * the printable original. Used by the upload page and by
 * scripts/make-light-previews.ts, so it depends on nothing but meshoptimizer.
 */

/** Triangles kept in the public preview. */
export const PREVIEW_TRIANGLES = 100_000;

export interface LightPreview {
    glb: ArrayBuffer;
    triangles: number;
    sourceTriangles: number;
}

/**
 * Builds the preview GLB from a triangle soup (three floats per vertex, three
 * vertices per triangle, as STLLoader returns it).
 */
export async function makeLightPreview(
    soup: Float32Array,
    targetTriangles = PREVIEW_TRIANGLES
): Promise<LightPreview> {
    await MeshoptSimplifier.ready;

    const sourceTriangles = Math.floor(soup.length / 9);
    if (sourceTriangles === 0) {
        throw new Error("The model has no triangles.");
    }

    // Weld identical positions so the simplifier sees one connected surface,
    // then drop the duplicates (left in place they lock every vertex).
    const indices = MeshoptSimplifier.generatePositionRemap(soup, 3);
    const welded = compact(indices, soup);

    let simplified = indices;
    if (sourceTriangles > targetTriangles) {
        const targetIndices = targetTriangles * 3;
        [simplified] = MeshoptSimplifier.simplify(indices, welded, 3, targetIndices, 1);
        // Meshes with many separate parts can stall above the target.
        if (simplified.length > targetIndices * 1.25) {
            [simplified] = MeshoptSimplifier.simplifySloppy(indices, welded, 3, null, targetIndices, 1);
        }
    }

    const positions = compact(simplified, welded);
    centerPositions(positions);
    const mesh = creasedNormals(positions, simplified);

    return {
        glb: writeGlb(mesh.positions, mesh.normals, mesh.indices),
        triangles: simplified.length / 3,
        sourceTriangles,
    };
}

/** Rewrites indices to only the vertices they use and returns those positions. */
function compact(indices: Uint32Array, source: Float32Array): Float32Array {
    const [remap, vertexCount] = MeshoptSimplifier.compactMesh(indices);
    const positions = new Float32Array(vertexCount * 3);
    for (let i = 0; i < remap.length; i++) {
        const target = remap[i];
        if (target === 0xffffffff) continue;
        positions[target * 3] = source[i * 3];
        positions[target * 3 + 1] = source[i * 3 + 1];
        positions[target * 3 + 2] = source[i * 3 + 2];
    }
    return positions;
}

function centerPositions(positions: Float32Array): void {
    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < positions.length; i += 3) {
        for (let axis = 0; axis < 3; axis++) {
            const value = positions[i + axis];
            if (value < min[axis]) min[axis] = value;
            if (value > max[axis]) max[axis] = value;
        }
    }
    const center = [0, 1, 2].map((axis) => (min[axis] + max[axis]) / 2);
    for (let i = 0; i < positions.length; i += 3) {
        positions[i] -= center[0];
        positions[i + 1] -= center[1];
        positions[i + 2] -= center[2];
    }
}

/** Edges sharper than this stay sharp (60°); the rest is shaded smooth. */
const CREASE_COS = 0.5;

/**
 * Smooth normals that keep hard edges (a model's base rim) sharp: a corner
 * only averages the faces around it that bend less than the crease angle,
 * and a vertex is split where its corners end up with different normals.
 */
function creasedNormals(
    positions: Float32Array,
    indices: Uint32Array
): { positions: Float32Array; normals: Float32Array; indices: Uint32Array } {
    const triangleCount = indices.length / 3;
    const vertexCount = positions.length / 3;

    // Area-weighted face normals, plus unit versions for the angle test.
    const faceNormals = new Float32Array(triangleCount * 3);
    const faceUnits = new Float32Array(triangleCount * 3);
    for (let t = 0; t < triangleCount; t++) {
        const a = indices[t * 3] * 3;
        const b = indices[t * 3 + 1] * 3;
        const c = indices[t * 3 + 2] * 3;
        const abx = positions[b] - positions[a];
        const aby = positions[b + 1] - positions[a + 1];
        const abz = positions[b + 2] - positions[a + 2];
        const acx = positions[c] - positions[a];
        const acy = positions[c + 1] - positions[a + 1];
        const acz = positions[c + 2] - positions[a + 2];
        const nx = aby * acz - abz * acy;
        const ny = abz * acx - abx * acz;
        const nz = abx * acy - aby * acx;
        const length = Math.hypot(nx, ny, nz) || 1;
        faceNormals.set([nx, ny, nz], t * 3);
        faceUnits.set([nx / length, ny / length, nz / length], t * 3);
    }

    // Faces around each vertex (compressed adjacency lists).
    const offsets = new Uint32Array(vertexCount + 1);
    for (let i = 0; i < indices.length; i++) offsets[indices[i] + 1]++;
    for (let v = 0; v < vertexCount; v++) offsets[v + 1] += offsets[v];
    const cursor = offsets.slice(0, vertexCount);
    const faces = new Uint32Array(indices.length);
    for (let i = 0; i < indices.length; i++) faces[cursor[indices[i]]++] = Math.floor(i / 3);

    const outPositions: number[] = [];
    const outNormals: number[] = [];
    const outIndices = new Uint32Array(indices.length);
    const seen = new Map<number, number>();

    for (let i = 0; i < indices.length; i++) {
        const v = indices[i];
        const t = Math.floor(i / 3);
        let nx = 0;
        let ny = 0;
        let nz = 0;
        for (let k = offsets[v]; k < offsets[v + 1]; k++) {
            const f = faces[k];
            const dot =
                faceUnits[f * 3] * faceUnits[t * 3] +
                faceUnits[f * 3 + 1] * faceUnits[t * 3 + 1] +
                faceUnits[f * 3 + 2] * faceUnits[t * 3 + 2];
            if (dot >= CREASE_COS) {
                nx += faceNormals[f * 3];
                ny += faceNormals[f * 3 + 1];
                nz += faceNormals[f * 3 + 2];
            }
        }
        const length = Math.hypot(nx, ny, nz) || 1;
        nx /= length;
        ny /= length;
        nz /= length;

        // Corners of one vertex with (nearly) the same normal share a vertex.
        const q = (value: number) => Math.round((value + 1) * 127.5);
        const key = v * 16777216 + q(nx) * 65536 + q(ny) * 256 + q(nz);
        let out = seen.get(key);
        if (out === undefined) {
            out = outPositions.length / 3;
            seen.set(key, out);
            outPositions.push(positions[v * 3], positions[v * 3 + 1], positions[v * 3 + 2]);
            outNormals.push(nx, ny, nz);
        }
        outIndices[i] = out;
    }

    return {
        positions: new Float32Array(outPositions),
        normals: new Float32Array(outNormals),
        indices: outIndices,
    };
}

/** Minimal binary glTF: one mesh with positions, normals and indices. */
export function writeGlb(positions: Float32Array, normals: Float32Array, indices: Uint32Array): ArrayBuffer {
    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < positions.length; i += 3) {
        for (let axis = 0; axis < 3; axis++) {
            min[axis] = Math.min(min[axis], positions[i + axis]);
            max[axis] = Math.max(max[axis], positions[i + axis]);
        }
    }

    const vertexCount = positions.length / 3;
    const positionBytes = positions.byteLength;
    const normalBytes = normals.byteLength;
    const indexBytes = indices.byteLength;
    const binLength = positionBytes + normalBytes + indexBytes;

    const json = {
        asset: { version: "2.0", generator: "Print Dungeon light preview" },
        scene: 0,
        scenes: [{ nodes: [0] }],
        nodes: [{ mesh: 0 }],
        meshes: [{ primitives: [{ attributes: { POSITION: 0, NORMAL: 1 }, indices: 2, material: 0 }] }],
        materials: [
            {
                pbrMetallicRoughness: {
                    baseColorFactor: [0.5, 0.5, 0.52, 1],
                    metallicFactor: 0,
                    roughnessFactor: 0.7,
                },
            },
        ],
        buffers: [{ byteLength: binLength }],
        bufferViews: [
            { buffer: 0, byteOffset: 0, byteLength: positionBytes, target: 34962 },
            { buffer: 0, byteOffset: positionBytes, byteLength: normalBytes, target: 34962 },
            { buffer: 0, byteOffset: positionBytes + normalBytes, byteLength: indexBytes, target: 34963 },
        ],
        accessors: [
            { bufferView: 0, componentType: 5126, count: vertexCount, type: "VEC3", min, max },
            { bufferView: 1, componentType: 5126, count: vertexCount, type: "VEC3" },
            { bufferView: 2, componentType: 5125, count: indices.length, type: "SCALAR" },
        ],
    };

    const jsonBytes = new TextEncoder().encode(JSON.stringify(json));
    const jsonLength = Math.ceil(jsonBytes.length / 4) * 4;
    const totalLength = 12 + 8 + jsonLength + 8 + binLength;

    const glb = new ArrayBuffer(totalLength);
    const view = new DataView(glb);
    const bytes = new Uint8Array(glb);
    view.setUint32(0, 0x46546c67, true); // "glTF"
    view.setUint32(4, 2, true);
    view.setUint32(8, totalLength, true);

    view.setUint32(12, jsonLength, true);
    view.setUint32(16, 0x4e4f534a, true); // "JSON"
    bytes.fill(0x20, 20, 20 + jsonLength);
    bytes.set(jsonBytes, 20);

    const binStart = 20 + jsonLength;
    view.setUint32(binStart, binLength, true);
    view.setUint32(binStart + 4, 0x004e4942, true); // "BIN"
    const data = binStart + 8;
    bytes.set(new Uint8Array(positions.buffer, positions.byteOffset, positionBytes), data);
    bytes.set(new Uint8Array(normals.buffer, normals.byteOffset, normalBytes), data + positionBytes);
    bytes.set(new Uint8Array(indices.buffer, indices.byteOffset, indexBytes), data + positionBytes + normalBytes);

    return glb;
}
