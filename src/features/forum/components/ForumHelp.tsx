import { Link } from "react-router-dom";
import {
  FaEdit,
  FaExclamationTriangle,
  FaQuestionCircle,
  FaReply,
  FaSearch,
  FaStar,
  FaUsers,
} from "react-icons/fa";

import { FORUM_PATHS } from "@/features/forum/constants/forumPaths";

export function ForumHelp() {
  const faqs = [
    {
      question: "How do I create a new thread?",
      answer:
        "Click the 'New Thread' button in the sidebar or navigate to the forum home and use the create thread option. Make sure to choose the appropriate category and provide a clear title and description.",
    },
    {
      question: "Can I edit my posts?",
      answer:
        "Yes, you can edit your own threads and replies. Look for the 'Edit' button next to your posts. Note that edited posts will show an 'Edited' timestamp.",
    },
    {
      question: "How do I reply to a thread?",
      answer:
        "When viewing a thread, click the 'Reply' button at the bottom of the thread content. This will open a reply form where you can write your response.",
    },
    {
      question: "What are the different thread categories?",
      answer:
        "Categories help organize discussions by topic. Choose the most relevant category when creating a thread to help others find your discussion easily.",
    },
    {
      question: "How do I search for threads?",
      answer:
        "Use the search bar at the top of the forum home page. You can search by thread title, content, or author name.",
    },
    {
      question: "What does 'Pinned' and 'Locked' mean?",
      answer:
        "Pinned threads appear at the top of category lists and are important announcements. Locked threads cannot receive new replies, usually because the discussion is complete or closed.",
    },
  ];

  const tips = [
    {
      icon: FaStar,
      title: "Be Respectful",
      description:
        "Treat other members with respect and courtesy. Disagreements are fine, but keep discussions civil and constructive.",
    },
    {
      icon: FaSearch,
      title: "Search First",
      description:
        "Before creating a new thread, search to see if your question has already been answered. This helps keep the forum organized.",
    },
    {
      icon: FaEdit,
      title: "Use Clear Titles",
      description:
        "Write descriptive thread titles that clearly indicate what your discussion is about. This helps others find and engage with your topic.",
    },
    {
      icon: FaReply,
      title: "Stay on Topic",
      description:
        "Keep your replies relevant to the thread topic. If you want to discuss something different, start a new thread.",
    },
    {
      icon: FaUsers,
      title: "Engage Positively",
      description:
        "Contribute constructively to discussions. Share your knowledge, ask thoughtful questions, and help other members.",
    },
    {
      icon: FaExclamationTriangle,
      title: "Report Issues",
      description:
        "If you see inappropriate content or behavior, use the report feature to notify moderators. Help keep the community safe and welcoming.",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10">
      {/* Header */}
      <header className="max-w-3xl">
        {/* <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <FaQuestionCircle size={22} aria-hidden="true" />
        </div> */}

        {/* <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          Forum Guide
        </p> */}

        <h1 className="text-3xl font-bold text-txt-primary sm:text-4xl">
          Forum Help & Guidelines
        </h1>

        <p className="mt-3 text-lg leading-relaxed text-txt-secondary">
          Welcome to our community forum! This guide will help you get started and make
          the most of your forum experience.
        </p>
      </header>

      {/* Quick Navigation */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-txt-primary">Quick Navigation</h2>

          <p className="mt-1 text-sm text-txt-muted">
            Jump back into the main areas of the community.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Link
            to={FORUM_PATHS.HOME}
            className="group rounded-xl border border-br-subtle bg-surface-card p-5 shadow-sm transition-all duration-200 hover:border-accent/30 hover:shadow-md"
          >
            <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <FaQuestionCircle size={14} aria-hidden="true" />
            </div>

            <h3 className="font-semibold text-txt-primary transition-colors group-hover:text-accent">
              Forum Home
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-txt-secondary">
              Browse recent discussions and popular threads
            </p>
          </Link>

          <div className="rounded-xl border border-br-subtle bg-surface-card p-5 shadow-sm">
            <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <FaEdit size={14} aria-hidden="true" />
            </div>

            <h3 className="font-semibold text-txt-primary">My Threads</h3>

            <p className="mt-2 text-sm leading-relaxed text-txt-secondary">
              View and manage your own discussions
            </p>
          </div>

          <div className="rounded-xl border border-br-subtle bg-surface-card p-5 shadow-sm">
            <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <FaSearch size={14} aria-hidden="true" />
            </div>

            <h3 className="font-semibold text-txt-primary">Categories</h3>

            <p className="mt-2 text-sm leading-relaxed text-txt-secondary">
              Explore discussions by topic
            </p>
          </div>
        </div>
      </section>

      {/* Community Guidelines */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-txt-primary">Community Guidelines</h2>

          <p className="mt-1 text-sm text-txt-muted">
            A few habits that make discussions more useful for everyone.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {tips.map((tip) => {
            const Icon = tip.icon;

            return (
              <article
                key={tip.title}
                className="flex gap-4 rounded-xl border border-br-subtle bg-surface-card p-5 shadow-sm transition-colors hover:border-accent/25"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <Icon size={16} aria-hidden="true" />
                </div>

                <div>
                  <h3 className="font-semibold text-txt-primary">{tip.title}</h3>

                  <p className="mt-1.5 text-sm leading-relaxed text-txt-secondary">
                    {tip.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-txt-primary">
            Frequently Asked Questions
          </h2>

          <p className="mt-1 text-sm text-txt-muted">
            Common questions about using the forum.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-br-subtle bg-surface-card shadow-sm">
          {faqs.map((faq) => (
            <article
              key={faq.question}
              className="border-b border-br-subtle p-5 last:border-b-0 sm:p-6"
            >
              <h3 className="font-semibold text-txt-primary">{faq.question}</h3>

              <p className="mt-2 leading-relaxed text-txt-secondary">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Getting Started */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-txt-primary">Getting Started</h2>

          <p className="mt-1 text-sm text-txt-muted">
            Three simple steps for joining the conversation.
          </p>
        </div>

        <div className="rounded-xl border border-br-subtle bg-surface-card p-6 shadow-sm">
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
                1
              </div>

              <div>
                <h3 className="font-semibold text-txt-primary">Explore the Forum</h3>

                <p className="mt-1.5 leading-relaxed text-txt-secondary">
                  Browse through existing threads to get familiar with the community and
                  topics being discussed.
                </p>
              </div>
            </div>

            <div className="ml-5 h-4 border-l border-br-subtle" />

            <div className="flex gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
                2
              </div>

              <div>
                <h3 className="font-semibold text-txt-primary">Join Discussions</h3>

                <p className="mt-1.5 leading-relaxed text-txt-secondary">
                  Reply to existing threads to share your thoughts and connect with other
                  members.
                </p>
              </div>
            </div>

            <div className="ml-5 h-4 border-l border-br-subtle" />

            <div className="flex gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
                3
              </div>

              <div>
                <h3 className="font-semibold text-txt-primary">Start Your Own Thread</h3>

                <p className="mt-1.5 leading-relaxed text-txt-secondary">
                  Create new discussions on topics you&apos;re passionate about or
                  questions you have.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Support */}
      <section className="rounded-xl border border-br-subtle bg-muted/60 p-7 text-center sm:p-8">
        <h2 className="text-xl font-semibold text-txt-primary">Need More Help?</h2>

        <p className="mx-auto mt-2 max-w-lg leading-relaxed text-txt-secondary">
          If you need additional assistance or have questions not covered here, please
          don&apos;t hesitate to reach out.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            className="rounded-lg border border-br-secondary bg-surface-card px-5 py-2.5 text-sm font-semibold text-txt-primary transition-colors hover:bg-muted"
          >
            Contact Support
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
