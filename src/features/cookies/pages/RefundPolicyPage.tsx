import { PolicyLayout } from "../components/PolicyLayout";

export const RefundPolicyPage = () => (
  <PolicyLayout title="Refund policy" updated="January 2025">
    <h2>Digital products</h2>
    <p>
      Due to the digital nature of our 3D models, we generally do not offer refunds once a model
      has been downloaded. However, we may consider refunds in exceptional circumstances.
    </p>

    <h2>Refund eligibility</h2>
    <p>Refunds may be granted within 7 days of purchase if:</p>
    <ul>
      <li>The model file is corrupted or unusable</li>
      <li>The model description was significantly inaccurate</li>
      <li>Technical issues prevent download or use</li>
    </ul>

    <h2>How to request a refund</h2>
    <p>
      To request a refund, please contact our support team at{" "}
      <a href="mailto:support@3dprintdungeon.com">support@3dprintdungeon.com</a> with your order
      details and reason for the refund request.
    </p>

    <h2>Processing time</h2>
    <p>
      Refund requests are typically processed within 3-5 business days. The refund will be
      issued to the original payment method.
    </p>

    <h2>Contact information</h2>
    <p>
      If you have any questions about our refund policy, please contact us at{" "}
      <a href="mailto:support@3dprintdungeon.com">support@3dprintdungeon.com</a>.
    </p>
  </PolicyLayout>
);
