import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface StatePanelProps {
  icon: LucideIcon;
  title: string;
  eyebrow?: string;
  children?: ReactNode;
  actions?: ReactNode;
  /** Use "h2" when the page already has its own h1. */
  headingLevel?: "h1" | "h2";
  className?: string;
}

/** Centered message for empty, missing and not-yet-available pages. */
export const StatePanel = ({
  icon: Icon,
  title,
  eyebrow,
  children,
  actions,
  headingLevel = "h1",
  className = "min-h-[70vh]",
}: StatePanelProps) => {
  const Heading = headingLevel;

  return (
    <section
      className={`relative isolate flex flex-col items-center justify-center overflow-hidden px-4 py-16 text-center ${className}`}
    >
      <div
        className="bg-buildplate fade-radial absolute inset-0 -z-10"
        aria-hidden="true"
      />
      <span className="chamfer flex size-20 items-center justify-center bg-surface-card text-accent shadow-[inset_0_0_0_1px_var(--br-secondary)] [--cut:14px]">
        <Icon className="size-9" aria-hidden="true" />
      </span>
      {eyebrow && <p className="label-mono mt-6 text-accent">{eyebrow}</p>}
      <Heading className={`${eyebrow ? "mt-2" : "mt-6"} max-w-xl text-2xl font-bold sm:text-3xl`}>
        {title}
      </Heading>
      {children && (
        <div className="mt-3 max-w-md text-sm leading-relaxed text-txt-secondary sm:text-base">
          {children}
        </div>
      )}
      {actions && <div className="mt-7 flex flex-wrap justify-center gap-2">{actions}</div>}
    </section>
  );
};
