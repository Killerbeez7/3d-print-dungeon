import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

import { ROUTES } from "@/constants/routeConstants";
import { PageHeader } from "@/features/shared/components/PageHeader";

const policies = [
  {
    to: ROUTES.PRIVACY_POLICY,
    title: "Privacy policy",
    description: "Learn how we collect, use, and protect your personal information.",
  },
  {
    to: ROUTES.TERMS_OF_USE,
    title: "Terms of use",
    description: "Understand the terms and conditions for using our platform.",
  },
  {
    to: ROUTES.COOKIE_POLICY,
    title: "Cookie policy",
    description: "Discover how we use cookies to improve your experience.",
  },
  {
    to: ROUTES.REFUND_POLICY,
    title: "Refund policy",
    description: "Understand our refund process for digital products.",
  },
];

const contacts = [
  { label: "Privacy", email: "privacy@3dprintdungeon.com" },
  { label: "Legal", email: "legal@3dprintdungeon.com" },
  { label: "Support", email: "support@3dprintdungeon.com" },
];

export const PoliciesHome = () => (
  <div className="min-h-screen bg-page pb-20">
    <PageHeader
      eyebrow="Legal"
      title="Policies"
      description="Please review our legal policies to understand how we operate and protect your rights."
    />

    <div className="mx-auto max-w-[1600px] px-4 pt-8 sm:px-6 lg:px-8">
      <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-4">
        {policies.map((policy, index) => (
          <li key={policy.to}>
            <Link
              to={policy.to}
              className="bg-buildplate group relative flex h-full min-h-44 flex-col justify-between gap-8 overflow-hidden rounded-lg bg-surface-card p-5 transition-colors hover:bg-surface-elevated"
            >
              <span className="tile-scan pointer-events-none absolute inset-0" aria-hidden="true" />
              <span className="flex items-start justify-between">
                <span className="font-mono text-xs text-txt-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <ArrowUpRight
                  className="size-5 text-txt-muted transition-[color,transform] duration-300 ease-forge group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                  aria-hidden="true"
                />
              </span>
              <span>
                <span className="block font-display text-lg font-semibold text-txt-primary">
                  {policy.title}
                </span>
                <span className="mt-1 block text-sm text-txt-secondary">{policy.description}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-12 max-w-2xl">
        <h2 className="text-xl font-bold">Questions?</h2>
        <p className="mt-2 text-sm text-txt-secondary">
          If you have questions about any of our policies, please contact us:
        </p>
        <dl className="mt-4 divide-y divide-br-subtle border-y border-br-subtle text-sm">
          {contacts.map((contact) => (
            <div key={contact.label} className="flex items-center justify-between gap-4 py-3">
              <dt className="label-mono text-txt-muted">{contact.label}</dt>
              <dd>
                <a
                  href={`mailto:${contact.email}`}
                  className="font-medium text-accent underline-offset-4 hover:underline"
                >
                  {contact.email}
                </a>
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  </div>
);
