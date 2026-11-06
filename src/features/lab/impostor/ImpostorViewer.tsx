import { useEffect, useRef } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  Camera,
  LinearFilter,
  Mesh,
  NoColorSpace,
  Scene,
  ShaderMaterial,
  Texture,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";

import { encodeDirection, frameBasis, orbitDirection } from "./impostorMath";

/** How the viewer moves from one pre-rendered view to the next. */
export type ImpostorBlend = "fade" | "snap";

/** Cross-fade time when the nearest view changes. */
const FADE_MS = 90;
/** Decoded views kept in memory (each is tile² × 4 bytes, ~1.6 MB at 640 px). */
const CACHE_SIZE = 40;
/** Views around the current one decoded ahead of time, in grid steps. */
const PREFETCH_RADIUS = 2;

const VERTEX = /* glsl */ `
varying vec2 vNdc;
void main() {
  vNdc = position.xy;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// Mirrors impostorMath.ts. Each pixel is a point on the plane through the model's centre,
// facing the viewer; it is projected into the frame of each of the two views being shown.
const FRAGMENT = /* glsl */ `
uniform sampler2D frameA;
uniform sampler2D frameB;
uniform vec2 cellA;
uniform vec2 cellB;
uniform float fade;
uniform float grid;
uniform float tile;
uniform vec3 viewRight;
uniform vec3 viewUp;
uniform vec2 halfExtent;
varying vec2 vNdc;

vec3 decodeDir(vec2 uv) {
  vec2 f = uv * 2.0 - 1.0;
  vec2 p = vec2(f.x + f.y, f.x - f.y) * 0.5;
  float y = max(1.0 - abs(p.x) - abs(p.y), 0.0);
  return normalize(vec3(p.x, y, p.y));
}

vec4 sampleFrame(sampler2D frame, vec2 cell, vec3 P) {
  vec3 d = decodeDir(cell / (grid - 1.0));
  vec3 r = cross(vec3(0.0, 1.0, 0.0), d);
  r = dot(r, r) < 1e-8 ? vec3(1.0, 0.0, 0.0) : normalize(r);
  vec3 u = cross(d, r);
  vec2 t = vec2(dot(P, r), dot(P, u)) * 0.5 + 0.5;
  if (t.x < 0.0 || t.y < 0.0 || t.x > 1.0 || t.y > 1.0) return vec4(0.0);
  float pad = 0.5 / tile;
  t = clamp(t, pad, 1.0 - pad);
  return texture2D(frame, vec2(t.x, 1.0 - t.y));
}

