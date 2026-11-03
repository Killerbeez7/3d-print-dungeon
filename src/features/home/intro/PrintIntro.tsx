import { useEffect, useRef } from "react";

import { DIE_FACES } from "@/features/shared/components/dieFaces";
import { LABEL_PATH, LABEL_WIDTH, LETTERS_PATH } from "@/features/shared/components/brandPaths";
import { createPrintIntro, type PrintIntro as Intro } from "./printIntro";

const PLAYED_KEY = "intro-printed";
/** Played a little faster than the prototype so all motion ends within 5 seconds. */
const SPEED = 1.3;
/** The part of the 1000 x 360 stage the animation uses (room above the name for the print head). */
const VIEWBOX = "140 55 740 200";

/** Plays once per browser session, and never for people who ask for reduced motion. */
const firstOfSession = (): boolean => {
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    if (sessionStorage.getItem(PLAYED_KEY)) return false;
    sessionStorage.setItem(PLAYED_KEY, "1");
  } catch {
    // Storage blocked: play it.
  }
  return true;
};
// Decided once per page load (so a remount, e.g. React's development double-mount, can still
// play it) and switched off once it has played or been skipped.
let playPending: boolean | undefined;

const token = (el: Element, name: string) => getComputedStyle(el).getPropertyValue(name).trim();

/**
 * The logo, printed: the die folds into a print head, prints DUNGEON and then "3D PRINT" on top,
 * and folds back into the die beside the finished name. Otherwise it shows the finished logo.
 * Click to skip to the end.
 */
export const PrintIntro = ({ className = "" }: { className?: string }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const skipRef = useRef<() => void>(() => {});

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const intro: Intro = createPrintIntro(svg, {
      label: LABEL_PATH,
      letters: LETTERS_PATH,
      gate: DIE_FACES.gate,
      eye: DIE_FACES.eye,
      maze: DIE_FACES.maze,
      labelWidth: LABEL_WIDTH,
      viewBox: VIEWBOX,
      colors: {
        accent: token(svg, "--accent"),
        text: token(svg, "--txt-primary"),
        muted: token(svg, "--txt-muted"),
        ink: token(svg, "--bg-page"),
        bed: token(svg, "--br-secondary"),
        hot: token(svg, "--ember-fill"),
      },
    });

    playPending ??= firstOfSession();
    if (!playPending) {
      intro.seek(intro.duration);
      return;
    }

    let frame = 0;
    let start = 0;
    const finish = () => {
      cancelAnimationFrame(frame);
      intro.seek(intro.duration);
    };
    const done = () => {
      playPending = false;
      finish();
    };
    const tick = (now: number) => {
      if (!start) start = now;
      const t = ((now - start) / 1000) * SPEED;
      if (t >= intro.duration) return done();
      intro.seek(t);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    skipRef.current = done;
    return finish;
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox={VIEWBOX}
      role="img"
      aria-label="3D Print Dungeon"
      onClick={() => skipRef.current()}
      className={`block aspect-[740/200] h-auto w-full ${className}`}
    />
  );
};
