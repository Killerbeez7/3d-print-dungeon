import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { DIE_FACES, PORTCULLIS, type DieFace } from "./dieFaces";

// The logo die: a CSS 3D cube seen at the isometric angle, with a dungeon symbol on each side.
//
// Arrangement: a small real maze (a dungeon plan seen from above) is on top; a maze has no up
// or down, so it never looks crooked as the die turns. Gate, dragon eye, keyhole and fire go
// round the sides and always stand upright; bricks are the foundation underneath. At rest you
// see the gate and the eye.
//
// Motion: now and then it makes a quarter turn on the spot, bringing the next side round.
// Pointed at (or loading), it is thrown: it hops, tumbles one full flip with a quarter turn and
// lands on the next upright pose. Either way it always comes to rest the right way up.

const SIDES: ReadonlyArray<readonly [string, DieFace]> = [
  ["front", "gate"],
  ["right", "eye"],
  ["back", "lock"],
  ["left", "fire"],
  ["top", "maze"],
  ["bottom", "bricks"],
];

const MOVES = {
  turn: { ms: 800, ease: "cubic-bezier(.34,1.45,.5,1)", hop: 0.1 },
  throw: { ms: 1100, ease: "cubic-bezier(.2,.8,.25,1.06)", hop: 0.42 },
} as const;
type Move = keyof typeof MOVES;

const IDLE_FIRST_MS = 6_000;
const GATE_OPEN_AFTER_MS = 1_200;
const IDLE_EVERY_MS = 30_000;
const LOADER_EVERY_MS = MOVES.throw.ms + 150;

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

interface DieProps {
  /** Edge length of the cube in px; the drawn die is about 1.63 times as tall. */
  edge: number;
  /** still: moves only when pointed at (if rollOnHover); idle: also turns now and then; loader: keeps rolling. */
  mode?: "still" | "idle" | "loader";
  rollOnHover?: boolean;
  /** Render as a button that throws the die when pressed (and does nothing else). */
  asButton?: boolean;
  /** Throws the die each time this number changes (for a button that wraps the die). */
  rollSignal?: number;
  className?: string;
}

export const Die = ({
  edge,
  mode = "still",
  rollOnHover = false,
  asButton = false,
  rollSignal = 0,
  className = "",
}: DieProps) => {
  const [pose, setPose] = useState({ flips: 0, turns: 0, move: "turn" as Move });
  // The die has come to rest (shortly after it appears, and after each move).
  const [settled, setSettled] = useState(false);
  const hopRef = useRef<HTMLSpanElement>(null);
  const busy = useRef(false);
  const doorClip = `die-door-${useId().replace(/[^a-zA-Z0-9-]/g, "")}`;

  useEffect(() => {
    const id = window.setTimeout(() => setSettled(true), GATE_OPEN_AFTER_MS);
    return () => window.clearTimeout(id);
  }, []);

  const play = useCallback(
    (move: Move) => {
      if (busy.current || reducedMotion()) return;
      busy.current = true;
      setSettled(false);
      const { ms, hop } = MOVES[move];
      setPose((p) => ({ flips: p.flips + (move === "throw" ? 1 : 0), turns: p.turns + 1, move }));
      const up = -edge * hop;
      hopRef.current?.animate?.(
        move === "throw"
          ? [
              { transform: "translateY(0)", easing: "cubic-bezier(.2,.7,.4,1)" },
              { transform: `translateY(${up}px)`, offset: 0.38, easing: "cubic-bezier(.6,0,.85,.4)" },
              { transform: "translateY(0) scale(1.06, 0.94)", offset: 0.72, easing: "ease-out" },
              { transform: `translateY(${up * 0.12}px)`, offset: 0.84, easing: "ease-in" },
              { transform: "translateY(0)" },
            ]
          : [
              { transform: "translateY(0)", easing: "cubic-bezier(.2,.7,.4,1)" },
              { transform: `translateY(${up}px)`, offset: 0.4, easing: "cubic-bezier(.6,0,.8,.4)" },
              { transform: "translateY(0)" },
            ],
        { duration: ms },
      );
      window.setTimeout(() => {
        busy.current = false;
        setSettled(true);
      }, ms + 50);
    },
    [edge],
  );

  useEffect(() => {
    if (mode === "still" || reducedMotion()) return;
    const move: Move = mode === "loader" ? "throw" : "turn";
    const tick = () => {
      if (!document.hidden) play(move);
    };
    const first = window.setTimeout(tick, mode === "loader" ? 60 : IDLE_FIRST_MS);
    const id = window.setInterval(tick, mode === "loader" ? LOADER_EVERY_MS : IDLE_EVERY_MS);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [mode, play]);

  useEffect(() => {
    if (rollSignal) play("throw");
  }, [rollSignal, play]);

  const { ms, ease } = MOVES[pose.move];
  // The gate starts on the left; three quarter turns bring it to the right side of the die.
  // There, once the die is at rest, the portcullis slides up. Anywhere else it hangs half raised.
  const gateOpen =
    settled && mode !== "loader" && ((pose.turns % 4) + 4) % 4 === 3 && !reducedMotion();
  const Root = asButton ? "button" : "span";
  return (
    <Root
      className={`die ${asButton ? "rounded-md" : ""} ${className}`}
      style={{ "--die-e": `${edge}px` } as CSSProperties}
      {...(asButton
        ? { type: "button" as const, "aria-label": "Roll the die", onClick: () => play("throw") }
        : { "aria-hidden": true })}
      onPointerEnter={rollOnHover ? () => play("throw") : undefined}
    >
      <span ref={hopRef} className="die__hop">
        <span className="die__iso">
          <span
            className="die__cube"
            style={{
              transform: `rotateX(${pose.flips * -360}deg) rotateY(${pose.turns * -90}deg)`,
              transition: `transform ${ms}ms ${ease}`,
            }}
          >
            {SIDES.map(([side, face]) => (
              <span key={side} className={`die__face die__face--${side}`}>
                <svg viewBox="0 0 100 100" focusable="false">
                  <rect x="3" y="3" width="94" height="94" rx="5" className="die__plate" />
                  <path d={DIE_FACES[face]} fillRule="evenodd" className="die__ink" />
                  {face === "gate" && (
                    <>
                      <clipPath id={doorClip}>
                        <path d={DIE_FACES.gate} />
                      </clipPath>
                      <g clipPath={`url(#${doorClip})`}>
                        <path
                          d={PORTCULLIS}
                          className={`die__plate die__portcullis ${gateOpen ? "is-open" : ""}`}
                        />
                      </g>
                    </>
                  )}
                </svg>
              </span>
            ))}
          </span>
        </span>
      </span>
    </Root>
  );
};

interface DieLoaderProps {
  edge?: number;
  /** Wait before showing, so fast loads don't flash a loader. */
  delay?: number;
  label?: string;
  className?: string;
}

/** Page-level loading indicator: the die, being thrown until the content arrives. */
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
