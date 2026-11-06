import {
  Box3,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  NeutralToneMapping,
  OrthographicCamera,
  PMREMGenerator,
  Scene,
  Sphere,
  Vector3,
  WebGLRenderer,
  type BufferGeometry,
  type Object3D,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

import { frameBasis, frameDirection, type Vec3 } from "./impostorMath";

export interface BakeOptions {
  /** Frames per side of the hemi-octahedral grid (N × N views). */
  grid: number;
  /** Pixels per frame. grid × tile must stay ≤ 4096 for phones. */
  tile: number;
}

export interface BakedImpostor {
  /** The atlas as WebP: what a paid model's page would download instead of a mesh. */
  blob: Blob;
  url: string;
  grid: number;
  tile: number;
  bakeMs: number;
}

/** At most this many vertices are used to measure the model's outline (plenty for framing). */
const FRAMING_SAMPLES = 60_000;

/**
 * The half-size every frame needs so the model's outline fits in all of them: the largest
 * distance of any vertex from the centre, along any frame's right or up axis. Tighter than the
 * bounding sphere, so the model fills the frames (and the viewer) like today's 3D viewer.
 */
function framingHalfSize(model: Object3D, center: Vector3, grid: number): number {
  const points: Vec3[] = [];
  const v = new Vector3();
  model.traverse((node) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh) return;
    const position = (mesh.geometry as BufferGeometry).getAttribute("position");
    const step = Math.max(1, Math.floor(position.count / FRAMING_SAMPLES));
    for (let k = 0; k < position.count; k += step) {
      v.fromBufferAttribute(position, k).applyMatrix4(mesh.matrixWorld).sub(center);
      points.push([v.x, v.y, v.z]);
    }
  });
  let half = 0;
  for (let j = 0; j < grid; j++) {
    for (let i = 0; i < grid; i++) {
      const { right, up } = frameBasis(frameDirection(i, j, grid));
      for (const p of points) {
        half = Math.max(
          half,
          Math.abs(p[0] * right[0] + p[1] * right[1] + p[2] * right[2]),
          Math.abs(p[0] * up[0] + p[1] * up[1] + p[2] * up[2]),
        );
      }
    }
  }
  return half;
}

/**
 * Renders the model from grid × grid directions over the upper hemisphere into one atlas image.
 * Colour only: no depth or normal maps, which would make rebuilding the mesh much easier.
 * Lit like today's viewer (near-white material, neutral studio light plus a key light, neutral
 * tone mapping).
 */
export async function bakeImpostor(model: Object3D, { grid, tile }: BakeOptions): Promise<BakedImpostor> {
  const started = performance.now();
  const size = grid * tile;
  if (size > 4096) throw new Error("The atlas would be larger than 4096 px; use fewer or smaller frames.");

  const material = new MeshStandardMaterial({ color: "#f2f2f4", roughness: 0.6, metalness: 0 });
  model.traverse((node) => {
    if ((node as Mesh).isMesh) (node as Mesh).material = material;
  });

  const scene = new Scene();
  scene.add(model);
  model.updateMatrixWorld(true);
  const sphere = new Box3().setFromObject(model).getBoundingSphere(new Sphere());
  const center = sphere.center;
  const radius = sphere.radius;
  // A 3% margin so antialiased edges never touch the frame border.
  const half = (framingHalfSize(model, center, grid) || radius) * 1.03;

  const camera = new OrthographicCamera(-half, half, half, -half, radius * 0.01, radius * 4);

  const renderer = new WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(tile, tile, false);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = NeutralToneMapping;
  const pmrem = new PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = environment;
  // Soft studio light alone washes out fine surface detail; a key light from above-front-left
  // (fixed to the model, like a lamp in a room) brings the relief back.
  scene.environmentIntensity = 0.55;
  const key = new DirectionalLight("#ffffff", 1.6);
  key.position.set(center.x - radius, center.y + radius * 1.6, center.z + radius);
  key.target.position.copy(center);
  scene.add(key, key.target);

  const atlas = document.createElement("canvas");
  atlas.width = size;
  atlas.height = size;
  const context = atlas.getContext("2d");
  if (!context) throw new Error("Canvas 2D is not available.");

  try {
    for (let j = 0; j < grid; j++) {
      for (let i = 0; i < grid; i++) {
        const direction = frameDirection(i, j, grid);
        const { up } = frameBasis(direction);
        camera.position.copy(center).add(new Vector3(...direction).multiplyScalar(radius * 2));
        camera.up.set(...up);
        camera.lookAt(center);
        renderer.render(scene, camera);
        context.drawImage(renderer.domElement, i * tile, j * tile);
      }
      // Let the page breathe between rows so the progress can paint.
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  } finally {
    environment.dispose();
    pmrem.dispose();
    renderer.dispose();
    material.dispose();
  }

  const blob = await new Promise<Blob>((resolve, reject) =>
    atlas.toBlob((result) => (result ? resolve(result) : reject(new Error("Encoding failed."))), "image/webp", 0.86),
  );

  return { blob, url: URL.createObjectURL(blob), grid, tile, bakeMs: performance.now() - started };
}
