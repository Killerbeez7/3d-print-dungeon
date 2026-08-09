export {
  validateEmail,
  validateUsername,
  validatePassword,
  validateConfirmPassword,
} from "./inputValidators";

export type { ValidationResult, ValidationContext } from "./inputValidators";

export { isUsernameAvailableInDB, isEmailAvailableInDB } from "./checkAvailability";

export {
  handleAuthError,
  mapFirebaseError,
  isRecoverableError,
  formatErrorForDisplay,
} from "./errorHandling";

export type { AuthError } from "./errorHandling";

export { refreshIdToken } from "./refreshIdToken";
