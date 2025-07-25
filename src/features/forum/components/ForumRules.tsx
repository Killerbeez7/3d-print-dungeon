import { Link } from "react-router-dom";
import {
    FaExclamationTriangle,
    FaShieldAlt,
    FaHandshake,
    FaComments,
    FaUserShield,
    FaBan,
    FaFlag,
    FaHeart,
} from "react-icons/fa";
import { FORUM_HOME_PATH } from "@/features/forum/constants/forumPaths";
import type { FC } from "react";

export const ForumRules: FC = () => {
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
        <div className="max-w-4xl mx-auto space-y-12">
            {/* Header */}
            <div className="text-center space-y-6">
                <div className="flex items-center justify-center gap-3">
                    <FaShieldAlt className="text-[var(--txt-secondary)]" size={28} />
                    <h1 className="text-4xl font-bold text-[var(--txt-primary)]">
                        Forum Rules & Guidelines
                    </h1>
                </div>
                <p className="text-lg text-[var(--txt-secondary)] max-w-2xl mx-auto leading-relaxed">
                    These rules help maintain a positive and productive community
                    environment. Please read and follow them to ensure everyone has a
                    great experience.
                </p>
            </div>

            {/* General Rules */}
            <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-[var(--txt-primary)]">
                    General Community Rules
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {generalRules.map((rule, index) => (
                        <div
                            key={index}
                            className="flex gap-4 p-6 border border-[var(--br-secondary)] rounded-xl hover:border-[var(--br-primary)] transition-colors"
                        >
                            <div className="flex-shrink-0 mt-1">
                                <rule.icon
                                    className="text-[var(--txt-secondary)]"
                                    size={20}
                                />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold text-[var(--txt-primary)]">
                                    {rule.title}
                                </h3>
                                <p className="text-sm text-[var(--txt-secondary)] leading-relaxed">
                                    {rule.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Rules */}
            <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-[var(--txt-primary)]">
                    Content Guidelines
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {contentRules.map((rule, index) => (
                        <div
                            key={index}
                            className="flex gap-4 p-6 border border-[var(--br-secondary)] rounded-xl hover:border-[var(--br-primary)] transition-colors"
                        >
                            <div className="flex-shrink-0 mt-1">
                                <rule.icon
                                    className="text-[var(--txt-secondary)]"
                                    size={20}
                                />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold text-[var(--txt-primary)]">
                                    {rule.title}
                                </h3>
                                <p className="text-sm text-[var(--txt-secondary)] leading-relaxed">
                                    {rule.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Moderation Guidelines */}
            <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-[var(--txt-primary)]">
                    Moderation & Enforcement
                </h2>
                <div className="space-y-6">
                    {moderationGuidelines.map((guideline, index) => (
                        <div
                            key={index}
                            className="p-6 border border-[var(--br-secondary)] rounded-xl hover:border-[var(--br-primary)] transition-colors"
                        >
                            <h3 className="font-semibold text-[var(--txt-primary)] mb-3">
                                {guideline.title}
                            </h3>
                            <p className="text-[var(--txt-secondary)] leading-relaxed">
                                {guideline.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Additional Guidelines */}
            <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-[var(--txt-primary)]">
                    Additional Guidelines
                </h2>
                <div className="space-y-6">
                    <div className="p-6 border border-[var(--br-secondary)] rounded-xl">
                        <h3 className="font-semibold text-[var(--txt-primary)] mb-4">
                            Thread Creation
                        </h3>
                        <ul className="space-y-2 text-[var(--txt-secondary)] leading-relaxed">
                            <li>
                                • Use descriptive titles that clearly indicate the topic
                            </li>
                            <li>• Choose the appropriate category for your thread</li>
                            <li>• Provide context and details in your initial post</li>
                            <li>
                                • Search for existing threads before creating new ones
                            </li>
                        </ul>
                    </div>

                    <div className="p-6 border border-[var(--br-secondary)] rounded-xl">
                        <h3 className="font-semibold text-[var(--txt-primary)] mb-4">
                            Replying to Threads
                        </h3>
                        <ul className="space-y-2 text-[var(--txt-secondary)] leading-relaxed">
                            <li>• Read the entire thread before responding</li>
                            <li>
                                • Add value to the discussion with thoughtful
                                contributions
                            </li>
                            <li>
                                • Quote relevant parts when responding to specific points
                            </li>
                            <li>
                                • Avoid derailing conversations with off-topic comments
                            </li>
                        </ul>
                    </div>

                    <div className="p-6 border border-[var(--br-secondary)] rounded-xl">
                        <h3 className="font-semibold text-[var(--txt-primary)] mb-4">
                            Language & Communication
                        </h3>
                        <ul className="space-y-2 text-[var(--txt-secondary)] leading-relaxed">
                            <li>• Use clear, respectful language</li>
                            <li>• Avoid excessive use of caps, emojis, or formatting</li>
                            <li>• Be patient with new members and help them learn</li>
                            <li>
                                • Disagree respectfully and focus on ideas, not people
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Contact & Support */}
            <div className="text-center space-y-6 p-8 border border-[var(--br-secondary)] rounded-xl bg-[var(--bg-tertiary)]">
                <h2 className="text-2xl font-semibold text-[var(--txt-primary)]">
                    Questions About Rules?
                </h2>
                <p className="text-[var(--txt-secondary)] max-w-md mx-auto leading-relaxed">
                    If you have questions about these rules or need clarification, please
                    don&apos;t hesitate to contact our moderation team.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <button className="px-6 py-3 bg-[var(--bg-surface)] text-[var(--txt-primary)] rounded-lg hover:bg-[var(--bg-primary)] border border-[var(--br-secondary)] transition-colors">
                        Contact Moderators
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
