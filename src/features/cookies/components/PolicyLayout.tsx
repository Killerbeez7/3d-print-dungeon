import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

import { ROUTES } from "@/constants/routeConstants";
import { PageHeader } from "@/features/shared/components/PageHeader";

const POLICIES = [
  { to: ROUTES.PRIVACY_POLICY, label: "Privacy policy" },
  { to: ROUTES.TERMS_OF_USE, label: "Terms of use" },
  { to: ROUTES.COOKIE_POLICY, label: "Cookie policy" },
  { to: ROUTES.REFUND_POLICY, label: "Refund policy" },
];

interface PolicyLayoutProps {
  title: string;
  updated: string;
  intro?: ReactNode;
  children: ReactNode;
}

/** Legal page: masthead, policy switcher, then the document. */
export const PolicyLayout = ({ title, updated, intro, children }: PolicyLayoutProps) => (
  <div className="min-h-screen bg-page pb-20">
    <PageHeader
      eyebrow="Legal"
      title={title}
      description={intro}
      aside={<p className="label-mono text-txt-muted">Updated {updated}</p>}
    />

    <div className="mx-auto grid max-w-[1600px] gap-8 px-4 pt-8 sm:px-6 lg:grid-cols-[220px_1fr] lg:gap-16 lg:px-8 lg:pt-12">
      <nav aria-label="Policies" className="lg:sticky lg:top-24 lg:self-start">
        <p className="label-mono mb-3 hidden text-txt-muted lg:block">Policies</p>
        <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
          {POLICIES.map((policy) => (
            <li key={policy.to} className="shrink-0">
              <NavLink
                to={policy.to}
                className={({ isActive }) =>
                  `relative flex h-9 items-center rounded-md px-3 text-sm transition-colors before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:bg-accent before:transition-transform before:duration-300 before:ease-forge ${
                    isActive
                      ? "bg-muted font-semibold text-txt-primary before:scale-y-100"
                      : "text-txt-secondary before:scale-y-0 hover:text-txt-primary"
                  }`
                }
              >
                {policy.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <article className="prose-doc">{children}</article>
    </div>
  </div>
);
