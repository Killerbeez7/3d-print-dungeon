import type { PublicProfile } from "../types/profile";

const formatRate = (value: number) =>
  new Intl.NumberFormat("en", { style: "currency", currency: "USD" }).format(value);

/** About tab: only shows what the creator actually filled in. */
export const ProfileAbout = ({ user }: { user: PublicProfile }) => {
  const rates = user.publicCommissionRates;
  const hasContent = Boolean(user.bio || user.artistCategories?.length || rates);

  if (!hasContent) {
    return (
      <p className="px-4 py-16 text-center text-sm text-txt-muted sm:px-6 lg:px-8">
        {user.displayName} hasn&apos;t written anything about themselves yet.
      </p>
    );
  }

  return (
    <div className="mx-auto grid max-w-[1600px] gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[2fr_1fr] lg:px-8">
      <div className="space-y-8">
        {user.bio && (
          <section>
            <h2 className="label-mono mb-3 text-txt-muted">Bio</h2>
            <p className="max-w-prose whitespace-pre-line text-base leading-relaxed text-txt-secondary">
              {user.bio}
            </p>
          </section>
        )}

        {user.artistCategories && user.artistCategories.length > 0 && (
          <section>
            <h2 className="label-mono mb-3 text-txt-muted">Specialities</h2>
            <ul className="flex flex-wrap gap-1.5">
              {user.artistCategories.map((category) => (
                <li
                  key={category}
                  className="border border-br-secondary px-2.5 py-1 font-mono text-xs text-txt-secondary"
                >
                  {category}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {rates && (
        <section>
          <h2 className="label-mono mb-3 text-txt-muted">Commission rates</h2>
          <dl className="divide-y divide-br-subtle rounded-lg border border-br-subtle bg-surface-card">
            {(["small", "medium", "large"] as const).map((size) => (
              <div key={size} className="flex items-center justify-between px-4 py-3 text-sm">
                <dt className="capitalize text-txt-secondary">{size}</dt>
                <dd className="font-mono font-semibold text-ember">{formatRate(rates[size])}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
};
