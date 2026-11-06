import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components";
import { ROUTES } from "@/constants/routeConstants";
import { AuthModal } from "@/features/auth/components/AuthModal";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useModal } from "@/features/shared/modal/hooks/useModal";
import { PrintIntro } from "../intro/PrintIntro";
import { DEVLOG_QUERY_KEY, fetchDevlogPosts } from "../services/devlogService";
import { formatDevlogDate } from "../utils/formatDevlogDate";

type Tab = "soon" | "devlog";

const TABS: { id: Tab; label: string }[] = [
  { id: "soon", label: "Coming soon" },
  { id: "devlog", label: "Dev log" },
];

const tabFromHash = (): Tab => (window.location.hash === "#devlog" ? "devlog" : "soon");

/** What everyone except admins and testers sees before launch (see PrelaunchGate). */
export const ComingSoonPage = () => {
  const [tab, setTab] = useState<Tab>(tabFromHash);
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ soon: null, devlog: null });

  useEffect(() => {
    const onHash = () => setTab(tabFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const select = (next: Tab, focus = false) => {
    setTab(next);
    // replaceState: switching tabs shouldn't fill the back button.
    window.history.replaceState(window.history.state, "", next === "devlog" ? "#devlog" : window.location.pathname);
    if (focus) tabRefs.current[next]?.focus();
  };

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    select(tab === "soon" ? "devlog" : "soon", true);
  };

  return (
    <div className="relative isolate flex min-h-dvh flex-col bg-page">
      <div className="bg-buildplate fade-radial absolute inset-0 -z-10" aria-hidden="true" />
      <div className="bg-layer-lines absolute inset-0 -z-10 opacity-60" aria-hidden="true" />

      <nav className="flex justify-center px-4 pt-6" aria-label="Coming soon">
        <div role="tablist" aria-label="Sections" className="flex gap-1 rounded-full border border-br-subtle bg-surface-card p-1">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              ref={(node) => {
                tabRefs.current[id] = node;
              }}
              id={`tab-${id}`}
              type="button"
              role="tab"
              aria-selected={tab === id}
              aria-controls={`panel-${id}`}
              tabIndex={tab === id ? 0 : -1}
              onClick={() => select(id)}
              onKeyDown={onTabKey}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${
                tab === id ? "bg-accent text-txt-inverse" : "text-txt-secondary hover:text-txt-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      <main id="main" className="flex flex-1 flex-col items-center px-4 py-12 sm:py-16">
        {tab === "soon" ? (
          <section
            id="panel-soon"
            role="tabpanel"
            aria-labelledby="tab-soon"
            className="flex flex-1 flex-col items-center justify-center text-center"
          >
            {/* The logo prints itself on every visit; click to skip or to print it again. */}
            <PrintIntro once={false} className="max-w-[36rem]" />
            <p className="label-mono mt-12 text-accent">In development</p>
            <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight text-txt-primary sm:text-6xl">
              The dungeon is being built
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-txt-secondary sm:text-lg">
              3D Print Dungeon is a marketplace and community for 3D-printable models. It isn&apos;t
              open yet: follow along in the dev log.
            </p>
            <div className="mt-8">
              <Button variant="secondary" onClick={() => select("devlog", true)}>
                Read the dev log
              </Button>
            </div>
          </section>
        ) : (
          <section id="panel-devlog" role="tabpanel" aria-labelledby="tab-devlog" className="w-full max-w-2xl">
            <h1 className="text-3xl font-bold text-txt-primary sm:text-4xl">Dev log</h1>
            <p className="mt-2 text-txt-secondary">What&apos;s being built, as it happens.</p>
            <DevlogPosts />
          </section>
        )}
      </main>

      <EarlyAccessFooter />
      <AuthModal />
    </div>
  );
};

const DevlogPosts = () => {
  const { data: posts = [], isLoading, isError } = useQuery({
    queryKey: DEVLOG_QUERY_KEY,
    queryFn: fetchDevlogPosts,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div role="status" aria-label="Loading posts" className="mt-8 space-y-4">
        <div className="skeleton-line h-6 w-2/3" />
        <div className="skeleton-line h-20 w-full" />
      </div>
    );
  }

  if (isError) {
    return <p className="mt-8 text-txt-secondary">The dev log couldn&apos;t be loaded. Try again later.</p>;
  }

  if (posts.length === 0) {
    return <p className="mt-8 text-txt-secondary">No posts yet. The first one is on its way.</p>;
  }

  return (
    <ol className="mt-8 space-y-4">
      {posts.map((post) => (
        <li key={post.id}>
          <article className="rounded-xl border border-br-subtle bg-surface-card p-5 sm:p-6">
            <p className="label-mono text-txt-muted">
              <time dateTime={post.createdAt?.toISOString()}>{formatDevlogDate(post.createdAt)}</time>
            </p>
            <h2 className="mt-1 text-xl font-bold text-txt-primary">{post.title}</h2>
            {post.body
              .split(/\n\s*\n/)
              .filter(Boolean)
              .map((paragraph, index) => (
                <p key={index} className="mt-3 whitespace-pre-line leading-relaxed text-txt-secondary">
                  {paragraph}
                </p>
              ))}
          </article>
        </li>
      ))}
    </ol>
  );
};

const EarlyAccessFooter = () => {
  const { currentUser, handleSignOut } = useAuth();
  const { open } = useModal("auth");
  const linkClass =
    "rounded underline-offset-4 hover:text-txt-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

  return (
    <footer className="flex flex-col items-center gap-4 border-t border-br-subtle px-4 py-6 text-center text-sm text-txt-muted">
      {currentUser ? (
        <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
          <span>This account doesn&apos;t have early access yet.</span>
          <Button variant="ghost" size="sm" onClick={() => void handleSignOut()}>
            Sign out
          </Button>
        </p>
      ) : (
        <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
          <span>Admin or tester?</span>
          <Button variant="ghost" size="sm" onClick={() => open({ mode: "signin" })}>
            Sign in
          </Button>
        </p>
      )}
      <nav aria-label="Policies" className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        <Link to={ROUTES.PRIVACY_POLICY} className={linkClass}>
          Privacy
        </Link>
        <Link to={ROUTES.TERMS_OF_USE} className={linkClass}>
          Terms
        </Link>
        <Link to={ROUTES.COOKIE_POLICY} className={linkClass}>
          Cookies
        </Link>
      </nav>
    </footer>
  );
};
