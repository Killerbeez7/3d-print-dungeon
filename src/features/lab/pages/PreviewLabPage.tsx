import { createElement, useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent, type ReactNode } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { Group, Sphere } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// Registers <model-viewer>; this page is its own lazy chunk.
import "@google/model-viewer";

import { Button } from "@/components";
import { db } from "@/config/firebaseConfig";
import { finalConvertFileToGLB } from "@/features/models/utils/converter";
import { bakeImpostor, type BakedImpostor } from "../impostor/bakeImpostor";
import { ImpostorViewer, type ImpostorBlend } from "../impostor/ImpostorViewer";
import { MeshPreview } from "../mesh/MeshPreview";
import { scrambleGeometry } from "../mesh/scramble";
import { loadSoup, makeLabMesh, soupTriangles, type LabMesh } from "../mesh/sourceMesh";

type Method = "fewer" | "scrambled" | "sharp" | "impostor";

const METHODS: { id: Method; label: string; summary: string }[] = [
  {
    id: "fewer",
    label: "Fewer triangles",
    summary:
      "A simplified copy of the mesh. Real 3D, but the copy anyone can download is the same one. Find the lowest count that still looks good.",
  },
  {
    id: "scrambled",
    label: "Scrambled mesh",
    summary:
      "Today's preview mesh with every point moved by a secret pattern; the viewer's graphics code moves them back on screen. The downloaded file and simple ripping tools get a shapeless cloud. An expert could undo it.",
  },
  {
    id: "sharp",
    label: "Rough + sharp still",
    summary:
      "A rough mesh while you turn; when you stop, a full-detail picture of exactly that angle. On the real site the server would render that picture, so the detailed mesh never leaves it. Here it is rendered in your browser to show how it feels.",
  },
  {
    id: "impostor",
    label: "Impostor (pictures)",
    summary: "Hundreds of pictures from all around; no 3D data at all. Tried before: not sharp enough.",
  },
];

const FEWER_TARGETS = [5_000, 10_000, 25_000, 50_000, 100_000];
const ROUGH_TARGETS = [3_000, 6_000, 12_000];
/** Today's light previews keep this many triangles. */
const TODAY_TRIANGLES = 100_000;

const IMPOSTOR_PRESETS = [
  { id: "20x640", grid: 20, tile: 640, label: "400 views × 640 px" },
  { id: "16x896", grid: 16, tile: 896, label: "256 views × 896 px (sharpest)" },
  { id: "16x640", grid: 16, tile: 640, label: "256 views × 640 px (lightest)" },
] as const;

interface SiteModel {
  id: string;
  name: string;
  url: string;
}

interface Source {
  name: string;
  /** GLB every method starts from (and today's viewer shows). */
  glbUrl: string;
  glbBytes: number | null;
}

const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;
const thousands = (n: number) => n.toLocaleString("en-GB");

async function newestSiteModels(): Promise<SiteModel[]> {
  const snapshot = await getDocs(query(collection(db, "models"), orderBy("createdAt", "desc"), limit(30)));
  return snapshot.docs
    .map((doc) => ({ id: doc.id, name: String(doc.data().name ?? doc.id), url: String(doc.data().convertedFileUrl ?? "") }))
    .filter((model) => model.url);
}

const boundsOf = (mesh: LabMesh) => {
  mesh.geometry.computeBoundingSphere();
  return mesh.geometry.boundingSphere?.clone() ?? new Sphere();
};

/**
 * Lab page (preview branch only): try ways to show a model in 3D without handing out a printable
 * file, next to today's viewer. Nothing is saved anywhere.
 */
