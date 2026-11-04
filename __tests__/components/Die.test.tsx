import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BrandMark } from "@/features/shared/components/BrandMark";
import { Die, DieLoader } from "@/features/shared/components/Die";

describe("Die", () => {
  it("draws six sides and stays out of the accessibility tree", () => {
    const { container } = render(<Die edge={20} />);
    expect(container.querySelectorAll(".die__face")).toHaveLength(6);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("sizes the cube from its edge", () => {
    const { container } = render(<Die edge={24} />);
    expect((container.firstChild as HTMLElement).style.getPropertyValue("--die-e")).toBe("24px");
  });
});

describe("DieLoader", () => {
  afterEach(() => vi.useRealTimers());

  it("waits before showing, so fast loads don't flash a loader", () => {
    vi.useFakeTimers();
    render(<DieLoader delay={300} />);
    expect(screen.queryByRole("status")).toBeNull();
    act(() => vi.advanceTimersByTime(300));
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  });
});

describe("BrandMark", () => {
  it("shows the die and the wordmark, or the die alone", () => {
    const { container, rerender } = render(<BrandMark />);
    expect(container.querySelector(".die")).not.toBeNull();
    expect(container.querySelectorAll("svg path").length).toBeGreaterThan(6);

    rerender(<BrandMark showWordmark={false} />);
    expect(container.querySelector("svg[viewBox^='7 ']")).toBeNull();
  });
});
