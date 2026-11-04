import { fireEvent, render, screen, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Make } from "@/features/models/makes/makesService";

const auth = vi.hoisted(() => ({ value: { currentUser: null as { uid: string } | null, authUser: null, isAdmin: false } }));
const makes = vi.hoisted(() => ({ list: [] as Make[] }));

vi.mock("@/features/auth/hooks/useAuth", () => ({ useAuth: () => auth.value }));
vi.mock("@/features/models/makes/makesService", () => ({
  MAX_CAPTION: 280,
  listMakes: vi.fn(async () => makes.list),
  postMake: vi.fn(),
  deleteMake: vi.fn(),
}));

import { ModelMakes } from "@/features/models/makes/ModelMakes";

const make = (id: string, userId: string): Make => ({
  id,
  modelId: "m1",
  userId,
  userName: `Maker ${id}`,
  username: null,
  imageUrl: `https://firebasestorage.googleapis.com/${id}.webp`,
  imagePath: `users/${userId}/makes/${id}.webp`,
  caption: "",
  createdAt: null,
});

const setup = (openAuthModal = vi.fn()) => {
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter>
        <ModelMakes modelId="m1" modelOwnerId="creator" openAuthModal={openAuthModal} />
      </MemoryRouter>
    </QueryClientProvider>
  );
  return { openAuthModal };
};

describe("ModelMakes", () => {
  beforeEach(() => {
    auth.value = { currentUser: null, authUser: null, isAdmin: false };
    makes.list = [];
  });

  it("invites the first make when there are none", async () => {
    setup();
    expect(await screen.findByText(/No makes yet/)).toBeInTheDocument();
  });

  it("asks visitors to sign in before posting", () => {
    const { openAuthModal } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Post your make" }));
    expect(openAuthModal).toHaveBeenCalledOnce();
  });

  it("opens the form for signed-in users", () => {
    auth.value = { currentUser: { uid: "u1" }, authUser: null, isAdmin: false };
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Post your make" }));
    expect(screen.getByRole("button", { name: "Choose a photo" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Post make" })).toBeDisabled();
  });

  it("lets only the poster, the model's creator or an admin remove a make", async () => {
    makes.list = [make("a", "u1"), make("b", "someone")];
    auth.value = { currentUser: { uid: "u1" }, authUser: null, isAdmin: false };
    setup();
    const items = await screen.findAllByRole("listitem");
    expect(within(items[0]).getByRole("button", { name: "Remove this make" })).toBeInTheDocument();
    expect(within(items[1]).queryByRole("button", { name: "Remove this make" })).toBeNull();
  });

  it("shows a make large when tapped", async () => {
    makes.list = [make("a", "u1")];
    setup();
    fireEvent.click(await screen.findByRole("button", { name: "Open Maker a's make" }));
    expect(screen.getByRole("dialog", { name: "Maker a's make" })).toBeInTheDocument();
  });
});
