import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ThemeToggle } from "@/features/shared/components/ThemeToggle";

describe("ThemeToggle", () => {
  it("switches the page theme and remembers it", () => {
    render(<ThemeToggle />);
    const light = screen.getByRole("radio", { name: "Light" });
    const dark = screen.getByRole("radio", { name: "Dark" });

    fireEvent.click(light);
    expect(light).toHaveAttribute("aria-checked", "true");
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(localStorage.getItem("theme")).toBe("light");

    fireEvent.click(dark);
    expect(dark).toHaveAttribute("aria-checked", "true");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });
});
