import { PolicyLayout } from "../components/PolicyLayout";

export const PrivacyPolicyPage = () => (
  <PolicyLayout title="Privacy policy" updated="January 2025">
    <h2>Information we collect</h2>
    <p>
      We collect information you provide directly to us, such as when you create an account,
      upload models, or contact us for support.
    </p>

    <h2>How we use your information</h2>
    <p>
      We use the information we collect to provide, maintain, and improve our services, process
      transactions, and communicate with you.
    </p>

    <h2>Information sharing</h2>
    <p>
      We do not sell, trade, or otherwise transfer your personal information to third parties
      without your consent, except as described in this policy.
    </p>

    <h2>Contact us</h2>
    <p>
      If you have any questions about this Privacy Policy, please contact us at{" "}
      <a href="mailto:privacy@3dprintdungeon.com">privacy@3dprintdungeon.com</a>.
    </p>
  </PolicyLayout>
);
