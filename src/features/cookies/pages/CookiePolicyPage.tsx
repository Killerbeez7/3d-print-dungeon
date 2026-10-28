import { Link } from "react-router-dom";
import { Settings2 } from "lucide-react";

import { Button } from "@/components";
import { ROUTES } from "@/constants/routeConstants";

import { PolicyLayout } from "../components/PolicyLayout";
import { useCookies } from "../hooks/useCookies";

const COOKIE_POLICY_UPDATED = "August 10, 2026";

const cookieTypes = [
  {
    title: "Essential cookies",
    description:
      "These cookies are necessary for the website to function properly and cannot be disabled. They enable basic functions like page navigation, access to secure areas, and shopping cart functionality.",
    examples: [
      "Session cookies for login status",
      "CSRF protection tokens",
      "Shopping cart items",
      "Language preference settings",
    ],
  },
  {
    title: "Analytics cookies",
    description:
      "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our website and user experience.",
    examples: ["Analytics and performance tools", "Page view tracking", "Usage analysis"],
  },
  {
    title: "Marketing cookies",
    description:
      "These cookies are used to track visitors across websites to display relevant and engaging advertisements. They help us provide you with personalized content and offers.",
    examples: ["Personalized recommendations", "Advertising integrations", "Social media features"],
  },
  {
    title: "Payment cookies",
    description:
      "These cookies are necessary for secure payment processing and transaction management. They ensure your payment information is handled securely.",
    examples: [
      "Payment provider integrations",
      "Transaction verification",
      "Payment security features",
    ],
  },
];

const browsers = [
  { name: "Chrome", path: "Settings → Privacy and security → Cookies and other site data" },
  { name: "Firefox", path: "Options → Privacy & Security → Cookies and Site Data" },
  { name: "Safari", path: "Preferences → Privacy → Manage Website Data" },
  { name: "Edge", path: "Settings → Cookies and site permissions → Cookies and site data" },
];

const rights = [
  { title: "Right to information", text: "You have the right to be informed about how we use cookies" },
  { title: "Right to consent", text: "You can give or withdraw consent for non-essential cookies" },
  { title: "Right to access", text: "You can request information about what data we collect" },
  { title: "Right to deletion", text: "You can request deletion of your personal data" },
  { title: "Right to object", text: "You can object to certain types of cookie processing" },
];

export function CookiePolicyPage() {
  const { openSettings } = useCookies();

  return (
    <PolicyLayout
      title="Cookie policy"
      updated={COOKIE_POLICY_UPDATED}
      intro={
        <>
          This Cookie Policy explains how 3D Print Dungeon (&quot;we&quot;, &quot;us&quot;,
          &quot;our&quot;) uses cookies and similar technologies when you visit our website.
        </>
      }
    >
      <h2>What are cookies?</h2>
      <p>
        Cookies are small text files that are stored on your device (computer, tablet, or mobile)
        when you visit a website. They help us provide you with a better experience by:
      </p>
      <ul>
        <li>Remembering your preferences and settings</li>
        <li>Analyzing how you use our website</li>
        <li>Providing personalized content and advertisements</li>
        <li>Ensuring secure payment processing</li>
        <li>Improving website performance and functionality</li>
      </ul>

      <h2>Types of cookies we use</h2>
      {cookieTypes.map((type) => (
        <div key={type.title}>
          <h3>{type.title}</h3>
          <p>{type.description}</p>
          <p className="label-mono mb-1 text-txt-muted">Examples</p>
          <ul>
            {type.examples.map((example) => (
              <li key={example}>{example}</li>
            ))}
          </ul>
        </div>
      ))}

      <h2>How to manage cookies</h2>
      <h3>Our cookie settings</h3>
      <p>
        You can manage your cookie preferences directly on our website through our cookie
        settings panel.
      </p>
      <div className="mb-6">
        <Button
          variant="secondary"
          onClick={openSettings}
          leftIcon={<Settings2 className="size-4" aria-hidden="true" />}
        >
          Manage cookie settings
        </Button>
      </div>

      <h3>Browser settings</h3>
      <p>
        You can control and manage cookies through your browser settings. However, disabling
        certain cookies may impact your experience on our website.
      </p>
      <dl className="mb-4 divide-y divide-br-subtle rounded-lg border border-br-subtle bg-surface-card text-sm">
        {browsers.map((browser) => (
          <div key={browser.name} className="grid gap-1 px-4 py-3 sm:grid-cols-[6rem_1fr]">
            <dt className="font-semibold text-txt-primary">{browser.name}</dt>
            <dd className="font-mono text-xs leading-relaxed sm:text-sm">{browser.path}</dd>
          </div>
        ))}
      </dl>

      <h2>Your rights</h2>
      <p>
        Under data protection laws, you have certain rights regarding your personal data and
        cookie usage:
      </p>
      <ul>
        {rights.map((right) => (
          <li key={right.title}>
            <strong>{right.title}:</strong> {right.text}
          </li>
        ))}
      </ul>

      <h2>Contact us</h2>
      <p>
        If you have questions about this Cookie Policy or how cookies are used on 3D Print
        Dungeon, contact us at{" "}
        <a href="mailto:privacy@3dprintdungeon.com">privacy@3dprintdungeon.com</a>.
      </p>

      <p className="border-t border-br-subtle pt-6 text-sm">
        This Cookie Policy is part of our broader{" "}
        <Link to={ROUTES.PRIVACY_POLICY}>Privacy Policy</Link>. See also our{" "}
        <Link to={ROUTES.TERMS_OF_USE}>Terms of Use</Link>.
      </p>
    </PolicyLayout>
  );
}
