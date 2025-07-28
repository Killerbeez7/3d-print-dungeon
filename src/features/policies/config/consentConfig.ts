import { ConsentRequirement, FeatureConsentRequirement } from "../types/cookies";


export const ROUTE_CONSENT_REQUIREMENTS: ConsentRequirement[] = [
    {
        route: "/marketplace",
        requiredConsent: ["analytics", "marketing"],
        description: "Marketplace requires analytics and marketing cookies for personalized recommendations and tracking",
        fallbackPath: "/"
    },
    {
        route: "/models",
        requiredConsent: ["analytics"],
        description: "Models section requires analytics cookies for tracking user interactions",
        fallbackPath: "/"
    },
    {
        route: "/search",
        requiredConsent: ["analytics"],
        description: "Search functionality requires analytics cookies for improving search results",
        fallbackPath: "/"
    },
    {
        route: "/forum",
        requiredConsent: ["analytics", "marketing"],
        description: "Forum requires analytics and marketing cookies for community features",
        fallbackPath: "/"
    },
    {
        route: "/settings",
        requiredConsent: ["essential"],
        description: "Settings require essential cookies for user preferences",
        fallbackPath: "/"
    },
];

export const FEATURE_CONSENT_REQUIREMENTS: FeatureConsentRequirement[] = [
    {
        feature: "analytics-tracking",
        requiredConsent: ["analytics"],
        description: "User behavior tracking and analytics"
    },
    {
        feature: "personalized-ads",
        requiredConsent: ["marketing"],
        description: "Personalized advertisements and content"
    },
    {
        feature: "social-sharing",
        requiredConsent: ["marketing"],
        description: "Social media sharing and integration"
    },
    {
        feature: "recommendations",
        requiredConsent: ["analytics", "marketing"],
        description: "Personalized product recommendations"
    }
];

export function getRouteConsentRequirements(route: string): ConsentRequirement | undefined {
    return ROUTE_CONSENT_REQUIREMENTS.find(req => req.route === route);
}

export function getFeatureConsentRequirements(feature: string): FeatureConsentRequirement | undefined {
    return FEATURE_CONSENT_REQUIREMENTS.find(req => req.feature === feature);
}

export function routeRequiresConsent(route: string): boolean {
    return ROUTE_CONSENT_REQUIREMENTS.some(req => req.route === route);
}

export function featureRequiresConsent(feature: string): boolean {
    return FEATURE_CONSENT_REQUIREMENTS.some(req => req.feature === feature);
} 