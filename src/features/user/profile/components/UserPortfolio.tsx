import type { PublicProfile } from "../types/profile";

interface UserPortfolioProps {
  user: PublicProfile;
}

export const UserPortfolio = ({ user }: UserPortfolioProps) => {
  return (
    <div className="bg-section rounded-lg p-6 shadow-md">
      <h2 className="text-2xl text-txt-primary mb-6">Portfolio</h2>

      {/* Featured Works */}
      {user.featuredWorks && user.featuredWorks.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg text-txt-primary mb-4">Featured Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.featuredWorks.map((workId, index) => (
              <div
                key={workId}
                className="bg-surface-card rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="aspect-square bg-page rounded-md mb-3 flex items-center justify-center">
                  <span className="text-txt-secondary">Work {index + 1}</span>
                </div>
                <p className="text-txt-primary font-medium">Featured Work</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      {user.artistCategories && user.artistCategories.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg text-txt-primary mb-4">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {user.artistCategories.map((category) => (
              <span
                key={category}
                className="rounded-full bg-page px-3 py-1 text-xs font-semibold text-txt-primary"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Commission Rates */}
      {user.publicCommissionRates && (
        <div>
          <h3 className="text-lg text-txt-primary mb-4">Commission Rates</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface-card rounded-lg p-4 text-center">
              <h4 className="text-txt-primary mb-2">Small</h4>
              <p className="text-2xl font-bold text-txt-primary">
                ${user.publicCommissionRates.small}
              </p>
            </div>
            <div className="bg-surface-card rounded-lg p-4 text-center">
              <h4 className="text-txt-primary mb-2">Medium</h4>
              <p className="text-2xl font-bold text-txt-primary">
                ${user.publicCommissionRates.medium}
              </p>
            </div>
            <div className="bg-surface-card rounded-lg p-4 text-center">
              <h4 className="text-txt-primary mb-2">Large</h4>
              <p className="text-2xl font-bold text-txt-primary">
                ${user.publicCommissionRates.large}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
