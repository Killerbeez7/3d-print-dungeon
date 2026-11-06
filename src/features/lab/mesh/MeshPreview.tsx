import { useEffect, useRef, useState } from "react";
import {
  Mesh,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  Sphere,
  Vector3,
  WebGLRenderer,
  type BufferGeometry,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { unscrambleInShader } from "./scramble";
import { setUpStudio, studioMaterial } from "./studio";

interface MeshPreviewProps {
  /** The mesh the browser receives (scrambled, if `scramble` is set). */
  geometry: BufferGeometry;
  /** The real shape's bounds, for framing (a scrambled geometry's own bounds are meaningless). */
  bounds: Sphere;
  /** Undo a scramble in the vertex shader. Leave out to draw the geometry as it is. */
  scramble?: { key: number; amount: number };
  /**
   * A full-detail mesh for "sharp when you stop": while you drag you see `geometry`; when you
   * let go, a picture of this one at exactly that angle appears. On the real site that picture
   * would be rendered by the server, so this mesh would never reach the browser.
   */
  sharpGeometry?: BufferGeometry;
  /** Delay before the sharp picture shows, standing in for the server's response time. */
  sharpDelayMs?: number;
  autoRotate?: boolean;
  /** Draw only the vertices, as dots (for showing a scrambled file cheaply). */
  asPoints?: boolean;
  className?: string;
  label: string;
}

/** Real 3D view of a mesh with the lab's lighting: drag to turn, scroll or pinch to zoom. */
export const MeshPreview = ({
  geometry,
  bounds,
  scramble,
  sharpGeometry,
  sharpDelayMs = 350,
  autoRotate = true,
  asPoints = false,
  className = "",
  label,
}: MeshPreviewProps) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const [sharpShown, setSharpShown] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const center = bounds.center.clone();
    const radius = bounds.radius;

    const makeRenderer = () => {
      const renderer = new WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      const canvas = renderer.domElement;
      Object.assign(canvas.style, { position: "absolute", inset: "0", width: "100%", height: "100%", display: "block" });
      host.appendChild(canvas);
      return renderer;
    };

    const renderer = makeRenderer();
    renderer.domElement.style.touchAction = "none";
    const scene = new Scene();
    const tearDownStudio = setUpStudio(renderer, scene, center, radius);
    const material = asPoints ? new PointsMaterial({ color: "#c9c6d4", size: 1.5, sizeAttenuation: false }) : studioMaterial();
    if (scramble) unscrambleInShader(material, scramble.key, scramble.amount);
    const mesh = asPoints ? new Points(geometry, material) : new Mesh(geometry, material);
    // A scrambled mesh's own bounds are far off; never cull it.
    mesh.frustumCulled = false;
    scene.add(mesh);

    const camera = new PerspectiveCamera(30, 1, radius * 0.05, radius * 20);
    const distance = radius / Math.sin((30 * Math.PI) / 360) * 1.05;
    camera.position.copy(center).add(new Vector3(0.55, 0.35, 1).normalize().multiplyScalar(distance));
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(center);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = distance * 0.35;
    controls.maxDistance = distance * 2;
    controls.autoRotate = autoRotate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    controls.autoRotateSpeed = 1.5;

    // ---- sharp still (a second canvas on top, shown only while nothing moves)
    let sharp: { renderer: WebGLRenderer; scene: Scene; teardown: () => void; material: ReturnType<typeof studioMaterial> } | null =
      null;
    if (sharpGeometry) {
      const sharpRenderer = makeRenderer();
      const canvas = sharpRenderer.domElement;
      canvas.style.pointerEvents = "none";
      canvas.style.opacity = "0";
      canvas.style.transition = "opacity 120ms ease-out";
      const sharpScene = new Scene();
      const sharpMaterial = studioMaterial();
      sharpScene.add(new Mesh(sharpGeometry, sharpMaterial));
      sharp = { renderer: sharpRenderer, scene: sharpScene, teardown: setUpStudio(sharpRenderer, sharpScene, center, radius), material: sharpMaterial };
    }
    let sharpTimer = 0;
    let moving = controls.autoRotate;
    const hideSharp = () => {
      window.clearTimeout(sharpTimer);
      if (sharp) sharp.renderer.domElement.style.opacity = "0";
      setSharpShown(false);
    };
    const scheduleSharp = () => {
      if (!sharp) return;
      window.clearTimeout(sharpTimer);
      sharpTimer = window.setTimeout(() => {
        if (!sharp || moving) return;
        sharp.renderer.render(sharp.scene, camera);
        sharp.renderer.domElement.style.opacity = "1";
        setSharpShown(true);
      }, sharpDelayMs);
    };

    // Draws only while something moves (turning, damping, auto-rotate), then rests.
    let frame = 0;
    let settleFrames = 0;
    let needsRender = true;
    const loop = () => {
      frame = 0;
      const changed = controls.update();
      if (changed || needsRender) renderer.render(scene, camera);
      needsRender = false;
      if (changed || controls.autoRotate) {
        settleFrames = 0;
      } else if (++settleFrames >= 8) {
        // Damping has settled: the view is still.
        if (moving) {
          moving = false;
          scheduleSharp();
        }
        return;
      }
      // controls.update() may already have asked for the next frame (via wake); never start a
      // second loop.
      if (!frame) frame = requestAnimationFrame(loop);
    };
    const wake = () => {
      needsRender = true;
      settleFrames = 0;
      if (!frame) frame = requestAnimationFrame(loop);
    };
    const onStart = () => {
      controls.autoRotate = false;
      moving = true;
      hideSharp();
      wake();
    };
    controls.addEventListener("start", onStart);
    const onChange = () => {
      if (!moving) {
        moving = true;
        hideSharp();
      }
      wake();
    };
    controls.addEventListener("change", onChange);

    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      const w = Math.max(width, 1);
      const h = Math.max(height, 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      sharp?.renderer.setSize(w, h, false);
      hideSharp();
      moving = true;
      wake();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(sharpTimer);
      observer.disconnect();
      controls.removeEventListener("start", onStart);
      controls.removeEventListener("change", onChange);
      controls.dispose();
      tearDownStudio();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      if (sharp) {
        sharp.teardown();
        sharp.material.dispose();
        sharp.renderer.dispose();
        sharp.renderer.domElement.remove();
      }
    };
  }, [geometry, bounds, scramble, sharpGeometry, sharpDelayMs, autoRotate, asPoints]);

  return (
    <div ref={hostRef} className={`relative overflow-hidden ${className}`} role="img" aria-label={label}>
      {sharpGeometry && (
        <span
          className={`label-mono pointer-events-none absolute bottom-2 left-2 rounded bg-surface-card/80 px-2 py-1 text-txt-secondary transition-opacity ${
            sharpShown ? "opacity-100" : "opacity-0"
          }`}
        >
          Sharp picture (from the server)
        </span>
      )}
    </div>
  );
};
