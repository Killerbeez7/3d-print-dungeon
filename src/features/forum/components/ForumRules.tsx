import { Link } from "react-router-dom";
import {
  FaBan,
  FaComments,
  FaExclamationTriangle,
  FaFlag,
  FaHandshake,
  FaHeart,
  FaShieldAlt,
  FaUserShield,
} from "react-icons/fa";

import { FORUM_PATHS } from "@/features/forum/constants/forumPaths";

export function ForumRules() {
  const generalRules = [
    {
      icon: FaHandshake,
      title: "Be Respectful",
      description:
        "Treat all members with respect and courtesy. Personal attacks, harassment, or discriminatory language will not be tolerated.",
    },
    {
      icon: FaComments,
      title: "Stay on Topic",
      description:
        "Keep discussions relevant to the thread topic. Off-topic posts may be moved or removed to maintain forum organization.",
    },
    {
      icon: FaUserShield,
      title: "Protect Privacy",
      description:
        "Do not share personal information about yourself or others. Respect privacy and maintain appropriate boundaries.",
    },
    {
      icon: FaHeart,
      title: "Be Constructive",
      description:
        "Provide helpful, constructive feedback. Criticism should be respectful and aimed at improving the discussion.",
    },
  ];

  const contentRules = [
    {
      icon: FaBan,
      title: "No Spam or Advertising",
      description:
        "Commercial advertising, spam, or promotional content without permission is prohibited. Self-promotion should be relevant and minimal.",
    },
    {
      icon: FaFlag,
      title: "No Inappropriate Content",
      description:
        "Content that is offensive, vulgar, or violates community standards will be removed. This includes explicit language and inappropriate images.",
    },
    {
      icon: FaShieldAlt,
      title: "No Copyright Violations",
      description:
        "Do not post copyrighted material without permission. Always credit sources and respect intellectual property rights.",
    },
    {
      icon: FaExclamationTriangle,
      title: "No Misinformation",
      description:
        "Share accurate information and fact-check before posting. Deliberate misinformation or conspiracy theories are not allowed.",
    },
  ];

  const moderationGuidelines = [
    {
      title: "Warning System",
      description:
        "First-time violations typically result in a warning. Repeated violations may lead to temporary or permanent suspension.",
    },
    {
      title: "Appeal Process",
      description:
        "If you believe a moderation action was taken in error, you may appeal through the appropriate channels.",
    },
    {
      title: "Reporting",
      description:
        "Report violations using the report button. Provide specific details to help moderators take appropriate action.",
    },
    {
      title: "Moderator Decisions",
      description:
        "Moderator decisions are final. They are made to maintain community standards and ensure a positive environment.",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10">
      {/* Header */}
      <header className="max-w-3xl">
        {/* <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <FaShieldAlt size={21} aria-hidden="true" />
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          Community Standards
        </p> */}

        <h1 className="text-3xl font-bold text-txt-primary sm:text-4xl">
          Forum Rules & Guidelines
        </h1>

        <p className="mt-3 text-lg leading-relaxed text-txt-secondary">
          These rules help maintain a positive and productive community environment.
          Please read and follow them to ensure everyone has a great experience.
        </p>
      </header>

      {/* General Rules */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-txt-primary">
            General Community Rules
          </h2>

          <p className="mt-1 text-sm text-txt-muted">
            The basic standards expected in every discussion.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {generalRules.map((rule) => {
            const Icon = rule.icon;

            return (
              <article
                key={rule.title}
                className="flex gap-4 rounded-xl border border-br-subtle bg-surface-card p-5 shadow-sm transition-colors hover:border-accent/25"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <Icon size={16} aria-hidden="true" />
                </div>

                <div>
                  <h3 className="font-semibold text-txt-primary">{rule.title}</h3>

                  <p className="mt-1.5 text-sm leading-relaxed text-txt-secondary">
                    {rule.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Content Rules */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-txt-primary">Content Guidelines</h2>

          <p className="mt-1 text-sm text-txt-muted">
            Rules covering what can be shared within the community.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {contentRules.map((rule) => {
            const Icon = rule.icon;

            return (
              <article
                key={rule.title}
                className="flex gap-4 rounded-xl border border-br-subtle bg-surface-card p-5 shadow-sm transition-colors hover:border-accent/25"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-txt-secondary">
                  <Icon size={16} aria-hidden="true" />
                </div>

                <div>
                  <h3 className="font-semibold text-txt-primary">{rule.title}</h3>

                  <p className="mt-1.5 text-sm leading-relaxed text-txt-secondary">
                    {rule.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Moderation */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-txt-primary">
            Moderation & Enforcement
          </h2>

          <p className="mt-1 text-sm text-txt-muted">
            How community standards are handled when issues arise.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-br-subtle bg-surface-card shadow-sm">
          {moderationGuidelines.map((guideline, index) => (
            <article
              key={guideline.title}
              className="flex gap-4 border-b border-br-subtle p-5 last:border-b-0 sm:p-6"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-txt-secondary">
                {index + 1}
              </div>

              <div>
                <h3 className="font-semibold text-txt-primary">{guideline.title}</h3>

                <p className="mt-1.5 leading-relaxed text-txt-secondary">
                  {guideline.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Additional Guidelines */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-txt-primary">
            Additional Guidelines
          </h2>

          <p className="mt-1 text-sm text-txt-muted">
            Practical guidance for creating and participating in discussions.
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          <article className="rounded-xl border border-br-subtle bg-surface-card p-5 shadow-sm">
            <h3 className="font-semibold text-txt-primary">Thread Creation</h3>

            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-txt-secondary">
              <li className="flex gap-2">
                <span className="text-accent">•</span>
                <span>Use descriptive titles that clearly indicate the topic</span>
              </li>

              <li className="flex gap-2">
                <span className="text-accent">•</span>
                <span>Choose the appropriate category for your thread</span>
              </li>

              <li className="flex gap-2">
                <span className="text-accent">•</span>
                <span>Provide context and details in your initial post</span>
              </li>

              <li className="flex gap-2">
                <span className="text-accent">•</span>
                <span>Search for existing threads before creating new ones</span>
              </li>
            </ul>
          </article>

          <article className="rounded-xl border border-br-subtle bg-surface-card p-5 shadow-sm">
            <h3 className="font-semibold text-txt-primary">Replying to Threads</h3>

            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-txt-secondary">
              <li className="flex gap-2">
                <span className="text-accent">•</span>
                <span>Read the entire thread before responding</span>
              </li>

              <li className="flex gap-2">
                <span className="text-accent">•</span>
                <span>Add value to the discussion with thoughtful contributions</span>
              </li>

              <li className="flex gap-2">
                <span className="text-accent">•</span>
                <span>Quote relevant parts when responding to specific points</span>
              </li>

              <li className="flex gap-2">
                <span className="text-accent">•</span>
                <span>Avoid derailing conversations with off-topic comments</span>
              </li>
            </ul>
          </article>

          <article className="rounded-xl border border-br-subtle bg-surface-card p-5 shadow-sm">
            <h3 className="font-semibold text-txt-primary">Language & Communication</h3>

            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-txt-secondary">
              <li className="flex gap-2">
                <span className="text-accent">•</span>
                <span>Use clear, respectful language</span>
              </li>

              <li className="flex gap-2">
                <span className="text-accent">•</span>
                <span>Avoid excessive use of caps, emojis, or formatting</span>
              </li>

              <li className="flex gap-2">
                <span className="text-accent">•</span>
                <span>Be patient with new members and help them learn</span>
              </li>

              <li className="flex gap-2">
                <span className="text-accent">•</span>
                <span>Disagree respectfully and focus on ideas, not people</span>
              </li>
            </ul>
          </article>
        </div>
      </section>

      {/* Contact */}
      <section className="rounded-xl border border-br-subtle bg-muted/60 p-7 text-center sm:p-8">
        <h2 className="text-xl font-semibold text-txt-primary">Questions About Rules?</h2>

        <p className="mx-auto mt-2 max-w-lg leading-relaxed text-txt-secondary">
          If you have questions about these rules or need clarification, please don&apos;t
          hesitate to contact our moderation team.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            className="rounded-lg border border-br-secondary bg-surface-card px-5 py-2.5 text-sm font-semibold text-txt-primary transition-colors hover:bg-muted"
          >
            Contact Moderators
          </button>

          <Link
            to={FORUM_PATHS.HOME}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-btn-primary-text transition-colors hover:bg-accent-hover"
          >
            Back to Forum
          </Link>
        </div>
      </section>
    </div>
  );
}
