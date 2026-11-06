import { createElement, useEffect, useState, type ChangeEvent } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { Group } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// Registers <model-viewer> (and its JSX types); this page is its own lazy chunk.
import "@google/model-viewer";

import { Button } from "@/components";
import { db } from "@/config/firebaseConfig";
import { finalConvertFileToGLB } from "@/features/models/utils/converter";
import { bakeImpostor, type BakedImpostor } from "../impostor/bakeImpostor";
import { ImpostorViewer, type ImpostorBlend } from "../impostor/ImpostorViewer";

/** grid × tile ≤ 4096 so the atlas fits every phone's texture limit. */
const PRESETS = [
  { id: "10x384", grid: 10, tile: 384, label: "100 views × 384 px (balanced)" },
  { id: "8x512", grid: 8, tile: 512, label: "64 views × 512 px (sharpest)" },
  { id: "12x320", grid: 12, tile: 320, label: "144 views × 320 px (smoothest)" },
  { id: "16x256", grid: 16, tile: 256, label: "256 views × 256 px" },
] as const;

interface SiteModel {
  id: string;
  name: string;
  url: string;
}

interface Source {
  name: string;
  /** GLB the bake and today's viewer both use. */
  glbUrl: string;
  glbBytes: number | null;
}

const BLENDS: { id: ImpostorBlend; label: string }[] = [
  { id: "fade", label: "Nearest view, quick fade (sharp)" },
  { id: "snap", label: "Nearest view, no fade" },
  { id: "soft", label: "Mostly the nearest view" },
  { id: "blend", label: "Blend 3 views (smooth, ghosting)" },
];

const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

async function newestSiteModels(): Promise<SiteModel[]> {
  const snapshot = await getDocs(query(collection(db, "models"), orderBy("createdAt", "desc"), limit(30)));
  return snapshot.docs
    .map((doc) => ({ id: doc.id, name: String(doc.data().name ?? doc.id), url: String(doc.data().convertedFileUrl ?? "") }))
    .filter((model) => model.url);
}

/**
 * Lab page (preview branch only): bake an impostor from a model and compare it with today's
 * viewer, for sharpness, smoothness and download size. Nothing is saved anywhere.
 */
