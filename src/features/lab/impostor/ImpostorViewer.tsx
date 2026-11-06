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

import { frameBasis, orbitDirection } from "./impostorMath";

const VERTEX = /* glsl */ `
varying vec2 vNdc;
void main() {
  vNdc = position.xy;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// Mirrors impostorMath.ts. Each pixel is a point on the plane through the model's centre,
// facing the viewer; it is projected into the 3 frames nearest the view direction and their
// colours are blended by how close each frame is.
const FRAGMENT = /* glsl */ `
uniform sampler2D atlas;
uniform float grid;
uniform float tile;
uniform vec3 viewDir;
uniform vec3 viewRight;
uniform vec3 viewUp;
uniform vec2 halfExtent;
uniform float sharpness;
varying vec2 vNdc;

vec3 decodeDir(vec2 uv) {
  vec2 f = uv * 2.0 - 1.0;
  vec2 p = vec2(f.x + f.y, f.x - f.y) * 0.5;
  float y = max(1.0 - abs(p.x) - abs(p.y), 0.0);
  return normalize(vec3(p.x, y, p.y));
}

vec2 encodeDir(vec3 d) {
  d.y = max(d.y, 0.0);
  vec2 p = d.xz / (abs(d.x) + d.y + abs(d.z));
  return vec2(p.x + p.y, p.x - p.y) * 0.5 + 0.5;
}

vec4 frameSample(vec2 cell, vec3 P) {
  cell = clamp(cell, 0.0, grid - 1.0);
  vec3 d = decodeDir(cell / (grid - 1.0));
  vec3 r = cross(vec3(0.0, 1.0, 0.0), d);
  r = dot(r, r) < 1e-8 ? vec3(1.0, 0.0, 0.0) : normalize(r);
  vec3 u = cross(d, r);
  vec2 t = vec2(dot(P, r), dot(P, u)) * 0.5 + 0.5;
  if (t.x < 0.0 || t.y < 0.0 || t.x > 1.0 || t.y > 1.0) return vec4(0.0);
  float pad = 0.5 / tile;
  t = clamp(t, pad, 1.0 - pad);
  return texture2D(atlas, (cell + vec2(t.x, 1.0 - t.y)) / grid);
}

