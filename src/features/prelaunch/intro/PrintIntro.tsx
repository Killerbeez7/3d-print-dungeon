import { useEffect, useRef, useState } from "react";

import { DIE_FACES } from "@/features/shared/components/dieFaces";
import { LABEL_PATH, LETTERS_PATH } from "@/features/shared/components/brandPaths";
import { createPrintIntro, type InkBox, type PrintIntro as Intro } from "./printIntro";

const PLAYED_KEY = "intro-printed";
/** Played a little faster than the prototype so all motion ends within 5 seconds. */
const SPEED = 1.3;
/** Until the first frame sets the real one; close to the finished logo's proportions. */
const FALLBACK_VIEWBOX = "0 0 720 230";

const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

/** Plays once per browser session (when `once`), and never for people who ask for reduced motion. */
const shouldPlay = (once: boolean): boolean => {
  if (reducedMotion()) return false;
  if (!once) return true;
  try {
    if (sessionStorage.getItem(PLAYED_KEY)) return false;
    sessionStorage.setItem(PLAYED_KEY, "1");
  } catch {
    // Storage blocked: play it.
  }
  return true;
};

const token = (el: Element, name: string) => getComputedStyle(el).getPropertyValue(name).trim();

/** Ink bounds of an outline, measured by the browser so the print follows the real letters. */
const measure = (svg: SVGSVGElement, d: string): InkBox => {
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", d);
  svg.appendChild(path);
  const box = path.getBBox();
  path.remove();
  return { x0: box.x, x1: box.x + box.width, top: box.y, bottom: box.y + box.height };
};

/**
 * The logo, printed: the die folds into a print head, prints DUNGEON and then "3D PRINT" on top,
 * and folds back into the die beside the finished name. Click to skip; click the finished logo
 * to print it again. With reduced motion it shows the finished logo.
 */
export const PrintIntro = ({ className = "", once = true }: { className?: string; once?: boolean }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const clickRef = useRef<() => void>(() => {});
  const [viewBox, setViewBox] = useState(FALLBACK_VIEWBOX);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const intro: Intro = createPrintIntro(svg, {
      label: LABEL_PATH,
      letters: LETTERS_PATH,
      labelBox: measure(svg, LABEL_PATH),
      lettersBox: measure(svg, LETTERS_PATH),
      gate: DIE_FACES.gate,
      eye: DIE_FACES.eye,
      maze: DIE_FACES.maze,
      colors: {
        accent: token(svg, "--accent"),
        text: token(svg, "--txt-primary"),
        muted: token(svg, "--txt-muted"),
        ink: token(svg, "--bg-page"),
        bed: token(svg, "--br-secondary"),
        hot: token(svg, "--ember-fill"),
      },
    });
    setViewBox(intro.viewBox);

    let frame = 0;
    let playing = false;
    const finish = () => {
      cancelAnimationFrame(frame);
      playing = false;
      intro.seek(intro.duration);
    };
    const play = () => {
      cancelAnimationFrame(frame);
      playing = true;
      let start = 0;
      const tick = (now: number) => {
        if (!start) start = now;
        const t = ((now - start) / 1000) * SPEED;
        if (t >= intro.duration) return finish();
        intro.seek(t);
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    clickRef.current = () => {
      if (playing) finish();
      else if (!reducedMotion()) play();
    };

    if (shouldPlay(once)) play();
    else finish();
    return () => cancelAnimationFrame(frame);
  }, [once]);

  return (
    <svg
      ref={svgRef}
      viewBox={viewBox}
      role="img"
      aria-label="3D Print Dungeon"
      onClick={() => clickRef.current()}
      className={`block h-auto w-full cursor-pointer select-none ${className}`}
      style={{ aspectRatio: viewBox.split(" ").slice(2).join(" / ") }}
    />
  );
};
