import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { DIE_FACES, type DieFace } from "./dieFaces";

// The logo die: a CSS 3D cube seen at the isometric angle, with a dungeon symbol on each side.
// It rolls by changing the cube's transform; the browser animates between the two poses.

const SIDES: ReadonlyArray<readonly [string, DieFace]> = [
  ["front", "gate"],
  ["right", "maze"],
  ["top", "eye"],
  ["back", "lock"],
  ["left", "bricks"],
  ["bottom", "fire"],
];

// Six rolls alternating about two horizontal axes; after the sixth the die is back at rest,
// and every side has been on show.
const POSES = [
  "rotateX(0deg)",
  "rotateX(-90deg)",
  "rotateZ(90deg) rotateX(-90deg)",
  "rotateX(-90deg) rotateZ(90deg) rotateX(-90deg)",
  "rotateZ(90deg) rotateX(-90deg) rotateZ(90deg) rotateX(-90deg)",
  "rotateX(-90deg) rotateZ(90deg) rotateX(-90deg) rotateZ(90deg) rotateX(-90deg)",
];

const ROLL_MS = 700;
const IDLE_EVERY_MS = 30_000;
const LOADER_EVERY_MS = 800;

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

interface DieProps {
  /** Edge length of the cube in px; the drawn die is about 1.63 times as tall. */
  edge: number;
  /** still: rolls only when pointed at (if rollOnHover); idle: also every 30s; loader: keeps rolling. */
  mode?: "still" | "idle" | "loader";
  rollOnHover?: boolean;
  className?: string;
}

export const Die = ({ edge, mode = "still", rollOnHover = false, className = "" }: DieProps) => {
  const [pose, setPose] = useState(0);
  const hopRef = useRef<HTMLSpanElement>(null);
  const busy = useRef(false);

  const roll = useCallback(() => {
    if (busy.current || reducedMotion()) return;
    busy.current = true;
    setPose((p) => (p + 1) % POSES.length);
    hopRef.current?.animate?.(
      [
        { transform: "translateY(0)", easing: "cubic-bezier(.2,.7,.4,1)" },
        { transform: `translateY(${-edge * 0.16}px)`, offset: 0.45, easing: "cubic-bezier(.6,0,.8,.3)" },
        { transform: "translateY(0)" },
      ],
      { duration: ROLL_MS },
    );
    window.setTimeout(() => {
      busy.current = false;
    }, ROLL_MS + 50);
  }, [edge]);

  useEffect(() => {
    if (mode === "still" || reducedMotion()) return;
    // a loader starts rolling straight away; the header waits for its first interval
    const first = mode === "loader" ? window.setTimeout(roll, 60) : undefined;
    const id = window.setInterval(
      () => {
        if (!document.hidden) roll();
      },
      mode === "loader" ? LOADER_EVERY_MS : IDLE_EVERY_MS,
    );
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [mode, roll]);

  return (
    <span
      className={`die ${className}`}
      style={{ "--die-e": `${edge}px` } as CSSProperties}
      aria-hidden="true"
      onPointerEnter={rollOnHover ? roll : undefined}
    >
      <span ref={hopRef} className="die__hop">
        <span className="die__iso">
          <span className="die__cube" style={{ transform: POSES[pose] }}>
            {SIDES.map(([side, face]) => (
              <span key={side} className={`die__face die__face--${side}`}>
                <svg viewBox="0 0 100 100" focusable="false">
                  <rect x="3" y="3" width="94" height="94" rx="5" className="die__plate" />
                  <path d={DIE_FACES[face]} fillRule="evenodd" className="die__ink" />
                </svg>
              </span>
            ))}
          </span>
        </span>
      </span>
    </span>
  );
};

interface DieLoaderProps {
  edge?: number;
  /** Wait before showing, so fast loads don't flash a loader. */
  delay?: number;
  label?: string;
  className?: string;
}

/** Page-level loading indicator: the die, rolling until the content arrives. */
export const DieLoader = ({ edge = 28, delay = 300, label = "Loading", className = "" }: DieLoaderProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setVisible(true), delay);
    return () => window.clearTimeout(id);
  }, [delay]);

  if (!visible) return null;
  return (
    <span role="status" aria-label={label} className={`inline-flex ${className}`}>
      <Die edge={edge} mode="loader" />
    </span>
  );
};

/** Fallback for lazily loaded pages: the rolling die in the middle of the content area. */
export const PageLoader = () => (
  <div className="flex h-[60vh] items-center justify-center">
    <DieLoader edge={30} />
  </div>
);
