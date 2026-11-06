import { useEffect, useMemo, useState, type MutableRefObject } from "react";
import { Sphere, Vector3, type BufferGeometry, type Mesh } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { MeshPreview, type MeshPreviewHandle } from "./MeshPreview";

interface Preview {
  geometry: BufferGeometry;
  bounds: Sphere;
  scramble?: { key: number; amount: number };
}

/** Reads a preview GLB: its mesh, and the scramble written by lightPreview.ts if it has one. */
async function readPreview(url: string): Promise<Preview> {
  const gltf = await new GLTFLoader().loadAsync(url);
  let mesh: Mesh | null = null;
  gltf.scene.traverse((node) => {
    if (!mesh && (node as Mesh).isMesh) mesh = node as Mesh;
  });
  if (!mesh) throw new Error("The preview has no mesh.");
  const found = mesh as Mesh;
  const geometry = found.geometry as BufferGeometry;
  const pd = (found.userData as { pd?: unknown }).pd;
  if (Array.isArray(pd) && pd.length === 3 && pd.every((value) => typeof value === "number" && Number.isFinite(value))) {
    const [key, amount, radius] = pd as number[];
    return { geometry, bounds: new Sphere(new Vector3(), radius), scramble: { key: key >>> 0, amount } };
  }
  // Older previews: plain meshes.
  geometry.computeBoundingSphere();
  return { geometry, bounds: geometry.boundingSphere?.clone() ?? new Sphere(new Vector3(), 1) };
}

interface PreviewMeshViewerProps {
  /** URL of the preview GLB (an object URL of the downloaded file). */
  src: string;
  autoRotate: boolean;
  handleRef: MutableRefObject<MeshPreviewHandle | null>;
  onReady: () => void;
  onError: () => void;
  className?: string;
}

/** The model page's 3D view: the light preview, unscrambled on screen. */
const PreviewMeshViewer = ({ src, autoRotate, handleRef, onReady, onError, className = "" }: PreviewMeshViewerProps) => {
  const [preview, setPreview] = useState<Preview | null>(null);

  useEffect(() => {
    let cancelled = false;
    setPreview(null);
    readPreview(src)
      .then((result) => !cancelled && setPreview(result))
      .catch(() => !cancelled && onError());
    return () => {
      cancelled = true;
    };
  }, [src, onError]);

  // Stable identities, so the scene is only built once per file.
  const scramble = useMemo(() => preview?.scramble, [preview]);

  if (!preview) return <div className={className} />;
  return (
    <MeshPreview
      geometry={preview.geometry}
      bounds={preview.bounds}
      scramble={scramble}
      autoRotate={autoRotate}
      handleRef={handleRef}
      onReady={onReady}
      label="3D model: drag to turn, scroll or pinch to zoom"
      className={className}
    />
  );
};

export default PreviewMeshViewer;
