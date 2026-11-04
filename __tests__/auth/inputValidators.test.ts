import { describe, expect, it } from "vitest";

import {
  validateConfirmPassword,
  validateEmail,
  validateField,
  validatePassword,
  validateUsername,
} from "@/features/auth/utils/inputValidators";

describe("validateUsername", () => {
  it("accepts letters, numbers, hyphens and underscores", () => {
    expect(validateUsername("dragon_smith-3")).toEqual({ isValid: true });
  });

  it.each([
    ["", "Username is required"],
    ["   ", "Username is required"],
    ["ab", "at least 3 characters"],
    ["a".repeat(21), "less than 20 characters"],
    ["has space", "can only contain"],
    ["émile", "can only contain"],
    ["Admin", "reserved"],
  ])("rejects %j", (name, message) => {
    const result = validateUsername(name);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain(message);
  });
});

describe("validateEmail", () => {
  it("accepts a normal address", () => {
    expect(validateEmail("maker@example.com").isValid).toBe(true);
  });

  it.each(["", "no-at-sign", "a@b", "a @b.com"])("rejects %j", (email) => {
    expect(validateEmail(email).isValid).toBe(false);
  });

  it("reports an address that is already registered", () => {
    expect(validateEmail("maker@example.com", { emailAvailable: false })).toEqual({
      isValid: false,
      error: "Email is already registered",
    });
  });
});

describe("validatePassword", () => {
  it("accepts 8+ characters with upper case, lower case and a number", () => {
    expect(validatePassword("Dungeon42").isValid).toBe(true);
  });

  it.each([
    ["", "required"],
    ["Ab1", "at least 8"],
    ["dungeon42", "uppercase"],
    ["DUNGEON42", "lowercase"],
    ["Dungeonzz", "number"],
  ])("rejects %j", (password, message) => {
    expect(validatePassword(password).error).toContain(message);
  });
});

describe("validateConfirmPassword", () => {
  it("needs the same password twice", () => {
    expect(validateConfirmPassword("Dungeon42", "Dungeon42").isValid).toBe(true);
    expect(validateConfirmPassword("Dungeon43", "Dungeon42").error).toBe("Passwords do not match");
    expect(validateConfirmPassword("", "Dungeon42").isValid).toBe(false);
  });
});

describe("validateField", () => {
  it("flags a taken username only after the format is valid", () => {
    expect(validateField("username", "maker", { usernameAvailable: false }).error).toBe(
      "Username is already taken"
    );
    expect(validateField("username", "x", { usernameAvailable: false }).error).toContain(
      "at least 3"
    );
  });

  it("checks the confirmation against the password in the context", () => {
    expect(validateField("confirmPassword", "a", { password: "b" }).isValid).toBe(false);
  });

  it("lets unknown fields through", () => {
    expect(validateField("nickname", "")).toEqual({ isValid: true });
  });
});
