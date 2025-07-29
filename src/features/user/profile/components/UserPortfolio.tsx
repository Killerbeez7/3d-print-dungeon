/**
 * @file UserPortfolio.tsx
 * @description Displays the portfolio for a user
 * @usedIn UserProfilePage
 */

import type { ArtistProfile } from "@/types/user";

interface UserPortfolioProps {
    user: ArtistProfile;
}

export const UserPortfolio = ({ user }: UserPortfolioProps): React.ReactNode => {
    return (
        <div className="bg-bg-secondary rounded-lg p-6 shadow-md">
            <h2 className="text-2xl font-bold text-txt-primary mb-6">Portfolio</h2>

            {/* Featured Works */}
            {user.portfolio.featuredWorks.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-txt-primary mb-4">
                        Featured Works
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {user.portfolio.featuredWorks.map((workId, index) => (
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
            {user.portfolio.categories.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-txt-primary mb-4">
                        Categories
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {user.portfolio.categories.map((category) => (
                            <span
                                key={category}
                                className="px-3 py-1 bg-bg-primary text-txt-primary rounded-full text-sm"
                            >
                                {category}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Commission Rates */}
            {user.portfolio.commissionRates && (
                <div>
                    <h3 className="text-lg font-semibold text-txt-primary mb-4">
                        Commission Rates
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-bg-surface rounded-lg p-4 text-center">
                            <h4 className="font-semibold text-txt-primary mb-2">Small</h4>
                            <p className="text-2xl font-bold text-txt-highlighted">
                                ${user.portfolio.commissionRates.small}
                            </p>
                        </div>
                        <div className="bg-bg-surface rounded-lg p-4 text-center">
                            <h4 className="font-semibold text-txt-primary mb-2">
                                Medium
                            </h4>
                            <p className="text-2xl font-bold text-txt-highlighted">
                                ${user.portfolio.commissionRates.medium}
                            </p>
                        </div>
                        <div className="bg-bg-surface rounded-lg p-4 text-center">
                            <h4 className="font-semibold text-txt-primary mb-2">Large</h4>
                            <p className="text-2xl font-bold text-txt-highlighted">
                                ${user.portfolio.commissionRates.large}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}; 