void main() {
  vec3 P = viewRight * vNdc.x * halfExtent.x + viewUp * vNdc.y * halfExtent.y;
  vec2 g = encodeDir(viewDir) * (grid - 1.0);
  vec2 b = floor(g);
  vec2 f = g - b;
  // The 3 nearest frames and how close each is; raising the weights to a power and
  // renormalising favours the nearest one (sharpness 1 = even blend, high = snap to nearest).
  vec2 c0, c1, c2;
  vec3 w;
  if (f.x + f.y < 1.0) {
    c0 = b; c1 = b + vec2(1.0, 0.0); c2 = b + vec2(0.0, 1.0);
    w = vec3(1.0 - f.x - f.y, f.x, f.y);
  } else {
    c0 = b + vec2(1.0, 1.0); c1 = b + vec2(0.0, 1.0); c2 = b + vec2(1.0, 0.0);
    w = vec3(f.x + f.y - 1.0, 1.0 - f.x, 1.0 - f.y);
  }
  // Relative to the strongest weight first, so high powers never underflow to zero.
  w = max(w, vec3(0.0));
  w = pow(w / max(max(w.x, w.y), max(w.z, 1e-5)), vec3(sharpness));
  w /= w.x + w.y + w.z;
  // Snap: only the nearest view, no blending at all.
  if (sharpness >= 30.0) w = w.x >= w.y && w.x >= w.z ? vec3(1.0, 0.0, 0.0) : (w.y >= w.z ? vec3(0.0, 1.0, 0.0) : vec3(0.0, 0.0, 1.0));
  vec4 c = frameSample(c0, P) * w.x + frameSample(c1, P) * w.y + frameSample(c2, P) * w.z;
  if (c.a < 0.004) discard;
  gl_FragColor = vec4(c.rgb / c.a, c.a);
}
`;

const MIN_PITCH = 0;
const MAX_PITCH = (80 * Math.PI) / 180;
const MIN_ZOOM = 0.8;
const MAX_ZOOM = 3;

interface ImpostorViewerProps {
  atlasUrl: string;
  grid: number;
  tile: number;
  /** 1 blends the 3 nearest views evenly (smooth, some ghosting); higher snaps to the nearest. */
  sharpness?: number;
  className?: string;
}

/**
 * Shows a baked impostor: drag to turn it (any angle on the upper half), wheel or pinch to zoom.
 * It turns slowly on its own until touched. No mesh is ever loaded: only the atlas image.
 */
export const ImpostorViewer = ({ atlasUrl, grid, tile, sharpness = 1, className = "" }: ImpostorViewerProps) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const sharpnessRef = useRef(sharpness);
  const redrawRef = useRef<() => void>(() => {});

  useEffect(() => {
    sharpnessRef.current = sharpness;
    redrawRef.current();
  }, [sharpness]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const renderer = new WebGLRenderer({ alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    host.appendChild(renderer.domElement);

    const texture = new Texture();
    texture.flipY = false;
    texture.premultiplyAlpha = true;
    texture.colorSpace = NoColorSpace;
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.generateMipmaps = false;

    const material = new ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      transparent: true,
      depthTest: false,
      uniforms: {
        atlas: { value: texture },
        grid: { value: grid },
        tile: { value: tile },
        viewDir: { value: new Vector3() },
        viewRight: { value: new Vector3() },
        viewUp: { value: new Vector3() },
        halfExtent: { value: new Vector2(1, 1) },
        sharpness: { value: sharpnessRef.current },
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

    const view = { yaw: 0.6, pitch: 0.35, zoom: 1, spinning: !window.matchMedia("(prefers-reduced-motion: reduce)").matches };
    let frame = 0;
    let ready = false;

    const draw = () => {
      frame = 0;
      if (!ready) return;
      if (view.spinning) view.yaw += 0.006;
      const direction = orbitDirection(view.yaw, view.pitch);
      const { right, up } = frameBasis(direction);
      const { width, height } = host.getBoundingClientRect();
      const aspect = width / Math.max(height, 1);
      const extent = 1.04 / view.zoom;
      material.uniforms.viewDir.value.set(...direction);
      material.uniforms.viewRight.value.set(...right);
      material.uniforms.viewUp.value.set(...up);
      material.uniforms.halfExtent.value.set(extent * Math.max(aspect, 1), extent * Math.max(1 / aspect, 1));
      material.uniforms.sharpness.value = sharpnessRef.current;
      renderer.render(scene, camera);
      if (view.spinning) frame = requestAnimationFrame(draw);
    };
    const requestDraw = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };

    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      renderer.setSize(Math.max(width, 1), Math.max(height, 1), false);
      requestDraw();
    };
    redrawRef.current = requestDraw;
    const observer = new ResizeObserver(resize);
    observer.observe(host);

    const image = new Image();
    image.onload = () => {
      texture.image = image;
      texture.needsUpdate = true;
      ready = true;
      resize();
    };
    image.src = atlasUrl;

    // Drag to turn, two fingers or the wheel to zoom.
    const pointers = new Map<number, { x: number; y: number }>();
    let pinch = 0;
    const onDown = (event: PointerEvent) => {
      view.spinning = false;
      renderer.domElement.setPointerCapture(event.pointerId);
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
    const canvas = renderer.domElement;
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("wheel", onWheel);
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, [atlasUrl, grid, tile]);

  return (
    <div
      ref={hostRef}
      className={`relative ${className}`}
      role="img"
      aria-label="3D preview: drag to turn, pinch or scroll to zoom"
    />
  );
};
