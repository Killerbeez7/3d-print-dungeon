import { BufferGeometry, Mesh, type Object3D } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { makeLightPreview } from "@/features/models/utils/lightPreview";

/** The model as one triangle soup (world positions), standing up if asked. */
export async function loadSoup(glbUrl: string, standUp: boolean): Promise<Float32Array> {
  const gltf = await new GLTFLoader().loadAsync(glbUrl);
  const root: Object3D = gltf.scene;
  if (standUp) root.rotation.x = -Math.PI / 2;
  root.updateMatrixWorld(true);
  const chunks: Float32Array[] = [];
  root.traverse((node) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh) return;
    const geometry = (mesh.geometry as BufferGeometry).toNonIndexed();
    geometry.applyMatrix4(mesh.matrixWorld);
    chunks.push(geometry.getAttribute("position").array as Float32Array);
  });
  const soup = new Float32Array(chunks.reduce((sum, chunk) => sum + chunk.length, 0));
  let offset = 0;
  for (const chunk of chunks) {
    soup.set(chunk, offset);
    offset += chunk.length;
  }
  return soup;
}

export interface LabMesh {
  geometry: BufferGeometry;
  triangles: number;
  /** Size of the GLB the browser would download. */
  bytes: number;
}

/**
 * The model reduced to about `targetTriangles` (or kept whole when it has fewer), welded, with
 * creased normals and centred: the same code that makes today's light previews.
 */
export async function makeLabMesh(soup: Float32Array, targetTriangles: number): Promise<LabMesh> {
  // Plain: the lab scrambles separately, to compare the methods.
  const preview = await makeLightPreview(soup, targetTriangles, { scramble: false });
  const gltf = await new GLTFLoader().parseAsync(preview.glb, "");
  let geometry: BufferGeometry | null = null;
  gltf.scene.traverse((node) => {
    const mesh = node as Mesh;
    if (!geometry && mesh.isMesh) geometry = mesh.geometry as BufferGeometry;
  });
  if (!geometry) throw new Error("The model has no mesh.");
  return { geometry, triangles: preview.triangles, bytes: preview.glb.byteLength };
}

export const soupTriangles = (soup: Float32Array) => Math.floor(soup.length / 9);
