import { describe, expect, it } from "vitest";

import { getResponsiveThumbnails, getThumbnailUrl } from "@/utils/imageUtils";

const storageUrl = (path: string) =>
  `https://firebasestorage.googleapis.com/v0/b/demo.appspot.com/o/${encodeURIComponent(path)}?alt=media&token=t`;

describe("getThumbnailUrl", () => {
  it("points at the resized WebP next to the original", () => {
    expect(getThumbnailUrl(storageUrl("models/abc/render.png"))).toBe(
      storageUrl("models/abc/thumbs/render_200x200.webp")
    );
  });

  it("swaps the size of a URL that is already a thumbnail", () => {
    expect(getThumbnailUrl(storageUrl("models/abc/thumbs/render_400x400.webp"), "LARGE")).toBe(
      storageUrl("models/abc/thumbs/render_800x800.webp")
    );
  });

  it("leaves other URLs alone", () => {
    expect(getThumbnailUrl("https://example.com/image.png")).toBe("https://example.com/image.png");
    expect(getThumbnailUrl(null)).toBeNull();
  });
});

describe("getResponsiveThumbnails", () => {
  it("gives every size", () => {
    const sizes = getResponsiveThumbnails(storageUrl("a/b.jpg"));
    expect(Object.keys(sizes)).toEqual(["small", "medium", "large", "xlarge"]);
    expect(sizes.xlarge).toContain(encodeURIComponent("a/thumbs/b_1200x1200.webp"));
  });
});
