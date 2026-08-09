import { VALIDATION_RULES } from "../constants/validationRules";

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ValidationContext {
  password?: string;
  usernameAvailable?: boolean;
  emailAvailable?: boolean;
  emailError?: string;
}

export const validateUsername = (username: string): ValidationResult => {
  if (!username || username.trim().length === 0) {
    return {
      isValid: false,
      error: "Username is required",
    };
  }

  if (username.trim().length < VALIDATION_RULES.username.minLength) {
    return {
      isValid: false,
      error: `Username must be at least ${VALIDATION_RULES.username.minLength} characters long`,
    };
  }

  if (username.length > VALIDATION_RULES.username.maxLength) {
    return {
      isValid: false,
      error: `Username must be less than ${VALIDATION_RULES.username.maxLength} characters`,
    };
  }

  if (!VALIDATION_RULES.username.pattern.test(username)) {
    return {
      isValid: false,
      error: "Username can only contain letters, numbers, hyphens, and underscores",
    };
  }

  if (
    VALIDATION_RULES.username.reserved.some(
      (reserved) => reserved === username.toLowerCase()
    )
  ) {
    return {
      isValid: false,
      error: "This username is reserved",
    };
  }

  return { isValid: true };
};

export const validateEmail = (
  email: string,
  context?: ValidationContext
): ValidationResult => {
  if (!email || email.trim().length === 0) {
    return {
      isValid: false,
      error: "Email is required",
    };
  }

  if (!VALIDATION_RULES.email.pattern.test(email)) {
    return {
      isValid: false,
      error: "Please enter a valid email address",
    };
  }

  if (context?.emailAvailable === false) {
    return {
      isValid: false,
      error: context.emailError || "Email is already registered",
    };
  }

  return { isValid: true };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return {
      isValid: false,
      error: "Password is required",
    };
  }

  if (password.length < VALIDATION_RULES.password.minLength) {
    return {
      isValid: false,
      error: `Password must be at least ${VALIDATION_RULES.password.minLength} characters long`,
    };
  }

  if (VALIDATION_RULES.password.requireUppercase && !/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one uppercase letter",
    };
  }

  if (VALIDATION_RULES.password.requireLowercase && !/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one lowercase letter",
    };
  }

  if (VALIDATION_RULES.password.requireNumber && !/\d/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one number",
    };
  }

  if (
    VALIDATION_RULES.password.requireSpecial &&
    !/[!@#$%^&*(),.?":{}|<>]/.test(password)
  ) {
    return {
      isValid: false,
      error: "Password must contain at least one special character",
    };
  }

  return { isValid: true };
};

export const validateConfirmPassword = (
  confirmPassword: string,
  password?: string
): ValidationResult => {
  if (!confirmPassword) {
    return {
      isValid: false,
      error: "Please confirm your password",
    };
  }

  if (password && confirmPassword !== password) {
    return {
      isValid: false,
      error: "Passwords do not match",
    };
  }

  return { isValid: true };
};

export const validateField = (
  field: string,
  value: string,
  context?: ValidationContext
): ValidationResult => {
  switch (field) {
    case "username": {
      const result = validateUsername(value);

      if (!result.isValid) {
        return result;
      }

      if (context?.usernameAvailable === false) {
        return {
          isValid: false,
          error: "Username is already taken",
        };
      }

      return result;
    }

    case "email":
      return validateEmail(value, context);

    case "password":
      return validatePassword(value);

    case "confirmPassword":
      return validateConfirmPassword(value, context?.password);

    default:
      return { isValid: true };
  }
};
