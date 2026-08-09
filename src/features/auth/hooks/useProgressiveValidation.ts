import { useState, useRef, useCallback } from "react";

import {
  validateField,
  type ValidationContext,
  type ValidationResult,
} from "../utils/inputValidators";
import { isEmailAvailableInDB } from "../utils/authUtils";

interface FieldState {
  value: string;
  hasTyped: boolean;
  hasError: boolean;
  error: string | null;
  isValid: boolean;
  isChecking: boolean;
}

interface UseProgressiveValidationProps {
  initialValues: Record<string, string>;
  onValidationChange?: (field: string, result: ValidationResult) => void;
  mode?: "signin" | "signup";
}

interface EmailValidationCache {
  isValid: boolean;
  error?: string;
}

const createFieldState = (values: Record<string, string>): Record<string, FieldState> => {
  const fields: Record<string, FieldState> = {};

  Object.keys(values).forEach((key) => {
    fields[key] = {
      value: values[key] ?? "",
      hasTyped: false,
      hasError: false,
      error: null,
      isValid: false,
      isChecking: false,
    };
  });

  return fields;
};

export const useProgressiveValidation = ({
  initialValues,
  onValidationChange,
  mode = "signup",
}: UseProgressiveValidationProps) => {
  const [fields, setFields] = useState<Record<string, FieldState>>(() =>
    createFieldState(initialValues)
  );

  const [context, setContext] = useState<ValidationContext>({});

  const checkedEmails = useRef(new Map<string, EmailValidationCache>());

  const updateField = useCallback((fieldName: string, updates: Partial<FieldState>) => {
    setFields((current) => ({
      ...current,
      [fieldName]: {
        ...current[fieldName],
        ...updates,
      },
    }));
  }, []);

  const validateFieldValue = useCallback(
    async (
      fieldName: string,
      value: string,
      fieldContext?: ValidationContext
    ): Promise<ValidationResult> => {
      const validationContext = {
        ...context,
        ...fieldContext,
      };

      const result = validateField(fieldName, value, validationContext);

      if (fieldName === "email" && mode === "signin") {
        updateField(fieldName, {
          value,
          hasError: !result.isValid,
          error: result.isValid ? null : result.error ?? null,
          isValid: result.isValid,
          isChecking: false,
        });

        onValidationChange?.(fieldName, result);

        return result;
      }

      if (fieldName === "email" && mode === "signup" && result.isValid && value.trim()) {
        const trimmedEmail = value.trim();

        const cachedResult = checkedEmails.current.get(trimmedEmail);

        if (cachedResult) {
          const finalResult: ValidationResult = {
            isValid: cachedResult.isValid,
            error: cachedResult.error,
          };

          updateField(fieldName, {
            value,
            hasError: !cachedResult.isValid,
            error: cachedResult.error ?? null,
            isValid: cachedResult.isValid,
            isChecking: false,
          });

          onValidationChange?.(fieldName, finalResult);

          return finalResult;
        }

        updateField(fieldName, {
          value,
          isChecking: true,
        });

        try {
          const emailCheck = await isEmailAvailableInDB(trimmedEmail);

          const finalResult: ValidationResult = emailCheck.available
            ? {
                isValid: true,
              }
            : {
                isValid: false,
                error: emailCheck.error ?? "Email is already registered",
              };

          checkedEmails.current.set(trimmedEmail, {
            isValid: finalResult.isValid,
            error: finalResult.error,
          });

          updateField(fieldName, {
            value,
            hasError: !finalResult.isValid,
            error: finalResult.error ?? null,
            isValid: finalResult.isValid,
            isChecking: false,
          });

          onValidationChange?.(fieldName, finalResult);

          return finalResult;
        } catch {
          updateField(fieldName, {
            value,
            hasError: false,
            error: null,
            isValid: result.isValid,
            isChecking: false,
          });

          onValidationChange?.(fieldName, result);

          return result;
        }
      }

      if (fieldName === "password" && mode === "signin") {
        const finalResult: ValidationResult = {
          isValid: result.isValid,
        };

        updateField(fieldName, {
          value,
          hasError: false,
          error: null,
          isValid: result.isValid,
          isChecking: false,
        });

        onValidationChange?.(fieldName, finalResult);

        return finalResult;
      }

      updateField(fieldName, {
        value,
        hasError: !result.isValid,
        error: result.isValid ? null : result.error ?? null,
        isValid: result.isValid,
        isChecking: false,
      });

      onValidationChange?.(fieldName, result);

      return result;
    },
    [context, mode, onValidationChange, updateField]
  );

  const handleFieldChange = useCallback(
    (fieldName: string, value: string) => {
      updateField(fieldName, {
        value,
        hasTyped: true,
      });

      if (fields[fieldName]?.hasError) {
        updateField(fieldName, {
          hasError: false,
          error: null,
        });
      }

      if (fieldName === "confirmPassword") {
        const passwordValue = fields.password?.value ?? "";

        const result = validateField(fieldName, value, {
          ...context,
          password: passwordValue,
        });

        updateField(fieldName, {
          isValid: result.isValid,
          hasError: false,
          error: null,
          isChecking: false,
        });
      } else if (fieldName === "email" && mode === "signin") {
        const result = validateField(fieldName, value, context);

        updateField(fieldName, {
          isValid: result.isValid,
          hasError: false,
          error: null,
          isChecking: false,
        });
      } else if (fieldName === "password" && mode === "signin") {
        const result = validateField(fieldName, value, context);

        updateField(fieldName, {
          isValid: result.isValid,
          hasError: false,
          error: null,
          isChecking: false,
        });
      } else if (fieldName === "email" && mode === "signup") {
        const result = validateField(fieldName, value, context);

        const trimmedEmail = value.trim();

        const cachedResult = checkedEmails.current.get(trimmedEmail);

        if (cachedResult && result.isValid) {
          updateField(fieldName, {
            isValid: cachedResult.isValid,
            hasError: !cachedResult.isValid,
            error: cachedResult.error ?? null,
            isChecking: false,
          });
        } else {
          updateField(fieldName, {
            isValid: result.isValid,
            hasError: false,
            error: null,
            isChecking: result.isValid && Boolean(trimmedEmail),
          });

          if (
            result.isValid &&
            trimmedEmail &&
            !checkedEmails.current.has(trimmedEmail)
          ) {
            void validateFieldValue(fieldName, value);
          }
        }
      } else if (fieldName === "password" && mode === "signup") {
        const result = validateField(fieldName, value, context);

        updateField(fieldName, {
          isValid: result.isValid,
          hasError: false,
          error: null,
          isChecking: false,
        });
      } else {
        void validateFieldValue(fieldName, value);
      }

      if (fieldName === "password" && fields.confirmPassword?.hasTyped) {
        const confirmPasswordValue = fields.confirmPassword.value;

        const result = validateField("confirmPassword", confirmPasswordValue, {
          ...context,
          password: value,
        });

        updateField("confirmPassword", {
          isValid: result.isValid,
          hasError: false,
          error: null,
          isChecking: false,
        });
      }
    },
    [context, fields, mode, updateField, validateFieldValue]
  );

  const handleFieldBlur = useCallback(
    async (fieldName: string, value: string) => {
      if (!fields[fieldName]?.hasTyped) {
        return;
      }

      if (fieldName === "confirmPassword") {
        const passwordValue = fields.password?.value ?? "";

        const passwordField = fields.password;

        if (passwordValue && passwordField?.isValid) {
          await validateFieldValue(fieldName, value, {
            password: passwordValue,
          });
        } else {
          updateField(fieldName, {
            value,
            hasError: false,
            error: null,
            isValid: false,
            isChecking: false,
          });
        }

        return;
      }

      if (fieldName === "email" && !value.trim()) {
        updateField(fieldName, {
          value,
          hasError: false,
          error: null,
          isValid: false,
          isChecking: false,
        });

        return;
      }

      await validateFieldValue(fieldName, value);
    },
    [fields, updateField, validateFieldValue]
  );

  const setFieldValue = useCallback(
    async (fieldName: string, value: string) => {
      updateField(fieldName, {
        value,
      });

      await validateFieldValue(fieldName, value);
    },
    [updateField, validateFieldValue]
  );

  const setContextValue = useCallback((key: keyof ValidationContext, value: unknown) => {
    setContext((current) => ({
      ...current,
      [key]: value,
    }));
  }, []);

  const validateAllFields = useCallback(async () => {
    const results: Record<string, ValidationResult> = {};

    for (const fieldName of Object.keys(fields)) {
      const field = fields[fieldName];

      updateField(fieldName, {
        hasTyped: true,
      });

      const result = await validateFieldValue(fieldName, field.value);

      results[fieldName] = result;
    }

    return results;
  }, [fields, updateField, validateFieldValue]);

  const isFormValid = useCallback(() => {
    return Object.values(fields).every((field) => field.isValid && !field.isChecking);
  }, [fields]);

  const getFieldError = useCallback(
    (fieldName: string): string | null => {
      const field = fields[fieldName];

      if (!field?.hasTyped) {
        return null;
      }

      return field.hasError ? field.error : null;
    },
    [fields]
  );

  const clearFieldError = useCallback(
    (fieldName: string) => {
      updateField(fieldName, {
        error: null,
        hasError: false,
      });
    },
    [updateField]
  );

  const resetForm = useCallback(
    (newValues?: Record<string, string>) => {
      const resetValues = newValues ?? initialValues;

      setFields(createFieldState(resetValues));

      setContext({});

      checkedEmails.current.clear();
    },
    [initialValues]
  );

  return {
    fields,
    context,
    validateFieldValue,
    handleFieldChange,
    handleFieldBlur,
    setFieldValue,
    setContextValue,
    validateAllFields,
    isFormValid,
    getFieldError,
    clearFieldError,
    resetForm,
  };
};
