# Cookie Consent Implementation Guide

## Overview

This implementation provides a comprehensive cookie consent system that restricts access to certain parts of your application based on user consent. The system is entirely client-side and doesn't require Firebase Functions.

## How It Works

### 1. Cookie Categories

The system supports four cookie categories:

- **Essential**: Always required for basic functionality
- **Analytics**: For tracking user behavior and site performance
- **Marketing**: For personalized ads and content
- **Payment**: For secure payment processing

### 2. Consent Storage

User consent is stored in browser cookies using the `cookie_consent` key with a 1-year expiration.

### 3. Route Protection

Routes can be automatically protected based on consent requirements defined in `src/features/policies/config/consentConfig.ts`.

## Components

### CookieConsentRoute

A route guard that checks consent before rendering protected content.

```tsx
import { CookieConsentRoute } from "@/routes/guards/CookieConsentRoute";

<CookieConsentRoute 
    requiredConsent={["analytics", "marketing"]}
    fallbackPath="/"
    showBanner={true}
>
    <ProtectedContent />
</CookieConsentRoute>
```

### ConsentProtectedRoute

Automatically protects routes based on configuration.

```tsx
import { ConsentProtectedRoute } from "@/features/policies/components/ConsentProtectedRoute";

<ConsentProtectedRoute>
    <YourRouteContent />
</ConsentProtectedRoute>
```

### ConsentRequiredFeature

Wraps specific features that require consent.

```tsx
import { ConsentRequiredFeature } from "@/features/policies/components/ConsentRequiredFeature";

<ConsentRequiredFeature 
    requiredConsent={["marketing"]}
    fallbackContent={<AlternativeContent />}
>
    <PersonalizedFeature />
</ConsentRequiredFeature>
```

## Hooks

### useCookieConsent

Provides easy access to consent checking functions.

```tsx
import { useCookieConsent } from "@/features/policies/hooks/useCookieConsent";

const { hasConsent, hasAnyConsent, getMissingConsent, isAccepted } = useCookieConsent();

// Check if user has analytics consent
if (hasConsent("analytics")) {
    // Track user behavior
}

// Check if user has any marketing or analytics consent
if (hasAnyConsent(["marketing", "analytics"])) {
    // Show personalized content
}
```

### useInteractionTracking

For tracking user interactions only when analytics consent is given.

```tsx
import { useInteractionTracking } from "@/features/shared/components/AnalyticsTracker";

const { trackEvent } = useInteractionTracking();

const handleClick = () => {
    trackEvent("button_click", { button: "purchase", product: "sword" });
};
```

## Configuration

### Route Requirements

Define which routes require which consent in `src/features/policies/config/consentConfig.ts`:

```tsx
export const ROUTE_CONSENT_REQUIREMENTS: ConsentRequirement[] = [
    {
        route: "/marketplace",
        requiredConsent: ["analytics", "marketing"],
        description: "Marketplace requires analytics and marketing cookies",
        fallbackPath: "/"
    },
    {
        route: "/payment",
        requiredConsent: ["payment"],
        description: "Payment processing requires payment cookies",
        fallbackPath: "/"
    }
];
```

### Feature Requirements

Define which features require which consent:

```tsx
export const FEATURE_CONSENT_REQUIREMENTS: FeatureConsentRequirement[] = [
    {
        feature: "personalized-ads",
        requiredConsent: ["marketing"],
        description: "Personalized advertisements"
    },
    {
        feature: "analytics-tracking",
        requiredConsent: ["analytics"],
        description: "User behavior tracking"
    }
];
```

## Usage Examples

### 1. Protecting a Route

```tsx
// In your route configuration
{
    path: "/marketplace",
    element: (
        <CookieConsentRoute requiredConsent={["analytics", "marketing"]}>
            <MarketplacePage />
        </CookieConsentRoute>
    )
}
```

### 2. Conditional Feature Rendering

```tsx
import { ConsentRequiredFeature } from "@/features/policies/components/ConsentRequiredFeature";

function ProductPage() {
    return (
        <div>
            <h1>Product Details</h1>
            
            {/* Always shown */}
            <ProductInfo />
            
            {/* Only shown with marketing consent */}
            <ConsentRequiredFeature requiredConsent={["marketing"]}>
                <PersonalizedRecommendations />
            </ConsentRequiredFeature>
            
            {/* Only shown with analytics consent */}
            <ConsentRequiredFeature requiredConsent={["analytics"]}>
                <ProductAnalytics />
            </ConsentRequiredFeature>
        </div>
    );
}
```

### 3. Analytics Tracking

```tsx
import { AnalyticsTracker } from "@/features/shared/components/AnalyticsTracker";

function HomePage() {
    return (
        <AnalyticsTracker eventName="page_view" eventData={{ page: "home" }}>
            <div>
                <h1>Welcome</h1>
                {/* Page content */}
            </div>
        </AnalyticsTracker>
    );
}
```

### 4. Payment Processing

```tsx
import { PaymentProcessor } from "@/features/payment/components/PaymentProcessor";

function CheckoutPage() {
    const handlePaymentSuccess = (transactionId: string) => {
        console.log("Payment successful:", transactionId);
    };

    const handlePaymentError = (error: string) => {
        console.error("Payment failed:", error);
    };

    return (
        <PaymentProcessor
            amount={29.99}
            currency="USD"
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
        />
    );
}
```

## Integration with Existing Code

### 1. Automatic Route Protection

The `ConsentProtectedRoute` component is already integrated into the main layout, so all routes are automatically checked against the configuration.

### 2. Cookie Banner

The cookie banner is automatically shown to users who haven't made a consent choice.

### 3. Settings Modal

Users can manage their cookie preferences through the settings modal accessible from the banner.

## Testing

### 1. Test Consent States

```tsx
// Test with no consent
localStorage.removeItem("cookie_consent");

// Test with partial consent
localStorage.setItem("cookie_consent", JSON.stringify({
    essential: true,
    analytics: false,
    marketing: false,
    payment: false,
    accepted: false
}));

// Test with full consent
localStorage.setItem("cookie_consent", JSON.stringify({
    essential: true,
    analytics: true,
    marketing: true,
    payment: true,
    accepted: true
}));
```

### 2. Test Route Protection

Navigate to protected routes like `/marketplace` or `/payment` to see the consent requirements in action.

## Best Practices

1. **Always provide fallback content** for features that require consent
2. **Use specific consent categories** rather than requiring all cookies
3. **Test with different consent states** to ensure proper functionality
4. **Provide clear messaging** about why consent is needed
5. **Allow users to change preferences** easily

## Troubleshooting

### Common Issues

1. **Consent not persisting**: Check that cookies are enabled in the browser
2. **Routes not protected**: Verify the route is in the configuration
3. **Features not working**: Ensure the correct consent categories are specified

### Debug Mode

Enable debug logging by adding this to your browser console:

```javascript
localStorage.setItem("debug_cookies", "true");
```

This will log all consent-related actions to the console. 