export const PreviewLabPage = () => {
  const [models, setModels] = useState<SiteModel[]>([]);
  const [modelsError, setModelsError] = useState(false);
  const [source, setSource] = useState<Source | null>(null);
  const [standUp, setStandUp] = useState(false);
  const [soup, setSoup] = useState<Float32Array | null>(null);
  const [method, setMethod] = useState<Method>("fewer");
  const [status, setStatus] = useState<string | null>(null);
  const tabRefs = useRef<Record<Method, HTMLButtonElement | null>>({ fewer: null, scrambled: null, sharp: null, impostor: null });

  useEffect(() => {
    newestSiteModels()
      .then(setModels)
      .catch(() => setModelsError(true));
  }, []);

  // The model as triangles, whenever the source or its orientation changes.
  useEffect(() => {
    if (!source) return;
    let cancelled = false;
    setSoup(null);
    setStatus("Loading the model…");
    loadSoup(source.glbUrl, standUp)
      .then((result) => {
        if (cancelled) return;
        setSoup(result);
        setStatus(null);
      })
      .catch(() => !cancelled && setStatus("The model couldn't be loaded."));
    return () => {
      cancelled = true;
    };
  }, [source, standUp]);

  const pickSiteModel = async (event: ChangeEvent<HTMLSelectElement>) => {
    const model = models.find((item) => item.id === event.target.value);
    if (!model) return;
    setSource({ name: model.name, glbUrl: model.url, glbBytes: null });
    try {
      const bytes = (await (await fetch(model.url)).blob()).size;
      setSource((current) => (current?.glbUrl === model.url ? { ...current, glbBytes: bytes } : current));
    } catch {
      // The size is only for the comparison.
    }
  };

  const pickFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setStatus("Reading the file…");
    try {
      const glb = /\.glb$/i.test(file.name) ? file : (await finalConvertFileToGLB(file)).blob;
      setSource({ name: file.name, glbUrl: URL.createObjectURL(glb), glbBytes: glb.size });
    } catch {
      setStatus("That file couldn't be read. Try an STL or GLB.");
    }
  };

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const index = METHODS.findIndex((item) => item.id === method);
    const next = METHODS[(index + (event.key === "ArrowRight" ? 1 : METHODS.length - 1)) % METHODS.length].id;
    setMethod(next);
    tabRefs.current[next]?.focus();
  };

  const panel = "rounded-xl border border-br-subtle bg-surface-card";
  const current = METHODS.find((item) => item.id === method)!;

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <p className="label-mono text-accent">Preview lab</p>
      <h1 className="mt-1 text-3xl font-bold text-txt-primary sm:text-4xl">Protecting the 3D preview</h1>
      <p className="mt-2 max-w-2xl text-txt-secondary">
        Ways to show a model in 3D without handing out a printable file, next to today&apos;s viewer. Each method
        shows what the browser downloads and what someone ripping it would get. Nothing here is saved.
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
        <label className="flex items-center gap-2 pb-2 text-sm text-txt-secondary">
          <input type="checkbox" checked={standUp} onChange={(event) => setStandUp(event.target.checked)} />
          Lying on its side? Stand it up
        </label>
      </div>

      {status && (
        <p role="status" className="mt-4 text-sm text-txt-secondary">
          {status}
        </p>
      )}

      <div role="tablist" aria-label="Preview methods" className="mt-6 flex flex-wrap gap-2">
        {METHODS.map((item) => (
          <button
            key={item.id}
            ref={(node) => {
              tabRefs.current[item.id] = node;
            }}
            id={`lab-tab-${item.id}`}
            type="button"
            role="tab"
            aria-selected={method === item.id}
            aria-controls="lab-method"
            tabIndex={method === item.id ? 0 : -1}
            onClick={() => setMethod(item.id)}
            onKeyDown={onTabKey}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${
              method === item.id
                ? "border-accent bg-accent text-txt-inverse"
                : "border-br-subtle bg-surface-card text-txt-secondary hover:text-txt-primary"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <p className="mt-3 max-w-3xl text-sm text-txt-secondary">{current.summary}</p>

      {source && (
        <div id="lab-method" role="tabpanel" aria-labelledby={`lab-tab-${method}`} className="mt-6 grid gap-6 lg:grid-cols-2">
          {soup ? (
            <>
              {method === "fewer" && <FewerMethod soup={soup} />}
              {method === "scrambled" && <ScrambledMethod soup={soup} />}
              {method === "sharp" && <SharpMethod soup={soup} />}
              {method === "impostor" && <ImpostorMethod glbUrl={source.glbUrl} standUp={standUp} />}
            </>
          ) : (
            <Card title="Loading…">
              <div className="aspect-square w-full bg-page" />
            </Card>
          )}

          <Card title="Today's viewer" note="the 3D mesh" stats={source.glbBytes !== null ? mb(source.glbBytes) : undefined}>
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
              // Same "stand it up" turn as the other methods (roll, pitch, yaw).
              orientation: standUp ? "0deg -90deg 0deg" : "0deg 0deg 0deg",
              className: "block aspect-square h-auto w-full bg-page",
            })}
          </Card>
        </div>
      )}
    </div>
  );
};

