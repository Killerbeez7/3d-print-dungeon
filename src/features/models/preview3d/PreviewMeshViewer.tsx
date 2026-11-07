import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { BufferAttribute, BufferGeometry, Sphere, Vector3, type Mesh } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { MeshPreview, type MeshPreviewHandle } from "./MeshPreview";
import { decodePackedLevel, hasLevel, isPackedPreview, readPackedHeader, type MeshLevel } from "./packedPreview";

interface Base {
  geometry: BufferGeometry;
  bounds: Sphere;
  scramble?: { key: number; amount: number; normals?: boolean };
}

const toGeometry = (level: MeshLevel) => {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(level.positions, 3));
  geometry.setAttribute("normal", new BufferAttribute(level.normals, 3));
  geometry.setIndex(new BufferAttribute(level.indices, 1));
  return geometry;
};

/** An older preview (GLB): plain, or scrambled with the key in meshes[0].extras.pd. */
async function readGlbPreview(bytes: Uint8Array): Promise<Base> {
  const gltf = await new GLTFLoader().parseAsync(bytes.slice().buffer, "");
  let found: Mesh | null = null;
  gltf.scene.traverse((node) => {
    if (!found && (node as Mesh).isMesh) found = node as Mesh;
  });
  if (!found) throw new Error("The preview has no mesh.");
  const mesh = found as Mesh;
  const geometry = mesh.geometry as BufferGeometry;
  const pd = (mesh.userData as { pd?: unknown }).pd;
  if (Array.isArray(pd) && pd.length === 3 && pd.every((value) => typeof value === "number" && Number.isFinite(value))) {
    const [key, amount, radius] = pd as number[];
    return { geometry, bounds: new Sphere(new Vector3(), radius), scramble: { key: key >>> 0, amount } };
  }
  geometry.computeBoundingSphere();
  return { geometry, bounds: geometry.boundingSphere?.clone() ?? new Sphere(new Vector3(), 1) };
}

interface PreviewMeshViewerProps {
  /** The preview file as far as it has downloaded (all of it once `complete`). */
  getBytes: () => Uint8Array | null;
  complete: boolean;
  /** Download progress (0-1); a change means more bytes have arrived. */
  progress: number;
  autoRotate: boolean;
  handleRef: MutableRefObject<MeshPreviewHandle | null>;
  onReady: () => void;
  onError: () => void;
  className?: string;
}

/**
 * The model page's 3D view. A packed preview shows its light level as soon as that part has
 * downloaded, then swaps in the full level in place; positions and normals are unscrambled
 * on the graphics card. Older GLB previews (plain or scrambled) show once complete.
 */
const PreviewMeshViewer = ({
  getBytes,
  complete,
  progress,
  autoRotate,
  handleRef,
  onReady,
  onError,
  className = "",
}: PreviewMeshViewerProps) => {
  const [base, setBase] = useState<Base | null>(null);
  const [detail, setDetail] = useState<BufferGeometry | null>(null);
  // none → (light) → full; decoding one step at a time.
  const [stage, setStage] = useState<"none" | "light" | "full">("none");
  const busy = useRef(false);

  useEffect(() => {
    if (busy.current || stage === "full") return;
    const bytes = getBytes();
    if (!bytes || bytes.byteLength < 8) return;

    const run = (job: () => Promise<void>) => {
      busy.current = true;
      job()
        .catch(() => onError())
        .finally(() => {
          busy.current = false;
        });
    };

    if (isPackedPreview(bytes)) {
      const header = readPackedHeader(bytes);
      if (!header) return;
      const last = header.levels.length - 1;
      const scramble = header.scramble
        ? { key: header.scramble.key, amount: header.scramble.amount, normals: header.scramble.normals }
        : undefined;
      if (stage === "none" && hasLevel(header, bytes.byteLength, 0)) {
        run(async () => {
          const geometry = toGeometry(await decodePackedLevel(bytes, header, 0));
          let bounds: Sphere;
          if (header.scramble) {
            bounds = new Sphere(new Vector3(), header.scramble.radius);
          } else {
            geometry.computeBoundingSphere();
            bounds = geometry.boundingSphere?.clone() ?? new Sphere(new Vector3(), 1);
          }
          setBase({ geometry, bounds, scramble });
          setStage(last === 0 ? "full" : "light");
        });
      } else if (stage === "light" && hasLevel(header, bytes.byteLength, last)) {
        run(async () => {
          setDetail(toGeometry(await decodePackedLevel(bytes, header, last)));
          setStage("full");
        });
      }
      return;
    }

    if (complete && stage === "none") {
      run(async () => {
        setBase(await readGlbPreview(bytes));
        setStage("full");
      });
    }
  }, [getBytes, complete, progress, stage, onError]);

  // Stable identities, so the scene is only built once per file.
  const scramble = useMemo(() => base?.scramble, [base]);

  if (!base) return <div className={className} />;
  return (
    <MeshPreview
      geometry={base.geometry}
      detailGeometry={detail}
      bounds={base.bounds}
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
