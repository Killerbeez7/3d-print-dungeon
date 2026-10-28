import type { Timestamp } from "firebase/firestore";

import type { PublicProfile } from "../types/profile";

const toDate = (value: Timestamp | Date | undefined): Date | null => {
  if (!value) return null;
  return value instanceof Date ? value : value.toDate();
};

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

/** Mono stats strip under the profile header. */
export const ProfileStats = ({ user }: { user: PublicProfile }) => {
  const joined = toDate(user.joinedAt);

  const stats = [
    { label: "Uploads", value: compact.format(user.stats.uploadsCount ?? 0) },
    { label: "Followers", value: compact.format(user.stats.followersCount ?? 0) },
    { label: "Following", value: compact.format(user.stats.followingCount ?? 0) },
    { label: "Likes", value: compact.format(user.stats.likesCount ?? 0) },
    { label: "Views", value: compact.format(user.stats.viewsCount ?? 0) },
    {
      label: "Joined",
      value: joined ? joined.toLocaleDateString("en", { month: "short", year: "numeric" }) : "—",
    },
  ];

  return (
    <dl className="mt-6 grid grid-cols-3 border-y border-br-subtle sm:grid-cols-6">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={`px-3 py-3 ${index % 3 !== 0 ? "border-l border-br-subtle" : ""} ${
            index >= 3 ? "border-t border-br-subtle sm:border-t-0" : ""
          } sm:border-l sm:first:border-l-0`}
        >
          <dt className="label-mono text-txt-muted">{stat.label}</dt>
          <dd className="mt-1 font-mono text-lg font-semibold text-txt-primary">{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
};
