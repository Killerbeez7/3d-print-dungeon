import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Sphere, Vector3, type BufferGeometry, type Mesh } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { MeshPreview } from "../mesh/MeshPreview";
import { decodeRipTest, ripTestUrl } from "../mesh/ripTest";

/**
 * A published rip test: only the scrambled file is downloaded, and the viewer unscrambles it on
 * screen. Open to everyone (also before launch), so a friend can try to rip it.
 */
export const RipTestPage = () => {
  const [params] = useSearchParams();
  const test = useMemo(() => decodeRipTest(params.get("t")), [params]);
  const [geometry, setGeometry] = useState<BufferGeometry | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!test) return;
    let cancelled = false;
    ripTestUrl(test)
      .then((url) => new GLTFLoader().loadAsync(url))
      .then((gltf) => {
        let found: BufferGeometry | null = null;
        gltf.scene.traverse((node) => {
          if (!found && (node as Mesh).isMesh) found = (node as Mesh).geometry as BufferGeometry;
        });
        if (cancelled) return;
        if (found) setGeometry(found);
        else setError("The file has no mesh.");
      })
      .catch(() => !cancelled && setError("This test's file couldn't be loaded. It may have been removed."));
    return () => {
      cancelled = true;
    };
  }, [test]);

  const scramble = useMemo(() => (test ? { key: test.key, amount: test.amount } : undefined), [test]);
  const bounds = useMemo(() => new Sphere(new Vector3(), test?.radius ?? 1), [test]);

  return (
    <div className="mx-auto max-w-[1000px] px-4 pb-16 pt-8 sm:px-6">
      <p className="label-mono text-accent">Rip test</p>
      <h1 className="mt-1 text-3xl font-bold text-txt-primary sm:text-4xl">Can you rip this model?</h1>
      <p className="mt-2 max-w-2xl text-txt-secondary">
        Drag to turn it, scroll or pinch to zoom. Then try to save it as a printable file, with any tool you like.
      </p>
      <div className="mt-6 overflow-hidden rounded-xl border border-br-subtle bg-surface-card">
        {!test ? (
          <p className="p-6 text-txt-secondary">This link isn&apos;t a valid rip test.</p>
        ) : error ? (
          <p className="p-6 text-txt-secondary">{error}</p>
        ) : geometry ? (
          <MeshPreview
            geometry={geometry}
            bounds={bounds}
            scramble={scramble}
            label="The model to rip"
            className="aspect-square w-full bg-page sm:aspect-[4/3]"
          />
        ) : (
          <div role="status" aria-label="Loading the model" className="skeleton-print aspect-square w-full sm:aspect-[4/3]" />
        )}
      </div>
    </div>
  );
};
