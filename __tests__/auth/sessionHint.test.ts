import { describe, expect, it } from "vitest";

import {
  clearSessionHint,
  readSessionHint,
  writeSessionHint,
} from "@/features/auth/utils/sessionHint";

const hint = { displayName: "Ada", username: "ada", photoURL: null };

describe("session hint", () => {
  it("round-trips the public profile details", () => {
    writeSessionHint(hint);
    expect(readSessionHint()).toEqual(hint);
    clearSessionHint();
    expect(readSessionHint()).toBeNull();
  });

  it("ignores broken or foreign values", () => {
    localStorage.setItem("session-hint-v1", "{not json");
    expect(readSessionHint()).toBeNull();
    localStorage.setItem("session-hint-v1", JSON.stringify({ name: "x" }));
    expect(readSessionHint()).toBeNull();
  });
});
