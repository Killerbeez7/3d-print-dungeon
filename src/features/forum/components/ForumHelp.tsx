import { Link } from "react-router-dom";
import { ChevronDown, House, LayoutDashboard, UserRound } from "lucide-react";

import { buttonClassName } from "@/components";
import { FORUM_PATHS } from "@/features/forum/constants/forumPaths";

import { ForumHeader } from "./ForumUI";

const shortcuts = [
  { icon: House, title: "Forum home", description: "Recent, popular and unanswered threads", to: FORUM_PATHS.HOME },
  { icon: UserRound, title: "My threads", description: "Find, edit or delete your threads", to: FORUM_PATHS.MY_THREADS },
  { icon: LayoutDashboard, title: "Dashboard", description: "Your threads and replies at a glance", to: FORUM_PATHS.DASHBOARD },
];

const faqs = [
  {
    question: "How do I start a thread?",
    answer:
      "Use New thread at the top of the forum home or of any category. Choose a category, give the thread a clear title and describe your question or topic.",
  },
  {
    question: "Can I edit or delete my posts?",
    answer:
      "Yes. Open your thread and use Edit or Delete under the opening post. For replies, hover your reply (or look at the top right of it on a phone) for the edit and delete icons. Edited replies show when they were last edited.",
  },
  {
    question: "How do I reply?",
    answer:
      "Open a thread and press Reply under the opening post. You need to be signed in to reply.",
  },
  {
    question: "What can I search for?",
    answer:
      "The search on the forum home looks through thread titles, messages, categories and tags.",
  },
  {
    question: "What do Pinned and Locked mean?",
    answer:
      "Pinned marks threads the moderators want to highlight. Locked threads stay readable but no longer accept new replies.",
  },
  {
    question: "Can I format my posts?",
    answer: "Posts are plain text. Line breaks are kept, so use empty lines to separate paragraphs.",
  },
];

const steps = [
  { title: "Look around", description: "Browse a few threads to get a feel for the topics and tone." },
  { title: "Join in", description: "Reply where you can help or have something to add." },
  { title: "Ask your own", description: "Start a thread with enough detail for others to help." },
];

export function ForumHelp() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <ForumHeader
        eyebrow="Forum help"
        title="How the forum works"
        description="Where things are, how to post, and answers to common questions."
      />

      <div className="space-y-12">
        <nav aria-label="Forum shortcuts" className="grid gap-3 sm:grid-cols-3">
          {shortcuts.map(({ icon: Icon, ...item }) => (
            <Link
              key={item.to}
              to={item.to}
              className="group rounded-xl border border-br-subtle bg-surface-card p-5 transition-colors hover:border-br-primary"
            >
              <span className="chamfer flex size-10 items-center justify-center bg-accent-soft text-accent [--cut:8px]">
                <Icon className="size-[18px]" aria-hidden="true" />
              </span>
              <span className="mt-4 block font-semibold text-txt-primary group-hover:text-accent">{item.title}</span>
              <span className="mt-1 block text-sm text-txt-secondary">{item.description}</span>
            </Link>
          ))}
        </nav>

        <section>
          <h2 className="mb-4 text-xl font-bold sm:text-2xl">Getting started</h2>
          <ol className="grid gap-px overflow-hidden rounded-xl border border-br-subtle bg-br-subtle sm:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="bg-surface-card p-5">
                <span className="font-mono text-2xl font-semibold text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-sans text-base font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-txt-secondary">{step.description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold sm:text-2xl">Questions</h2>
          <div className="divide-y divide-br-subtle overflow-hidden rounded-xl border border-br-subtle bg-surface-card">
            {faqs.map((faq) => (
              <details key={faq.question} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold text-txt-primary transition-colors hover:bg-muted/40 [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <ChevronDown
                    className="size-4 shrink-0 text-txt-muted transition-transform duration-300 ease-forge group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-txt-secondary">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-2 border-t border-br-subtle pt-8">
          <Link to={FORUM_PATHS.HOME} className={buttonClassName()}>
            Back to the forum
          </Link>
          <Link to={FORUM_PATHS.RULES} className={buttonClassName({ variant: "secondary" })}>
            Forum rules
          </Link>
        </div>
      </div>
    </div>
  );
}
