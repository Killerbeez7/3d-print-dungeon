import { useMediaQuery } from "./useMediaQuery";

type Breakpoint = "base" | "sm" | "md" | "lg" | "xl" | "2xl";

export function useBreakpoint(): Breakpoint {
  const is2xl = useMediaQuery("(min-width: 1536px)");
  const isXl = useMediaQuery("(min-width: 1280px)");
  const isLg = useMediaQuery("(min-width: 1024px)");
  const isMd = useMediaQuery("(min-width: 768px)");
  const isSm = useMediaQuery("(min-width: 640px)");

  if (is2xl) return "2xl";
  if (isXl) return "xl";
  if (isLg) return "lg";
  if (isMd) return "md";
  if (isSm) return "sm";
  return "base";
}