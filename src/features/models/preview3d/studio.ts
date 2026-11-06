import {
  DirectionalLight,
  MeshStandardMaterial,
  NeutralToneMapping,
  PMREMGenerator,
  type Scene,
  type Texture,
  type Vector3,
  type WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * The lab's lighting, shared by every preview method so they can be compared fairly: soft
 * studio light plus a key light from above-front-left, neutral tone mapping, a near-white
 * matte material. Close to today's viewer (model-viewer with the neutral environment).
 */
export function setUpStudio(renderer: WebGLRenderer, scene: Scene, center: Vector3, radius: number): () => void {
  renderer.toneMapping = NeutralToneMapping;
  const pmrem = new PMREMGenerator(renderer);
  const environment: Texture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = environment;
  scene.environmentIntensity = 0.55;
  const key = new DirectionalLight("#ffffff", 1.6);
  key.position.set(center.x - radius, center.y + radius * 1.6, center.z + radius);
  key.target.position.copy(center);
  scene.add(key, key.target);
  return () => {
    scene.remove(key, key.target);
    environment.dispose();
    pmrem.dispose();
  };
}

export const studioMaterial = () => new MeshStandardMaterial({ color: "#f2f2f4", roughness: 0.6, metalness: 0 });
