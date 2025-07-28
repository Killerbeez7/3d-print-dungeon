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
        <div className="bg-bg-secondary border border-br-secondary rounded-lg p-6">
            <h3 className="text-lg font-semibold text-txt-primary mb-2">
                Personalized Recommendations
            </h3>
            <p className="text-txt-secondary mb-4">
                Enable marketing cookies to see personalized recommendations based on your interests and browsing history.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="bg-br-secondary/20 rounded-lg p-4">
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
            <div className="bg-bg-secondary border border-br-secondary rounded-lg p-6">
                <h3 className="text-lg font-semibold text-txt-primary mb-4">
                    Recommended for You
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendations.map((item) => (
                        <div key={item.id} className="bg-bg-primary rounded-lg p-4 border border-br-secondary hover:border-br-primary transition-colors">
                            <div className="w-full h-32 bg-br-secondary/20 rounded-lg mb-3 flex items-center justify-center">
                                <span className="text-txt-secondary text-sm">Product Image</span>
                            </div>
                            <h4 className="font-semibold text-txt-primary mb-1">{item.name}</h4>
                            <p className="text-txt-secondary text-sm mb-2">{item.reason}</p>
                            <p className="text-primary font-semibold">{item.price}</p>
                        </div>
                    ))}
                </div>
            </div>
        </ConsentRequiredFeature>
    );
} 