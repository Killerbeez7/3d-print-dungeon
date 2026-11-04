import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { UserAvatar } from "@/features/shared/components/UserAvatar";

describe("UserAvatar", () => {
  it("tries the next photo when one fails, then the default picture", () => {
    render(
      <UserAvatar
        sources={["https://a.example/old.jpg", null, "https://b.example/new.jpg"]}
        alt="Ada"
      />,
    );
    const img = screen.getByRole("img", { name: "Ada" });
    expect(img).toHaveAttribute("src", "https://a.example/old.jpg");

    fireEvent.error(img);
    expect(img).toHaveAttribute("src", "https://b.example/new.jpg");

    fireEvent.error(img);
    expect(img).toHaveAttribute("src", "/assets/images/user.png");

    fireEvent.error(img);
    expect(img).toHaveAttribute("src", "/assets/images/user.png");
  });

  it("starts again from the first photo when the photos change", () => {
    const { rerender } = render(<UserAvatar sources={["https://a.example/1.jpg"]} alt="Ada" />);
    fireEvent.error(screen.getByRole("img"));
    rerender(<UserAvatar sources={["https://a.example/2.jpg"]} alt="Ada" />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "https://a.example/2.jpg");
  });

  it("shows a person icon when there is no photo at all", () => {
    const { container } = render(<UserAvatar sources={[null, "", undefined]} />);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("svg")).not.toBeNull();
  });
});
