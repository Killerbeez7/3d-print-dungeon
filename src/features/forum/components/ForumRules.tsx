import { Link } from "react-router-dom";

import { buttonClassName } from "@/components";
import { FORUM_PATHS } from "@/features/forum/constants/forumPaths";

import { ForumHeader } from "./ForumUI";

interface Rule {
  title: string;
  description: string;
}

const generalRules: Rule[] = [
  {
    title: "Be respectful",
    description:
      "Treat all members with respect and courtesy. Personal attacks, harassment or discriminatory language will not be tolerated.",
  },
  {
    title: "Stay on topic",
    description:
      "Keep discussions relevant to the thread topic. Off-topic posts may be moved or removed to keep the forum organised.",
  },
  {
    title: "Protect privacy",
    description:
      "Do not share personal information about yourself or others. Respect privacy and keep appropriate boundaries.",
  },
  {
    title: "Be constructive",
    description:
      "Give helpful, constructive feedback. Criticism should be respectful and aimed at improving the discussion.",
  },
];

const contentRules: Rule[] = [
  {
    title: "No spam or advertising",
    description:
      "Commercial advertising, spam or promotional content without permission is not allowed. Self-promotion should be relevant and minimal.",
  },
  {
    title: "No inappropriate content",
    description:
      "Offensive or vulgar content will be removed. This includes explicit language and inappropriate images.",
  },
  {
    title: "No copyright violations",
    description:
      "Do not post copyrighted material without permission. Credit sources and respect intellectual property, including other creators' models.",
  },
  {
    title: "No misinformation",
    description:
      "Share accurate information and check facts before posting. Deliberate misinformation is not allowed.",
  },
];

const moderation: Rule[] = [
  {
    title: "Warnings",
    description:
      "First-time violations usually get a warning. Repeated violations can lead to a temporary or permanent suspension.",
  },
  {
    title: "Moderator decisions",
    description:
      "Moderators act to keep the community standards above. Their decisions are final.",
  },
];

const habits = [
  {
    title: "Starting a thread",
    items: [
      "Use a title that says what the thread is about",
      "Pick the category that fits best",
      "Give context: printer, material, settings",
      "Search before posting a new question",
    ],
  },
  {
    title: "Replying",
    items: [
      "Read the whole thread first",
      "Add something useful to the discussion",
      "Quote the part you are answering",
      "Start a new thread for a new topic",
    ],
  },
  {
    title: "Tone",
    items: [
      "Use clear, respectful language",
      "Go easy on caps and emojis",
      "Be patient with new members",
      "Disagree with ideas, not people",
    ],
  },
];

const RuleList = ({ rules, start }: { rules: Rule[]; start: number }) => (
  <ol className="grid gap-px overflow-hidden rounded-xl border border-br-subtle bg-br-subtle md:grid-cols-2">
    {rules.map((rule, index) => (
      <li key={rule.title} className="flex gap-4 bg-surface-card p-5">
        <span className="font-mono text-2xl font-semibold leading-none text-accent">
          {String(start + index).padStart(2, "0")}
        </span>
        <div>
          <h3 className="font-sans text-base font-semibold">{rule.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-txt-secondary">{rule.description}</p>
        </div>
      </li>
    ))}
  </ol>
);

const SectionTitle = ({ children }: { children: string }) => (
  <h2 className="mb-4 text-xl font-bold sm:text-2xl">{children}</h2>
);

export function ForumRules() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <ForumHeader
        eyebrow="Community standards"
        title="Forum rules"
        description="A few rules that keep the forum friendly and useful. By posting, you agree to follow them."
      />

      <div className="space-y-12">
        <section>
          <SectionTitle>How we treat each other</SectionTitle>
          <RuleList rules={generalRules} start={1} />
        </section>

        <section>
          <SectionTitle>What you can post</SectionTitle>
          <RuleList rules={contentRules} start={generalRules.length + 1} />
        </section>

        <section>
          <SectionTitle>Moderation</SectionTitle>
          <RuleList rules={moderation} start={generalRules.length + contentRules.length + 1} />
        </section>

        <section>
          <SectionTitle>Good habits</SectionTitle>
          <div className="grid gap-6 md:grid-cols-3">
            {habits.map((group) => (
              <div key={group.title}>
                <h3 className="label-mono mb-3 text-txt-muted">{group.title}</h3>
                <ul className="space-y-2 text-sm leading-relaxed text-txt-secondary">
                  {group.items.map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <span className="mt-2 h-px w-3 shrink-0 bg-accent" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-2 border-t border-br-subtle pt-8">
          <Link to={FORUM_PATHS.HOME} className={buttonClassName()}>
            Back to the forum
          </Link>
          <Link to={FORUM_PATHS.HELP} className={buttonClassName({ variant: "secondary" })}>
            Forum help
          </Link>
        </div>
      </div>
    </div>
  );
}
