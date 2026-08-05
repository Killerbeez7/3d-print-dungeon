import { ConsentRequiredFeature } from "@/features/policies/components/ConsentRequiredFeature";

interface PersonalizedRecommendationsProps {
    recommendations: Array<{
        id: string;
        name: string;
        image: string;
        price: string;
        reason: string;
    }>;
}

export function PersonalizedRecommendations({ recommendations }: PersonalizedRecommendationsProps) {
    const fallbackContent = (
        <div className="rounded-lg border border-br-subtle bg-bg-section p-6">
            <p className="mb-2 text-lg font-semibold text-txt-primary">
                Personalized Recommendations
            </p>
            <p className="mb-4 text-txt-secondary">
                Enable marketing cookies to see personalized recommendations based on your interests and browsing history.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="rounded-lg bg-bg-surface p-4">
                        <div className="w-full h-32 bg-br-secondary/30 rounded-lg mb-3"></div>
                        <div className="h-4 bg-br-secondary/30 rounded mb-2"></div>
                        <div className="h-3 bg-br-secondary/30 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <ConsentRequiredFeature
            requiredConsent={["marketing"]}
            fallbackContent={fallbackContent}
            showSettingsButton={true}
        >
            <div className="rounded-lg border border-br-subtle bg-bg-section p-6">
                <p className="mb-4 text-lg font-semibold text-txt-primary">
                    Recommended for You
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendations.map((item) => (
                        <div key={item.id} className="rounded-lg border border-br-subtle bg-bg-surface p-4 transition-colors hover:border-accent/35">
                            <div className="w-full h-32 bg-br-secondary/20 rounded-lg mb-3 flex items-center justify-center">
                                <span className="text-txt-secondary text-sm">Product Image</span>
                            </div>
                            <p className="mb-1 font-semibold text-txt-primary">{item.name}</p>
                            <p className="text-txt-secondary text-sm mb-2">{item.reason}</p>
                            <p className="font-semibold text-accent-text">{item.price}</p>
                        </div>
                    ))}
                </div>
            </div>
        </ConsentRequiredFeature>
    );
} 