const Card = ({ title, note, stats, children }: { title: string; note?: string; stats?: ReactNode; children: ReactNode }) => (
  <section className="overflow-hidden rounded-xl border border-br-subtle bg-surface-card">
    <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-br-subtle px-4 py-3">
      <h2 className="font-bold text-txt-primary">
        {title} {note && <span className="font-normal text-txt-muted">· {note}</span>}
      </h2>
      {stats && <p className="text-sm text-txt-secondary">{stats}</p>}
    </header>
    {children}
  </section>
);

const Choice = <T extends string | number>({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) => (
  <div>
    <label htmlFor={id} className="mb-1 block text-sm font-medium text-txt-primary">
      {label}
    </label>
    <select
      id={id}
      className="field"
      value={String(value)}
      onChange={(event) => onChange(options.find((option) => String(option.value) === event.target.value)!.value)}
    >
      {options.map((option) => (
        <option key={String(option.value)} value={String(option.value)}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

/** Builds (and remembers) the model reduced to a triangle count. */
function useLabMesh(soup: Float32Array, target: number): LabMesh | null {
  const cache = useRef(new Map<number, LabMesh>());
  const [mesh, setMesh] = useState<LabMesh | null>(null);
  useEffect(() => {
    cache.current.clear();
  }, [soup]);
  useEffect(() => {
    const hit = cache.current.get(target);
    if (hit) return setMesh(hit);
    let cancelled = false;
    setMesh(null);
    makeLabMesh(soup, target).then((result) => {
      cache.current.set(target, result);
      if (!cancelled) setMesh(result);
    });
    return () => {
      cancelled = true;
    };
  }, [soup, target]);
  return mesh;
}

const meshStats = (mesh: LabMesh) => `${mb(mesh.bytes)} · ${thousands(mesh.triangles)} triangles`;

const FewerMethod = ({ soup }: { soup: Float32Array }) => {
  const [target, setTarget] = useState(25_000);
  const mesh = useLabMesh(soup, target);
  const bounds = useMemo(() => (mesh ? boundsOf(mesh) : null), [mesh]);
  return (
    <div className="space-y-4">
      <Card title="Fewer triangles" note="what everyone downloads" stats={mesh ? meshStats(mesh) : "Simplifying…"}>
        {mesh && bounds ? (
          <MeshPreview geometry={mesh.geometry} bounds={bounds} label="Simplified 3D preview" className="aspect-square w-full bg-page" />
        ) : (
          <div className="aspect-square w-full bg-page" />
        )}
      </Card>
      <Choice
        id="lab-fewer"
        label={`Triangles (the model has ${thousands(soupTriangles(soup))}; today's preview keeps up to ${thousands(TODAY_TRIANGLES)})`}
        value={target}
        options={FEWER_TARGETS.map((value) => ({ value, label: thousands(value) }))}
        onChange={setTarget}
      />
      <p className="text-sm text-txt-secondary">
        What a ripper gets: exactly this mesh. At miniature size a printer can&apos;t show much more than about
        25,000-50,000 triangles of detail, so a count that looks good here also prints well.
      </p>
    </div>
  );
};

const ScrambledMethod = ({ soup }: { soup: Float32Array }) => {
  const mesh = useLabMesh(soup, TODAY_TRIANGLES);
  const scrambled = useMemo(() => {
    if (!mesh) return null;
    const bounds = boundsOf(mesh);
    // A fresh key per model; the amount moves points across the whole model.
    const scramble = { key: (Math.random() * 0xffffffff) >>> 0, amount: bounds.radius * 0.9 };
    return {
      bounds,
      // The cloud spreads far beyond the model; frame it wider.
      rippedBounds: new Sphere(bounds.center.clone(), bounds.radius * 2),
      scramble,
      geometry: scrambleGeometry(mesh.geometry, scramble.key, scramble.amount),
    };
  }, [mesh]);
  return (
    <div className="space-y-4">
      <Card title="Scrambled mesh" note="decoded on screen" stats={mesh ? meshStats(mesh) : "Preparing…"}>
        {scrambled ? (
          <MeshPreview
            geometry={scrambled.geometry}
            bounds={scrambled.bounds}
            scramble={scrambled.scramble}
            label="Scrambled mesh, decoded by the viewer"
            className="aspect-square w-full bg-page"
          />
        ) : (
          <div className="aspect-square w-full bg-page" />
        )}
      </Card>
      <Card title="What a ripper gets" note="the downloaded file, opened in any 3D program">
        {scrambled ? (
          <MeshPreview
            geometry={scrambled.geometry}
            bounds={scrambled.rippedBounds}
            asPoints
            autoRotate={false}
            label="The scrambled file without decoding: a shapeless cloud"
            className="aspect-[4/3] w-full bg-page"
          />
        ) : (
          <div className="aspect-[4/3] w-full bg-page" />
        )}
      </Card>
    </div>
  );
};

const SharpMethod = ({ soup }: { soup: Float32Array }) => {
  const [target, setTarget] = useState(6_000);
  const rough = useLabMesh(soup, target);
  const full = useLabMesh(soup, soupTriangles(soup));
  const bounds = useMemo(() => (full ? boundsOf(full) : null), [full]);
  return (
    <div className="space-y-4">
      <Card title="Rough + sharp still" note="stop turning to see it" stats={rough ? meshStats(rough) : "Simplifying…"}>
        {rough && full && bounds ? (
          <MeshPreview
            geometry={rough.geometry}
            bounds={bounds}
            sharpGeometry={full.geometry}
            label="Rough mesh while turning, sharp picture when still"
            className="aspect-square w-full bg-page"
          />
        ) : (
          <div className="aspect-square w-full bg-page" />
        )}
      </Card>
      <Choice
        id="lab-rough"
        label="Triangles in the rough mesh"
        value={target}
        options={ROUGH_TARGETS.map((value) => ({ value, label: thousands(value) }))}
        onChange={setTarget}
      />
      <p className="text-sm text-txt-secondary">
        What a ripper gets: the rough mesh (and pictures, one per stop, about 100-200 KB each on the real site). The
        sharp picture appears about 0.35 s after you stop, like a server response would.
      </p>
    </div>
  );
};

const ImpostorMethod = ({ glbUrl, standUp }: { glbUrl: string; standUp: boolean }) => {
  const [preset, setPreset] = useState<(typeof IMPOSTOR_PRESETS)[number]["id"]>("20x640");
  const [blend, setBlend] = useState<ImpostorBlend>("fade");
  const [baked, setBaked] = useState<BakedImpostor | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => setBaked(null), [glbUrl, standUp]);

  const bake = async () => {
    const { grid, tile } = IMPOSTOR_PRESETS.find((item) => item.id === preset) ?? IMPOSTOR_PRESETS[0];
    setBaked(null);
    setBusy(true);
    setProgress(`Rendering ${grid * grid} views…`);
    try {
      const gltf = await new GLTFLoader().loadAsync(glbUrl);
      const model = new Group();
      if (standUp) gltf.scene.rotation.x = -Math.PI / 2;
      model.add(gltf.scene);
      const result = await bakeImpostor(model, {
        grid,
        tile,
        onProgress: (done, total) => {
          if (done % 20 === 0 || done === total) setProgress(`Rendering views: ${done} of ${total}…`);
        },
      });
      setBaked(result);
      setProgress(null);
    } catch (error) {
      setProgress(error instanceof Error ? error.message : "Rendering failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card
        title="Impostor"
        note="no 3D data"
        stats={baked ? `${mb(baked.bytes)} · ${baked.grid * baked.grid} views · ${baked.tile} px` : undefined}
      >
        {baked ? (
          <ImpostorViewer frames={baked.frames} grid={baked.grid} tile={baked.tile} blend={blend} className="aspect-square w-full bg-page" />
        ) : (
          <div className="grid aspect-square place-items-center bg-page p-6 text-center text-sm text-txt-muted">
            {progress ?? "Press “Make impostor” to render it."}
          </div>
        )}
      </Card>
      <div className="flex flex-wrap items-end gap-3">
        <Choice
          id="lab-impostor-preset"
          label="Views"
          value={preset}
          options={IMPOSTOR_PRESETS.map((item) => ({ value: item.id, label: item.label }))}
          onChange={setPreset}
        />
        <Choice
          id="lab-impostor-blend"
          label="Between views"
          value={blend}
          options={[
            { value: "fade" as const, label: "Quick fade" },
            { value: "snap" as const, label: "No fade" },
          ]}
          onChange={setBlend}
        />
        <Button onClick={bake} isLoading={busy}>
          Make impostor
        </Button>
      </div>
    </div>
  );
};