export const ImpostorLabPage = () => {
  const [models, setModels] = useState<SiteModel[]>([]);
  const [modelsError, setModelsError] = useState(false);
  const [source, setSource] = useState<Source | null>(null);
  const [preset, setPreset] = useState<(typeof PRESETS)[number]["id"]>("10x384");
  const [zUp, setZUp] = useState(false);
  const [blend, setBlend] = useState<ImpostorBlend>("fade");
  const [baked, setBaked] = useState<BakedImpostor | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    newestSiteModels()
      .then(setModels)
      .catch(() => setModelsError(true));
  }, []);

  useEffect(() => () => {
    if (baked) URL.revokeObjectURL(baked.url);
  }, [baked]);

  const pickSiteModel = async (event: ChangeEvent<HTMLSelectElement>) => {
    const model = models.find((item) => item.id === event.target.value);
    if (!model) return;
    setBaked(null);
    setSource({ name: model.name, glbUrl: model.url, glbBytes: null });
    try {
      const response = await fetch(model.url);
      const bytes = (await response.blob()).size;
      setSource((current) => (current?.glbUrl === model.url ? { ...current, glbBytes: bytes } : current));
    } catch {
      // The size is only for the comparison.
    }
  };

  const pickFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBaked(null);
    setStatus("Reading the file…");
    try {
      const glb = /\.glb$/i.test(file.name) ? file : (await finalConvertFileToGLB(file)).blob;
      setSource({ name: file.name, glbUrl: URL.createObjectURL(glb), glbBytes: glb.size });
      setStatus(null);
    } catch {
      setStatus("That file couldn't be read. Try an STL or GLB.");
    }
  };

  const bake = async () => {
    if (!source) return;
    const { grid, tile } = PRESETS.find((item) => item.id === preset) ?? PRESETS[0];
    setBusy(true);
    setStatus(`Rendering ${grid * grid} views…`);
    try {
      const gltf = await new GLTFLoader().loadAsync(source.glbUrl);
      const model = new Group();
      if (zUp) gltf.scene.rotation.x = -Math.PI / 2;
      model.add(gltf.scene);
      const result = await bakeImpostor(model, { grid, tile });
      setBaked(result);
      setStatus(null);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Baking failed.");
    } finally {
      setBusy(false);
    }
  };

  const panel = "rounded-xl border border-br-subtle bg-surface-card";

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <p className="label-mono text-accent">Preview lab</p>
      <h1 className="mt-1 text-3xl font-bold text-txt-primary sm:text-4xl">Impostor viewer</h1>
      <p className="mt-2 max-w-2xl text-txt-secondary">
        The impostor is many pictures of the model from above and around, blended as you turn it. No 3D
        shape is sent to the browser. Compare it with today&apos;s viewer for sharpness, smoothness and
        size. Nothing here is saved.
      </p>

      <div className={`${panel} mt-6 grid gap-4 p-4 sm:p-5 lg:grid-cols-[1fr_1fr_auto] lg:items-end`}>
        <div>
          <label htmlFor="lab-model" className="mb-1 block text-sm font-medium text-txt-primary">
            A model on the site
          </label>
          <select id="lab-model" className="field" defaultValue="" onChange={pickSiteModel}>
            <option value="" disabled>
              {modelsError ? "Couldn't load the models" : models.length ? "Choose a model" : "Loading…"}
            </option>
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="lab-file" className="mb-1 block text-sm font-medium text-txt-primary">
            Or a file from your device (STL or GLB)
          </label>
          <input id="lab-file" type="file" accept=".stl,.glb" className="field py-2" onChange={pickFile} />
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="lab-preset" className="mb-1 block text-sm font-medium text-txt-primary">
              Views
            </label>
            <select
              id="lab-preset"
              className="field"
              value={preset}
              onChange={(event) => setPreset(event.target.value as typeof preset)}
            >
              {PRESETS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="lab-blend" className="mb-1 block text-sm font-medium text-txt-primary">
              Between views
            </label>
            <select
              id="lab-blend"
              className="field"
              value={blend}
              onChange={(event) => setBlend(event.target.value as ImpostorBlend)}
            >
              {BLENDS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 pb-2 text-sm text-txt-secondary">
            <input type="checkbox" checked={zUp} onChange={(event) => setZUp(event.target.checked)} />
            Lying on its side? Stand it up
          </label>
          <Button onClick={bake} isLoading={busy} disabled={!source}>
            Make impostor
          </Button>
        </div>
      </div>

      {status && (
        <p role="status" className="mt-4 text-sm text-txt-secondary">
          {status}
        </p>
      )}

      {source && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className={`${panel} overflow-hidden`} aria-labelledby="lab-impostor">
            <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-br-subtle px-4 py-3">
              <h2 id="lab-impostor" className="font-bold text-txt-primary">
                Impostor <span className="font-normal text-txt-muted">· no 3D data</span>
              </h2>
              {baked && (
                <p className="text-sm text-txt-secondary">
                  {mb(baked.blob.size)} · {baked.grid * baked.grid} views · made in{" "}
                  {(baked.bakeMs / 1000).toFixed(1)} s
                </p>
              )}
            </header>
            {baked ? (
              <ImpostorViewer
                key={baked.url}
                atlasUrl={baked.url}
                grid={baked.grid}
                tile={baked.tile}
                blend={blend}
                className="aspect-square w-full bg-page"
              />
            ) : (
              <div className="grid aspect-square place-items-center bg-page p-6 text-center text-sm text-txt-muted">
                Press &ldquo;Make impostor&rdquo; to render it.
              </div>
            )}
          </section>

          <section className={`${panel} overflow-hidden`} aria-labelledby="lab-today">
            <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-br-subtle px-4 py-3">
              <h2 id="lab-today" className="font-bold text-txt-primary">
                Today&apos;s viewer <span className="font-normal text-txt-muted">· the 3D mesh</span>
              </h2>
              {source.glbBytes !== null && <p className="text-sm text-txt-secondary">{mb(source.glbBytes)}</p>}
            </header>
            {/* <model-viewer> has no JSX type in this project, so it is created by name. */}
            {createElement("model-viewer", {
              key: source.glbUrl,
              src: source.glbUrl,
              alt: `${source.name}, today's 3D viewer`,
              "camera-controls": true,
              "auto-rotate": true,
              "interaction-prompt": "none",
              "environment-image": "neutral",
              crossOrigin: "anonymous",
              // Same "stand it up" turn as the impostor (roll, pitch, yaw).
              orientation: zUp ? "0deg -90deg 0deg" : "0deg 0deg 0deg",
              className: "block aspect-square h-auto w-full bg-page",
            })}
          </section>
        </div>
      )}

      {baked && (
        <details className={`${panel} mt-6 p-4`}>
          <summary className="cursor-pointer text-sm font-medium text-txt-primary">
            What the browser downloads instead of the mesh (the atlas)
          </summary>
          <img src={baked.url} alt="All the impostor's views in one image" className="mt-4 w-full max-w-3xl rounded-lg bg-page" />
        </details>
      )}
    </div>
  );
};