void main() {
  vec3 P = viewRight * vNdc.x * halfExtent.x + viewUp * vNdc.y * halfExtent.y;
  vec4 c = sampleFrame(frameA, cellA, P) * (1.0 - fade) + sampleFrame(frameB, cellB, P) * fade;
  if (c.a < 0.004) discard;
  gl_FragColor = vec4(c.rgb / c.a, c.a);
}
`;

const MIN_PITCH = 0;
const MAX_PITCH = (82 * Math.PI) / 180;
const MIN_ZOOM = 0.8;
const MAX_ZOOM = 3;

interface ImpostorViewerProps {
  /** One WebP per view, in grid order (row j, column i → index j × grid + i). */
  frames: Blob[];
  grid: number;
  tile: number;
  /** fade: the nearest view, cross-fading quickly to the next as you turn; snap: no fade. */
  blend?: ImpostorBlend;
  className?: string;
}

/**
 * Shows a baked impostor: drag to turn it (any angle on the upper half), wheel or pinch to zoom.
 * Only the views near the current angle are decoded, so hundreds of views stay light on memory.
 * No mesh is ever loaded.
 */
export const ImpostorViewer = ({ frames, grid, tile, blend = "fade", className = "" }: ImpostorViewerProps) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const blendRef = useRef(blend);
  const redrawRef = useRef<() => void>(() => {});

  useEffect(() => {
    blendRef.current = blend;
    redrawRef.current();
  }, [blend]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const renderer = new WebGLRenderer({ alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.style.touchAction = "none";
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    host.appendChild(canvas);

    const makeTexture = () => {
      const texture = new Texture();
      // Bitmaps are decoded already premultiplied and top-down (see decode()).
      texture.flipY = false;
      texture.colorSpace = NoColorSpace;
      texture.minFilter = LinearFilter;
      texture.magFilter = LinearFilter;
      texture.generateMipmaps = false;
      return texture;
    };
    const textureA = makeTexture();
    const textureB = makeTexture();

    const material = new ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      transparent: true,
      depthTest: false,
      uniforms: {
        frameA: { value: textureA },
        frameB: { value: textureB },
        cellA: { value: new Vector2() },
        cellB: { value: new Vector2() },
        fade: { value: 1 },
        grid: { value: grid },
        tile: { value: tile },
        viewRight: { value: new Vector3() },
        viewUp: { value: new Vector3() },
        halfExtent: { value: new Vector2(1, 1) },
      },
    });
    // One triangle that covers the whole canvas.
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
    const quad = new Mesh(geometry, material);
    quad.frustumCulled = false;
    const scene = new Scene();
    scene.add(quad);
    const camera = new Camera();

    let disposed = false;
    let frame = 0;
    // Views on screen: B is the current one, A the one fading out (indices into frames).
    let shownA = -1;
    let shownB = -1;
    let fadeStart = 0;

    const requestDraw = () => {
      if (!frame && !disposed) frame = requestAnimationFrame(draw);
    };
    redrawRef.current = requestDraw;

    // ---- decoded views: a small most-recently-used cache, filled around the current angle
    const decoded = new Map<number, ImageBitmap>();
    const pending = new Set<number>();
    const indexOf = (i: number, j: number) => j * grid + i;
    const touch = (index: number) => {
      const bitmap = decoded.get(index);
      if (!bitmap) return;
      decoded.delete(index);
      decoded.set(index, bitmap);
    };
    const evict = () => {
      for (const [index, bitmap] of decoded) {
        if (decoded.size <= CACHE_SIZE) break;
        if (index === shownA || index === shownB) continue;
        decoded.delete(index);
        bitmap.close();
      }
    };
    const decode = (index: number) => {
      if (decoded.has(index)) return touch(index);
      if (pending.has(index)) return;
      pending.add(index);
      createImageBitmap(frames[index], { premultiplyAlpha: "premultiply", colorSpaceConversion: "none" })
        .then((bitmap) => {
          pending.delete(index);
          if (disposed) return bitmap.close();
          decoded.set(index, bitmap);
          evict();
          requestDraw();
        })
        .catch(() => pending.delete(index));
    };
    const prefetchAround = (i: number, j: number) => {
      decode(indexOf(i, j));
      for (let dj = -PREFETCH_RADIUS; dj <= PREFETCH_RADIUS; dj++) {
        for (let di = -PREFETCH_RADIUS; di <= PREFETCH_RADIUS; di++) {
          const ni = i + di;
          const nj = j + dj;
          if (ni >= 0 && nj >= 0 && ni < grid && nj < grid) decode(indexOf(ni, nj));
        }
      }
    };

    const view = {
      yaw: 0.6,
      pitch: 0.35,
      zoom: 1,
      spinning: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    };

    const upload = (texture: Texture, index: number) => {
      texture.image = decoded.get(index)!;
      texture.needsUpdate = true;
    };

    function draw() {
      frame = 0;
      if (view.spinning) view.yaw += 0.006;
      const direction = orbitDirection(view.yaw, view.pitch);
      const { right, up } = frameBasis(direction);

      const [u, v] = encodeDirection(direction);
      const ci = Math.round(u * (grid - 1));
      const cj = Math.round(v * (grid - 1));
      const nearest = indexOf(ci, cj);
      prefetchAround(ci, cj);

      // Show the nearest view once it is decoded; until then keep what is on screen.
      if (nearest !== shownB && decoded.has(nearest)) {
        shownA = shownB < 0 ? nearest : shownB;
        upload(textureA, shownA);
        shownB = nearest;
        upload(textureB, nearest);
        fadeStart = performance.now();
      }

      let fading = false;
      if (shownB >= 0) {
        const fade =
          blendRef.current === "snap" || shownA === shownB ? 1 : Math.min(1, (performance.now() - fadeStart) / FADE_MS);
        fading = fade < 1;
        material.uniforms.fade.value = fade;
        material.uniforms.cellA.value.set(shownA % grid, Math.floor(shownA / grid));
        material.uniforms.cellB.value.set(shownB % grid, Math.floor(shownB / grid));

        const { width, height } = host!.getBoundingClientRect();
        const aspect = width / Math.max(height, 1);
        const extent = 1.04 / view.zoom;
        material.uniforms.viewRight.value.set(...right);
        material.uniforms.viewUp.value.set(...up);
        material.uniforms.halfExtent.value.set(extent * Math.max(aspect, 1), extent * Math.max(1 / aspect, 1));
        renderer.render(scene, camera);
      }
      if (view.spinning || fading) frame = requestAnimationFrame(draw);
    }

    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      renderer.setSize(Math.max(width, 1), Math.max(height, 1), false);
      requestDraw();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);

    // Drag to turn, two fingers or the wheel to zoom.
    const pointers = new Map<number, { x: number; y: number }>();
    let pinch = 0;
    const onDown = (event: PointerEvent) => {
      view.spinning = false;
      canvas.setPointerCapture(event.pointerId);
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    };
    const onMove = (event: PointerEvent) => {
      const last = pointers.get(event.pointerId);
      if (!last) return;
      if (pointers.size === 1) {
        view.yaw -= (event.clientX - last.x) * 0.008;
        view.pitch = Math.min(MAX_PITCH, Math.max(MIN_PITCH, view.pitch + (event.clientY - last.y) * 0.008));
      }
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch) view.zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, view.zoom * (distance / pinch)));
        pinch = distance;
      }
      requestDraw();
    };
    const onUp = (event: PointerEvent) => {
      pointers.delete(event.pointerId);
      pinch = 0;
    };
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      view.spinning = false;
      view.zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, view.zoom * Math.exp(-event.deltaY * 0.0015)));
      requestDraw();
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("wheel", onWheel);
      for (const bitmap of decoded.values()) bitmap.close();
      decoded.clear();
      geometry.dispose();
      material.dispose();
      textureA.dispose();
      textureB.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, [frames, grid, tile]);

  return (
    <div
      ref={hostRef}
      className={`relative ${className}`}
      role="img"
      aria-label="3D preview: drag to turn, pinch or scroll to zoom"
    />
  );
};
