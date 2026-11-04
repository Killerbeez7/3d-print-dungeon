import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Button, buttonClassName } from "@/components";

describe("Button", () => {
  it("is a plain button by default, so it never submits a form by accident", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("type", "button");
  });

  it("is busy and disabled while loading", () => {
    const onClick = vi.fn();
    render(
      <Button isLoading onClick={onClick}>
        Save
      </Button>
    );
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("buttonClassName", () => {
  it("builds the variant, size and width classes", () => {
    expect(buttonClassName()).toBe("btn btn-primary btn-md");
    expect(buttonClassName({ variant: "secondary", size: "lg", fullWidth: true, className: "x" })).toBe(
      "btn btn-secondary btn-lg w-full x"
    );
  });
});
