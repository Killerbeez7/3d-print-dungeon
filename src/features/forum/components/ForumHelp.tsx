import { Link } from "react-router-dom";
import {
    FaQuestionCircle,
    FaExclamationTriangle,
    FaStar,
    FaUsers,
    FaEdit,
    FaReply,
    FaSearch,
} from "react-icons/fa";
import { FORUM_HOME_PATH } from "@/features/forum/constants/forumPaths";
import type { FC } from "react";

export const ForumHelp: FC = () => {
    const faqs = [
        {
            question: "How do I create a new thread?",
            answer: "Click the 'New Thread' button in the sidebar or navigate to the forum home and use the create thread option. Make sure to choose the appropriate category and provide a clear title and description.",
        },
        {
            question: "Can I edit my posts?",
            answer: "Yes, you can edit your own threads and replies. Look for the 'Edit' button next to your posts. Note that edited posts will show an 'Edited' timestamp.",
        },
        {
            question: "How do I reply to a thread?",
            answer: "When viewing a thread, click the 'Reply' button at the bottom of the thread content. This will open a reply form where you can write your response.",
        },
        {
            question: "What are the different thread categories?",
            answer: "Categories help organize discussions by topic. Choose the most relevant category when creating a thread to help others find your discussion easily.",
        },
        {
            question: "How do I search for threads?",
            answer: "Use the search bar at the top of the forum home page. You can search by thread title, content, or author name.",
        },
        {
            question: "What does 'Pinned' and 'Locked' mean?",
            answer: "Pinned threads appear at the top of category lists and are important announcements. Locked threads cannot receive new replies, usually because the discussion is complete or closed.",
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
        <div className="max-w-4xl mx-auto space-y-12">
            {/* Header */}
            <div className="text-center space-y-6">
                <div className="flex items-center justify-center gap-3">
                    <FaQuestionCircle className="text-[var(--txt-secondary)]" size={28} />
                    <h1 className="text-4xl font-bold text-[var(--txt-primary)]">
                        Forum Help & Guidelines
                    </h1>
                </div>
                <p className="text-lg text-[var(--txt-secondary)] max-w-2xl mx-auto leading-relaxed">
                    Welcome to our community forum! This guide will help you get started
                    and make the most of your forum experience.
                </p>
            </div>

            {/* Quick Navigation */}
            <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-[var(--txt-primary)]">
                    Quick Navigation
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link
                        to={FORUM_HOME_PATH}
                        className="group p-6 border border-[var(--br-secondary)] rounded-xl hover:border-[var(--br-primary)] hover:bg-[var(--bg-tertiary)] transition-all duration-200"
                    >
                        <h3 className="font-semibold text-[var(--txt-primary)] mb-3 group-hover:text-[var(--accent)] transition-colors">
                            Forum Home
                        </h3>
                        <p className="text-sm text-[var(--txt-secondary)] leading-relaxed">
                            Browse recent discussions and popular threads
                        </p>
                    </Link>
                    <div className="p-6 border border-[var(--br-secondary)] rounded-xl bg-[var(--bg-tertiary)]">
                        <h3 className="font-semibold text-[var(--txt-primary)] mb-3">
                            My Threads
                        </h3>
                        <p className="text-sm text-[var(--txt-secondary)] leading-relaxed">
                            View and manage your own discussions
                        </p>
                    </div>
                    <div className="p-6 border border-[var(--br-secondary)] rounded-xl bg-[var(--bg-tertiary)]">
                        <h3 className="font-semibold text-[var(--txt-primary)] mb-3">
                            Categories
                        </h3>
                        <p className="text-sm text-[var(--txt-secondary)] leading-relaxed">
                            Explore discussions by topic
                        </p>
                    </div>
                </div>
            </div>

            {/* Community Guidelines */}
            <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-[var(--txt-primary)]">
                    Community Guidelines
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {tips.map((tip, index) => (
                        <div
                            key={index}
                            className="flex gap-4 p-6 border border-[var(--br-secondary)] rounded-xl hover:border-[var(--br-primary)] transition-colors"
                        >
                            <div className="flex-shrink-0 mt-1">
                                <tip.icon
                                    className="text-[var(--txt-secondary)]"
                                    size={20}
                                />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold text-[var(--txt-primary)]">
                                    {tip.title}
                                </h3>
                                <p className="text-sm text-[var(--txt-secondary)] leading-relaxed">
                                    {tip.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Frequently Asked Questions */}
            <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-[var(--txt-primary)]">
                    Frequently Asked Questions
                </h2>
                <div className="space-y-8">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="p-6 border border-[var(--br-secondary)] rounded-xl hover:border-[var(--br-primary)] transition-colors"
                        >
                            <h3 className="font-semibold text-[var(--txt-primary)] mb-3">
                                {faq.question}
                            </h3>
                            <p className="text-[var(--txt-secondary)] leading-relaxed">
                                {faq.answer}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Getting Started */}
            <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-[var(--txt-primary)]">
                    Getting Started
                </h2>
                <div className="space-y-8">
                    <div className="flex gap-6">
                        <div className="flex-shrink-0 w-10 h-10 bg-[var(--bg-tertiary)] text-[var(--txt-secondary)] rounded-full flex items-center justify-center font-semibold border border-[var(--br-secondary)]">
                            1
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-[var(--txt-primary)]">
                                Explore the Forum
                            </h3>
                            <p className="text-[var(--txt-secondary)] leading-relaxed">
                                Browse through existing threads to get familiar with the
                                community and topics being discussed.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <div className="flex-shrink-0 w-10 h-10 bg-[var(--bg-tertiary)] text-[var(--txt-secondary)] rounded-full flex items-center justify-center font-semibold border border-[var(--br-secondary)]">
                            2
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-[var(--txt-primary)]">
                                Join Discussions
                            </h3>
                            <p className="text-[var(--txt-secondary)] leading-relaxed">
                                Reply to existing threads to share your thoughts and
                                connect with other members.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <div className="flex-shrink-0 w-10 h-10 bg-[var(--bg-tertiary)] text-[var(--txt-secondary)] rounded-full flex items-center justify-center font-semibold border border-[var(--br-secondary)]">
                            3
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-[var(--txt-primary)]">
                                Start Your Own Thread
                            </h3>
                            <p className="text-[var(--txt-secondary)] leading-relaxed">
                                Create new discussions on topics you&apos;re passionate
                                about or questions you have.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact & Support */}
            <div className="text-center space-y-6 p-8 border border-[var(--br-secondary)] rounded-xl bg-[var(--bg-tertiary)]">
                <h2 className="text-2xl font-semibold text-[var(--txt-primary)]">
                    Need More Help?
                </h2>
                <p className="text-[var(--txt-secondary)] max-w-md mx-auto leading-relaxed">
                    If you need additional assistance or have questions not covered here,
                    please don&apos;t hesitate to reach out.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <button className="px-6 py-3 bg-[var(--bg-surface)] text-[var(--txt-primary)] rounded-lg hover:bg-[var(--bg-primary)] border border-[var(--br-secondary)] transition-colors">
                        Contact Support
                    </button>
                    <Link
                        to={FORUM_HOME_PATH}
                        className="px-6 py-3 bg-[var(--accent)] text-[var(--txt-highlight)] rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
                    >
                        Back to Forum
                    </Link>
                </div>
            </div>
        </div>
    );
};
