import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ForumThread } from "@/features/forum/types/forum";
import { formatRelativeTime, isThreadNew } from "@/features/forum/utils/threadUtils";

const NOW = new Date("2026-06-01T12:00:00Z");
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3_600_000);
const thread = (createdAt: unknown) => ({ createdAt }) as unknown as ForumThread;

describe("forum thread helpers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => vi.useRealTimers());

  it("marks threads from the last 24 hours as new", () => {
    expect(isThreadNew(thread(hoursAgo(2)))).toBe(true);
    expect(isThreadNew(thread(hoursAgo(25)))).toBe(false);
    expect(isThreadNew(thread({ toDate: () => hoursAgo(1) }))).toBe(true);
    expect(isThreadNew(thread(null))).toBe(false);
  });

  it("formats relative times", () => {
    expect(formatRelativeTime(hoursAgo(3))).toBe("about 3 hours ago");
    expect(formatRelativeTime({ toDate: () => hoursAgo(48) })).toBe("2 days ago");
    expect(formatRelativeTime(null)).toBe("Unknown time");
  });
});
