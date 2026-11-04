import { describe, expect, it } from "vitest";

import { sanitizeUserInput } from "@/utils/sanitizeUserInput";
import { toUrlSafeUsername } from "@/utils/stringUtils";

describe("sanitizeUserInput", () => {
  it("trims and neutralises markup", () => {
    expect(sanitizeUserInput('  <script>alert("x")</script> ')).toBe(
      "scriptalert(&quot;x&quot;)&#x2F;script"
    );
    expect(sanitizeUserInput("Tom & Jerry's")).toBe("Tom &amp; Jerry&#x27;s");
  });
});

describe("toUrlSafeUsername", () => {
  it("lower-cases, joins words with hyphens and encodes the rest", () => {
    expect(toUrlSafeUsername("Dragon  Smith")).toBe("dragon-smith");
    expect(toUrlSafeUsername("a/b?c")).toBe("a%2Fb%3Fc");
  });

  it("falls back to anonymous", () => {
    expect(toUrlSafeUsername(null)).toBe("anonymous");
    expect(toUrlSafeUsername("")).toBe("anonymous");
  });
});
