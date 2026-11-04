import { describe, expect, it } from "vitest";

import {
  AuthErrorType,
  isAuthPopupCancellation,
  mapFirebaseError,
} from "@/features/auth/utils/errorHandling";

describe("mapFirebaseError", () => {
  it("gives one message for wrong email and wrong password, so accounts can't be probed", () => {
    const codes = ["auth/user-not-found", "auth/wrong-password", "auth/invalid-credential"];
    const messages = codes.map((code) => mapFirebaseError({ code }).message);
    expect(new Set(messages).size).toBe(1);
    expect(mapFirebaseError({ code: "auth/wrong-password" }).type).toBe(
      AuthErrorType.INVALID_CREDENTIALS
    );
  });

  it("points field errors at the right field", () => {
    expect(mapFirebaseError({ code: "auth/email-already-in-use" }).field).toBe("email");
    expect(mapFirebaseError({ code: "auth/weak-password" }).field).toBe("password");
  });

  it("asks people to wait after too many attempts", () => {
    const error = mapFirebaseError({ code: "auth/too-many-requests" });
    expect(error.type).toBe(AuthErrorType.TOO_MANY_REQUESTS);
    expect(error.retryAfter).toBeGreaterThan(0);
  });

  it("maps errors from the sign-up function", () => {
    expect(mapFirebaseError({ code: "functions/already-exists" }).type).toBe(
      AuthErrorType.EMAIL_ALREADY_IN_USE
    );
    expect(
      mapFirebaseError({ code: "functions/invalid-argument", message: "Username is reserved" })
    ).toMatchObject({ type: AuthErrorType.VALIDATION_ERROR, message: "Username is reserved" });
    expect(mapFirebaseError({ code: "functions/internal" }).type).toBe(AuthErrorType.SERVER_ERROR);
  });

  it("copes with values that are not errors", () => {
    expect(() => mapFirebaseError(undefined)).not.toThrow();
    expect(mapFirebaseError("boom").message).toBeTruthy();
  });
});

describe("isAuthPopupCancellation", () => {
  it("recognises a closed or replaced sign-in window", () => {
    expect(isAuthPopupCancellation({ code: "auth/popup-closed-by-user" })).toBe(true);
    expect(isAuthPopupCancellation({ code: "auth/cancelled-popup-request" })).toBe(true);
    expect(isAuthPopupCancellation({ code: "auth/popup-blocked" })).toBe(false);
    expect(isAuthPopupCancellation(null)).toBe(false);
  });
});
