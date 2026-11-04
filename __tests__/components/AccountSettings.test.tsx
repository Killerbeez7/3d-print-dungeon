import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const updateUserSettings = vi.fn().mockResolvedValue(undefined);

vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => ({ currentUser: { uid: "u1" } }),
}));
vi.mock("@/features/system-alerts", () => ({
  useSystemAlert: () => ({ success: vi.fn(), error: vi.fn() }),
}));
vi.mock("@/features/user/settings/services/settingsService", async (original) => {
  const actual =
    await original<typeof import("@/features/user/settings/services/settingsService")>();
  return {
    ...actual,
    settingsService: {
      getUserSettings: vi.fn().mockResolvedValue(actual.DEFAULT_USER_SETTINGS),
      updateUserSettings: (...args: unknown[]) => updateUserSettings(...args),
    },
  };
});

import { AccountSettings } from "@/features/user/settings/components/AccountSettings";
import { DEFAULT_USER_SETTINGS } from "@/features/user/settings/services/settingsService";

describe("Selling currency", () => {
  beforeEach(() => updateUserSettings.mockClear());

  it("defaults to euro", () => {
    expect(DEFAULT_USER_SETTINGS.currency).toBe("eur");
  });

  it("saves US dollars when the seller switches", async () => {
    render(<AccountSettings />);
    await waitFor(() => expect(screen.getAllByText("Euro (€)").length).toBeGreaterThan(0));

    fireEvent.click(screen.getByRole("button", { name: "Select selling currency" }));
    fireEvent.click(screen.getByRole("button", { name: "US dollar ($)" }));
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() =>
      expect(updateUserSettings).toHaveBeenCalledWith(
        "u1",
        expect.objectContaining({ currency: "usd" }),
      ),
    );
  });
});
