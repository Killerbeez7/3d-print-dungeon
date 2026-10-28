import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Eye, Lock, MessageSquare, MessagesSquare, Pin } from "lucide-react";

import { STATIC_ASSETS } from "@/config/assetsConfig";
import { FORUM_CATEGORIES } from "@/config/forumCategories";

import { FORUM_PATHS } from "../constants/forumPaths";
import { formatRelativeTime, isThreadNew } from "../utils/threadUtils";

import type { ForumCategory, ForumThread } from "../types/forum";

/** Title block at the top of each forum page. */
export const ForumHeader = ({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) => (
  <header className="mb-6 flex flex-col gap-5 border-b border-br-subtle pb-6 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0 max-w-3xl">
      <p className="label-mono text-accent">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">{title}</h1>
      {description && (
        <p className="mt-3 text-sm leading-relaxed text-txt-secondary sm:text-base">{description}</p>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </header>
);

/** Underlined tab row; the active line slides in from the left. */
export const ForumTabs = <T extends string>({
  tabs,
  active,
  onChange,
  label,
}: {
  tabs: { value: T; label: string }[];
  active: T;
  onChange: (value: T) => void;
  label: string;
}) => (
  <div role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto border-b border-br-subtle">
    {tabs.map((tab) => (
      <button
        key={tab.value}
        type="button"
        role="tab"
        aria-selected={active === tab.value}
        onClick={() => onChange(tab.value)}
        className={`relative flex h-11 shrink-0 items-center px-3 text-sm font-semibold transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:origin-left after:bg-accent after:transition-transform after:duration-300 after:ease-forge ${
          active === tab.value
            ? "text-txt-primary after:scale-x-100"
            : "text-txt-muted after:scale-x-0 hover:text-txt-primary"
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

const Badge = ({ children, tone }: { children: ReactNode; tone: "accent" | "warning" | "error" }) => {
  const tones = {
    accent: "bg-accent-soft text-accent",
    warning: "bg-warning/15 text-warning",
    error: "bg-error/15 text-error",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 font-mono text-[0.65rem] font-semibold uppercase tracking-wider ${tones[tone]}`}>
      {children}
    </span>
  );
};

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

interface ThreadRowProps {
  thread: ForumThread;
  categories: ForumCategory[];
  showCategory?: boolean;
  showPreview?: boolean;
  /** Which timestamp the meta line shows. */
  timeField?: "createdAt" | "lastActivity";
  /** Owner tools (edit, delete) shown under the meta line. */
  actions?: ReactNode;
}

/** One discussion in a list. The whole row opens the thread. */
export { Badge as ForumBadge };

export const ThreadRow = ({
  thread,
  categories,
  showCategory = true,
  showPreview = true,
  timeField = "createdAt",
  actions,
}: ThreadRowProps) => {
  const category = categories.find((item) => item.id === thread.categoryId);
  const Icon = FORUM_CATEGORIES.find((item) => item.id === thread.categoryId)?.icon ?? MessagesSquare;

  return (
    <article className="group relative grid grid-cols-[auto_1fr] gap-4 px-4 py-5 transition-colors hover:bg-muted/40 sm:grid-cols-[auto_1fr_auto] sm:px-5">
      <span className="chamfer flex size-10 items-center justify-center bg-muted text-txt-secondary transition-colors [--cut:8px] group-hover:bg-accent-soft group-hover:text-accent">
        <Icon className="size-[18px]" aria-hidden="true" />
      </span>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          {showCategory && (
            <Link
              to={FORUM_PATHS.CATEGORY(thread.categoryId)}
              className="relative z-10 label-mono text-txt-muted transition-colors hover:text-accent"
            >
              {category?.name ?? "Forum"}
            </Link>
          )}
          {thread.isPinned && (
            <Badge tone="warning">
              <Pin className="size-3" aria-hidden="true" /> Pinned
            </Badge>
          )}
          {thread.isLocked && (
            <Badge tone="error">
              <Lock className="size-3" aria-hidden="true" /> Locked
            </Badge>
          )}
          {isThreadNew(thread) && <Badge tone="accent">New</Badge>}
        </div>

        <h3 className="mt-1.5 font-sans text-base font-semibold leading-snug text-txt-primary sm:text-lg">
          {/* Stretched link: the whole row is clickable */}
          <Link
            to={FORUM_PATHS.THREAD(thread.id)}
            className="after:absolute after:inset-0 group-hover:text-accent focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-focus"
          >
            {thread.title}
          </Link>
        </h3>

        {showPreview && thread.content && (
          <p className="mt-1.5 line-clamp-2 max-w-3xl text-sm leading-relaxed text-txt-secondary">
            {thread.content}
          </p>
        )}

        {showPreview && thread.tags && thread.tags.length > 0 && (
          <ul className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1">
            {thread.tags.map((tag) => (
              <li key={tag} className="font-mono text-xs text-txt-muted">
                #{tag}
              </li>
            ))}
          </ul>
        )}

        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-txt-muted">
          <span className="text-txt-secondary">{thread.authorName}</span>
          <span aria-hidden="true">·</span>
          <span>{formatRelativeTime(thread[timeField])}</span>
          {/* Phones: reply count inline */}
          <span className="ml-1 inline-flex items-center gap-1 sm:hidden">
            <MessageSquare className="size-3" aria-hidden="true" />
            {thread.replyCount ?? 0}
            <span className="sr-only">replies</span>
          </span>
        </p>

        {actions && <div className="relative z-10 mt-3 flex flex-wrap gap-1">{actions}</div>}
      </div>

      <dl className="hidden w-24 shrink-0 flex-col items-end justify-center gap-1.5 font-mono text-xs sm:flex">
        <div className="flex items-center gap-1.5 text-txt-primary" title="Replies">
          <dt>
            <MessageSquare className="size-3.5 text-txt-muted" aria-label="Replies" />
          </dt>
          <dd className="text-base font-semibold">{compact.format(thread.replyCount ?? 0)}</dd>
        </div>
        <div className="flex items-center gap-1.5 text-txt-muted" title="Views">
          <dt>
            <Eye className="size-3.5" aria-label="Views" />
          </dt>
          <dd>{compact.format(thread.views ?? 0)}</dd>
        </div>
      </dl>
    </article>
  );
};

export const ThreadListFrame = ({ children }: { children: ReactNode }) => (
  <div className="divide-y divide-br-subtle overflow-hidden rounded-xl border border-br-subtle bg-surface-card">
    {children}
  </div>
);

export const ThreadListSkeleton = ({ rows = 4 }: { rows?: number }) => (
  <div role="status" aria-label="Loading discussions">
    <ThreadListFrame>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="grid grid-cols-[auto_1fr] gap-4 px-4 py-5 sm:px-5">
          <div className="skeleton-print chamfer size-10 [--cut:8px]" />
          <div className="space-y-2.5">
            <div className="skeleton-print h-3 w-20" />
            <div className="skeleton-print h-5 w-3/4" />
            <div className="skeleton-print h-3 w-1/2" />
          </div>
        </div>
      ))}
    </ThreadListFrame>
  </div>
);

/** Chamfered avatar with the default picture as fallback. */
export const ForumAvatar = ({ src, size = "md" }: { src?: string | null; size?: "sm" | "md" }) => (
  <img
    src={src || STATIC_ASSETS.DEFAULT_AVATAR}
    alt=""
    loading="lazy"
    referrerPolicy="no-referrer"
    className={`chamfer shrink-0 bg-muted object-cover ${size === "sm" ? "size-9 [--cut:7px]" : "size-11 [--cut:9px]"}`}
    onError={(event) => {
      const image = event.currentTarget;
      if (!image.src.endsWith(STATIC_ASSETS.DEFAULT_AVATAR)) image.src = STATIC_ASSETS.DEFAULT_AVATAR;
    }}
  />
);

/** Inline error message for failed forum actions. */
export const ForumAlert = ({ children }: { children: ReactNode }) => (
  <p role="alert" className="rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-sm text-txt-primary">
    {children}
  </p>
);

/** Header + card wrapper for the create and edit screens. */
export const ForumFormShell = ({
  eyebrow,
  title,
  description,
  error,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  error?: string | null;
  children: ReactNode;
}) => (
  <div className="mx-auto w-full max-w-3xl">
    <ForumHeader eyebrow={eyebrow} title={title} description={description} />
    <section className="rounded-xl border border-br-subtle bg-surface-card p-5 sm:p-7">
      {error && (
        <div className="mb-6">
          <ForumAlert>{error}</ForumAlert>
        </div>
      )}
      {children}
    </section>
  </div>
);

export const ForumFormSkeleton = () => (
  <div className="mx-auto w-full max-w-3xl space-y-6" role="status" aria-label="Loading">
    <div className="space-y-3 border-b border-br-subtle pb-6">
      <div className="skeleton-print h-3 w-24" />
      <div className="skeleton-print h-9 w-64" />
    </div>
    <div className="space-y-5 rounded-xl border border-br-subtle bg-surface-card p-6">
      <div className="skeleton-print h-12" />
      <div className="skeleton-print h-11" />
      <div className="skeleton-print h-48" />
    </div>
  </div>
);
