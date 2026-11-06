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
  /** Pixels per frame (square). */
  tile: number;
  /** Called after each view with how many are done. */
  onProgress?: (done: number, total: number) => void;
}

export interface BakedImpostor {
  /**
   * One WebP per view, in grid order (row j, column i → index j × grid + i): what a paid
   * model's page would download instead of a mesh. Separate pictures so the viewer only has to
   * decode the few near the current angle.
   */
  frames: Blob[];
  bytes: number;
  grid: number;
  tile: number;
  bakeMs: number;
}

/** WebP quality per view: high, since the views are the whole preview; 0.85 keeps 400 views of a detailed model under ~10 MB. */
const QUALITY = 0.85;

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
 * Renders the model from grid × grid directions over the upper hemisphere, one WebP per view.
 * Colour only: no depth or normal maps, which would make rebuilding the mesh much easier.
 * Lit like today's viewer (near-white material, neutral studio light plus a key light, neutral
 * tone mapping).
 */
export async function bakeImpostor(model: Object3D, { grid, tile, onProgress }: BakeOptions): Promise<BakedImpostor> {
  const started = performance.now();

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

  const frames: Blob[] = [];
  const total = grid * grid;
  const encode = () =>
    new Promise<Blob>((resolve, reject) =>
      renderer.domElement.toBlob(
        (result) => (result ? resolve(result) : reject(new Error("Encoding a view failed."))),
        "image/webp",
        QUALITY,
      ),
    );

  try {
    for (let j = 0; j < grid; j++) {
      for (let i = 0; i < grid; i++) {
        const direction = frameDirection(i, j, grid);
        const { up } = frameBasis(direction);
        camera.position.copy(center).add(new Vector3(...direction).multiplyScalar(radius * 2));
        camera.up.set(...up);
        camera.lookAt(center);
        renderer.render(scene, camera);
        frames.push(await encode());
        onProgress?.(frames.length, total);
      }
    }
  } finally {
    environment.dispose();
    pmrem.dispose();
    renderer.dispose();
    material.dispose();
  }

  const bytes = frames.reduce((sum, frame) => sum + frame.size, 0);
  return { frames, bytes, grid, tile, bakeMs: performance.now() - started };
}
