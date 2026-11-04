import { describe, expect, it } from "vitest";

import { NAV_SECTIONS } from "@/config/navConfig";

const links = NAV_SECTIONS.flatMap((section) =>
  section.to ? [{ label: section.label, to: section.to, icon: section.icon }] : section.items
);

describe("navigation", () => {
  it("links to site paths only, each once", () => {
    links.forEach((link) => expect(link.to).toMatch(/^\//));
    expect(new Set(links.map((link) => link.to)).size).toBe(links.length);
  });

  it("gives every link an icon for the phone menu", () => {
    links.forEach((link) => expect(link.icon, link.label).toBeTruthy());
  });

  it("has a direct link or a menu in every section", () => {
    NAV_SECTIONS.forEach((section) =>
      expect(Boolean(section.to) || section.items.length > 0, section.label).toBe(true)
    );
  });
});
