import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const shelf = vi.hoisted(() => ({
  favorites: [] as string[],
  lists: [] as { id: string; name: string; modelIds: string[] }[],
  toggle: vi.fn(),
  setIn: vi.fn(),
  create: vi.fn(),
}));

vi.mock("@/features/collections/hooks/useShelf", () => ({
  useFavoriteIds: () => ({ data: shelf.favorites, isSuccess: true, isPending: false }),
  useMyCollections: () => ({ data: shelf.lists }),
  useToggleFavorite: () => ({ mutate: shelf.toggle }),
  useSetModelInCollection: () => ({ mutate: shelf.setIn }),
  useCreateCollection: () => ({ mutate: shelf.create, isPending: false, isError: false }),
}));

import { FavoritesButton } from "@/features/models/favorites/components/favoritesButton";
import type { CurrentUser } from "@/features/auth/types/auth";

const user = { uid: "u1" } as CurrentUser;
const renderButton = (currentUser: CurrentUser | null = user, openAuthModal = vi.fn()) =>
  render(
    <MemoryRouter>
      <FavoritesButton modelId="m1" currentUser={currentUser} openAuthModal={openAuthModal} />
    </MemoryRouter>,
  );

beforeEach(() => {
  shelf.favorites = [];
  shelf.lists = [{ id: "c1", name: "Goblin warband", modelIds: [] }];
  shelf.toggle.mockReset();
  shelf.setIn.mockReset();
  shelf.create.mockReset();
});

describe("Save button", () => {
  it("asks a signed-out visitor to sign in", () => {
    const openAuth = vi.fn();
    renderButton(null, openAuth);
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(openAuth).toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("saves on the first tap and opens the collections panel", () => {
    renderButton();
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(shelf.toggle).toHaveBeenCalledWith("m1");
    expect(screen.getByRole("dialog", { name: "Save to" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /Goblin warband/ })).toHaveAttribute("aria-checked", "false");
  });

  it("does not unsave when an already saved model's panel opens", () => {
    shelf.favorites = ["m1"];
    renderButton();
    fireEvent.click(screen.getByRole("button", { name: "Saved" }));
    expect(shelf.toggle).not.toHaveBeenCalled();
  });

  it("adds the model to a collection", () => {
    shelf.favorites = ["m1"];
    renderButton();
    fireEvent.click(screen.getByRole("button", { name: "Saved" }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Goblin warband/ }));
    expect(shelf.setIn).toHaveBeenCalledWith({ id: "c1", modelId: "m1", included: true });
  });

  it("creates a new collection with this model", () => {
    shelf.favorites = ["m1"];
    renderButton();
    fireEvent.click(screen.getByRole("button", { name: "Saved" }));
    fireEvent.click(screen.getByRole("button", { name: "New collection" }));
    fireEvent.change(screen.getByLabelText("Collection name"), { target: { value: "Tavern" } });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    expect(shelf.create).toHaveBeenCalledWith({ name: "Tavern", modelId: "m1" }, expect.any(Object));
  });

  it("closes with Escape", () => {
    shelf.favorites = ["m1"];
    renderButton();
    fireEvent.click(screen.getByRole("button", { name: "Saved" }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
