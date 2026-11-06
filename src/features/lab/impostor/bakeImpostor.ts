import {
  AmbientLight,
  Box3,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  OrthographicCamera,
  Scene,
  Sphere,
  Vector3,
  WebGLRenderer,
  type Object3D,
} from "three";

import { frameBasis, frameDirection } from "./impostorMath";

export interface BakeOptions {
  /** Frames per side of the hemi-octahedral grid (N × N views). */
  grid: number;
  /** Pixels per frame. grid × tile must stay ≤ 4096 for phones. */
  tile: number;
  /** Colour the model is shaded in (models have no materials worth keeping). */
  color?: string;
}

export interface BakedImpostor {
  /** The atlas as WebP: what a paid model's page would download instead of a mesh. */
  blob: Blob;
  url: string;
  grid: number;
  tile: number;
  /** Radius of the model's bounding sphere, in model units (the frames cover ±radius). */
  radius: number;
  bakeMs: number;
}

/**
 * Renders the model from grid × grid directions over the upper hemisphere into one atlas image.
 * Colour only: no depth or normal maps, which would make rebuilding the mesh much easier.
 * Lights move with the camera, so every frame is lit the same way relative to the viewer.
 */
export async function bakeImpostor(model: Object3D, { grid, tile, color = "#c9c6d4" }: BakeOptions): Promise<BakedImpostor> {
  const started = performance.now();
  const size = grid * tile;
  if (size > 4096) throw new Error("The atlas would be larger than 4096 px; use fewer or smaller frames.");

  const material = new MeshStandardMaterial({ color, roughness: 0.62, metalness: 0.05 });
  model.traverse((node) => {
    if ((node as Mesh).isMesh) (node as Mesh).material = material;
  });

  const scene = new Scene();
  scene.add(model);
  model.updateMatrixWorld(true);
  const sphere = new Box3().setFromObject(model).getBoundingSphere(new Sphere());
  const center = sphere.center;
  const radius = sphere.radius * 1.02;

  const camera = new OrthographicCamera(-radius, radius, radius, -radius, radius * 0.01, radius * 4);
  scene.add(camera);
  camera.add(new HemisphereLight("#ffffff", "#3a3448", 1.1));
  camera.add(new AmbientLight("#ffffff", 0.25));
  const key = new DirectionalLight("#ffffff", 2.2);
  key.position.set(-0.6, 0.8, 1);
  camera.add(key);
  camera.add(key.target);
  const rim = new DirectionalLight("#ffffff", 0.6);
  rim.position.set(0.8, 0.3, -0.6);
  camera.add(rim);
  camera.add(rim.target);

  const renderer = new WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(tile, tile, false);
  renderer.setClearColor(0x000000, 0);

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
    renderer.dispose();
    material.dispose();
  }

  const blob = await new Promise<Blob>((resolve, reject) =>
    atlas.toBlob((result) => (result ? resolve(result) : reject(new Error("Encoding failed."))), "image/webp", 0.86),
  );

  return { blob, url: URL.createObjectURL(blob), grid, tile, radius, bakeMs: performance.now() - started };
}
