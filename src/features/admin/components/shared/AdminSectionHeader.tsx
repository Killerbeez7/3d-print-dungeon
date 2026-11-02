import type { ReactNode } from "react";

/** Title row of an admin section, with optional actions on the right. */
export const AdminSectionHeader = ({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) => (
  <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div className="min-w-0">
      <h2 className="text-2xl font-bold tracking-tight text-txt-primary">{title}</h2>
      {description && <p className="mt-1 text-sm text-txt-secondary">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </header>
);
