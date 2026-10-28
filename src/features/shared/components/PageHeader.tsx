import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  /** Right-hand side: a count, filters or a primary action. */
  aside?: ReactNode;
  /** Content under the title row, inside the band (tabs, search). */
  children?: ReactNode;
  width?: "wide" | "narrow";
}

/** Masthead band for list and content pages. */
export const PageHeader = ({
  eyebrow,
  title,
  description,
  aside,
  children,
  width = "wide",
}: PageHeaderProps) => (
  <header className="relative isolate overflow-hidden border-b border-br-subtle bg-section">
    <div className="bg-layer-lines absolute inset-0 -z-10" aria-hidden="true" />
    <div
      className="absolute -right-24 -top-32 -z-10 size-96 rounded-full bg-accent/10 blur-3xl"
      aria-hidden="true"
    />
    <div
      className={`mx-auto px-4 pb-8 pt-10 sm:px-6 sm:pt-14 lg:px-8 ${
        width === "wide" ? "max-w-[1600px]" : "max-w-4xl"
      }`}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="label-mono text-accent">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-5xl">{title}</h1>
          {description && (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-txt-secondary sm:text-base">
              {description}
            </p>
          )}
        </div>
        {aside && <div className="shrink-0">{aside}</div>}
      </div>
      {children && <div className="mt-6">{children}</div>}
    </div>
  </header>
);
