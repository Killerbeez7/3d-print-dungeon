import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { NAV_SECTIONS } from "@/config/navConfig";
import { MobileMenu } from "@/features/shared/navbar/MobileMenu";

// The search box talks to Firestore; the menu only needs something in its place.
vi.mock("@/features/search/components/GlobalSearch", () => ({
  GlobalSearch: () => <input aria-label="Search" />,
}));

const setup = ({ isSignedIn = false, path = "/" } = {}) => {
  const props = { onClose: vi.fn(), onSignIn: vi.fn(), onSignUp: vi.fn() };
  render(
    <MemoryRouter initialEntries={[path]}>
      <MobileMenu isOpen sections={NAV_SECTIONS} isSignedIn={isSignedIn} {...props} />
    </MemoryRouter>,
  );
  return { ...props, menu: screen.getByRole("dialog", { name: "Menu" }) };
};

describe("MobileMenu", () => {
  it("lists every page in the navigation", () => {
    const { menu } = setup();
    const nav = within(menu).getByRole("navigation", { name: "Mobile navigation" });
    for (const label of ["Models", "Artists", "Collections", "Forum", "Forum rules", "Help"]) {
      expect(within(nav).getByRole("link", { name: label })).toBeInTheDocument();
    }
    expect(within(nav).getByText("Community")).toBeInTheDocument();
  });

  it("highlights the page you are on, and only that one", () => {
    const { menu } = setup({ path: "/artists" });
    expect(within(menu).getByRole("link", { name: "Artists" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(menu).getByRole("link", { name: "Models" })).not.toHaveAttribute("aria-current");
  });

  it("highlights only Help on the help page, not Forum as well", () => {
    const { menu } = setup({ path: "/forum/help" });
    expect(within(menu).getByRole("link", { name: "Help" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(menu).getByRole("link", { name: "Forum" })).not.toHaveAttribute("aria-current");
  });

  it("keeps Forum highlighted inside a thread", () => {
    const { menu } = setup({ path: "/forum/thread/abc" });
    expect(within(menu).getByRole("link", { name: "Forum" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("focuses the panel when it opens, not the logo link", async () => {
    const { menu } = setup();
    await waitFor(() => expect(menu).toHaveFocus());
    expect(within(menu).getByRole("link", { name: "3D Print Dungeon home" })).not.toHaveFocus();
  });

  it("offers sign in and sign up to visitors", () => {
    const { menu, onSignIn, onSignUp } = setup();
    fireEvent.click(within(menu).getByRole("button", { name: "Sign in" }));
    fireEvent.click(within(menu).getByRole("button", { name: "Sign up" }));
    expect(onSignIn).toHaveBeenCalledOnce();
    expect(onSignUp).toHaveBeenCalledOnce();
    expect(within(menu).queryByRole("link", { name: /upload/i })).toBeNull();
  });

  it("offers uploading to signed-in members", () => {
    const { menu } = setup({ isSignedIn: true });
    expect(within(menu).getByRole("link", { name: /upload a model/i })).toHaveAttribute(
      "href",
      "/model/upload",
    );
    expect(within(menu).queryByRole("button", { name: "Sign in" })).toBeNull();
  });

  it("closes with Escape, the close button and after following a link", () => {
    const { menu, onClose } = setup();
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(within(menu).getByRole("button", { name: "Close menu" }));
    fireEvent.click(within(menu).getByRole("link", { name: "Forum" }));
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it("rolls the die without leaving the menu", () => {
    const { menu, onClose } = setup();
    fireEvent.click(within(menu).getByRole("button", { name: "Roll the die" }));
    expect(onClose).not.toHaveBeenCalled();
    expect(within(menu).getByRole("link", { name: "3D Print Dungeon home" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
