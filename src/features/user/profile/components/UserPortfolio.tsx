/**
 * @file UserPortfolio.tsx
 * @description Displays the portfolio for a user
 * @usedIn UserProfilePage
 */

import type { PublicProfileView } from "@/features/user/types/user";
import { mockData } from "../mocks/mockData";
import { H2, H3, H4, StatValueSecondary, Badge } from "@/components/index";

interface UserPortfolioProps {
    user: PublicProfileView;
}

export const UserPortfolio = ({}: UserPortfolioProps): React.ReactNode => {
    return (
        <div className="bg-bg-secondary rounded-lg p-6 shadow-md">
            <H2 size="2xl" className="text-txt-primary mb-6">Portfolio</H2>

            {/* Featured Works */}
            {mockData.portfolio.featuredWorks.length > 0 && (
                <div className="mb-8">
                    <H3 size="lg" className="text-txt-primary mb-4">
                        Featured Works
                    </H3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {mockData.portfolio.featuredWorks.map((workId, index) => (
                            <div
                                key={workId}
                                className="bg-bg-surface rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="aspect-square bg-bg-primary rounded-md mb-3 flex items-center justify-center">
                                    <span className="text-txt-secondary">
                                        Work {index + 1}
                                    </span>
                                </div>
                                <p className="text-txt-primary font-medium">
                                    Featured Work
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Categories */}
            {mockData.portfolio.categories.length > 0 && (
                <div className="mb-8">
                    <H3 size="lg" className="text-txt-primary mb-4">
                        Categories
                    </H3>
                    <div className="flex flex-wrap gap-2">
                        {mockData.portfolio.categories.map((category) => (
                            <Badge
                                key={category}
                                as="span"
                                className="px-3 py-1 bg-bg-primary rounded-full"
                            >
                                {category}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            {/* Commission Rates */}
            {mockData.portfolio.commissionRates && (
                <div>
                    <H3 size="lg" className="text-txt-primary mb-4">
                        Commission Rates
                    </H3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-bg-surface rounded-lg p-4 text-center">
                            <H4 size="base" className="text-txt-primary mb-2">Small</H4>
                            <StatValueSecondary as="p">
                                ${mockData.portfolio.commissionRates.small}
                            </StatValueSecondary>
                        </div>
                        <div className="bg-bg-surface rounded-lg p-4 text-center">
                            <H4 size="base" className="text-txt-primary mb-2">
                                Medium
                            </H4>
                            <StatValueSecondary as="p">
                                ${mockData.portfolio.commissionRates.medium}
                            </StatValueSecondary>
                        </div>
                        <div className="bg-bg-surface rounded-lg p-4 text-center">
                            <H4 size="base" className="text-txt-primary mb-2">Large</H4>
                            <StatValueSecondary as="p">
                                ${mockData.portfolio.commissionRates.large}
                            </StatValueSecondary>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
