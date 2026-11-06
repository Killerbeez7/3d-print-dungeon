import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PrelaunchGate } from "@/features/prelaunch/components/PrelaunchGate";

const auth = vi.hoisted(() => ({
  value: { currentUser: null as object | null, authReady: true, loading: false, isAdmin: false, roles: [] as string[] },
}));
const hint = vi.hoisted(() => ({ value: null as object | null }));

vi.mock("@/config/siteLaunch", () => ({
  PRELAUNCH_GATE: true,
  OPEN_BEFORE_LAUNCH: ["/policies", "/reset-password"],
}));
vi.mock("@/features/auth/hooks/useAuth", () => ({ useAuth: () => auth.value }));
vi.mock("@/features/auth/utils/sessionHint", () => ({ readSessionHint: () => hint.value }));
// The real page talks to Firestore and opens the sign-in dialog; the gate only decides which one shows.
vi.mock("@/features/prelaunch/pages/ComingSoonPage", () => ({
  ComingSoonPage: () => <h1>Coming soon</h1>,
}));

const renderAt = (path = "/") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <PrelaunchGate>
        <h1>The site</h1>
      </PrelaunchGate>
    </MemoryRouter>,
  );

describe("PrelaunchGate", () => {
  beforeEach(() => {
    auth.value = { currentUser: null, authReady: true, loading: false, isAdmin: false, roles: [] };
    hint.value = null;
  });

  it("shows the coming-soon page to visitors", () => {
    renderAt("/model/abc");
    expect(screen.getByRole("heading", { name: "Coming soon" })).toBeInTheDocument();
    expect(screen.queryByText("The site")).not.toBeInTheDocument();
  });

  it("lets admins in", () => {
    auth.value = { ...auth.value, currentUser: {}, isAdmin: true, roles: ["admin"] };
    renderAt();
    expect(screen.getByRole("heading", { name: "The site" })).toBeInTheDocument();
  });

  it("lets testers in", () => {
    auth.value = { ...auth.value, currentUser: {}, roles: ["user", "tester"] };
    renderAt();
    expect(screen.getByRole("heading", { name: "The site" })).toBeInTheDocument();
  });

  it("keeps signed-in people without early access out", () => {
    auth.value = { ...auth.value, currentUser: {}, roles: ["user"] };
    renderAt();
    expect(screen.getByRole("heading", { name: "Coming soon" })).toBeInTheDocument();
  });

  it("keeps the policies and password reset open to everyone", () => {
    renderAt("/policies/privacy");
    expect(screen.getByRole("heading", { name: "The site" })).toBeInTheDocument();
  });

  it("waits instead of flashing the coming-soon page while a returning user's roles load", () => {
    auth.value = { ...auth.value, authReady: false };
    hint.value = { displayName: "Ann", username: "ann", photoURL: null };
    renderAt();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });
});
