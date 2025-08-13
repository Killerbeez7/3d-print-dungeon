import { useState, useCallback } from "react";
import { validateField, ValidationContext, ValidationResult } from "../utils/inputValidators";
import { isEmailAvailableInDB } from "../utils/authUtils";

//types
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


export const useProgressiveValidation = ({ 
    initialValues, 
    onValidationChange,
    mode = "signup"
}: UseProgressiveValidationProps) => {
    const [fields, setFields] = useState<Record<string, FieldState>>(() => {
        const initial: Record<string, FieldState> = {};
        Object.keys(initialValues).forEach(key => {
            initial[key] = {
                value: initialValues[key] || "",
                hasTyped: false,
                hasError: false,
                error: null,
                isValid: false,
                isChecking: false
            };
        });
        return initial;
    });

    const [context, setContext] = useState<ValidationContext>({});
    const [checkedEmails, setCheckedEmails] = useState<Map<string, { isValid: boolean; error?: string }>>(new Map());

    const updateField = useCallback((fieldName: string, updates: Partial<FieldState>) => {
        setFields(prev => ({
            ...prev,
            [fieldName]: { ...prev[fieldName], ...updates }
        }));
    }, []);

    const validateFieldValue = useCallback(async (fieldName: string, value: string, fieldContext?: ValidationContext) => {
        const validationContext = { ...context, ...fieldContext };
        const result = validateField(fieldName, value, validationContext);
        
        // If email format is valid, check availability
        if (fieldName === "email" && result.isValid && value.trim()) {
            const trimmedEmail = value.trim();
            
            // Check if we already have a result for this email
            const existingResult = checkedEmails.get(trimmedEmail);
            if (existingResult) {
                // Use cached result - show visual feedback immediately
                updateField(fieldName, {
                    value,
                    hasError: !existingResult.isValid,
                    error: existingResult.error || null,
                    isValid: existingResult.isValid,
                    isChecking: false
                });
                
                const finalResult = { isValid: existingResult.isValid, error: existingResult.error };
                onValidationChange?.(fieldName, finalResult);
                return finalResult;
            }
            
            updateField(fieldName, { isChecking: true });
            
            try {
                const emailCheck = await isEmailAvailableInDB(trimmedEmail);
                
                // For sign-in: we want email to be registered (available = false means registered)
                // For sign-up: we want email to be available (available = true means not registered)
                if (mode === "signin") {
                    // Sign-in mode: email should be registered
                    if (!emailCheck.available) {
                        // Email is registered - good for sign-in
                        const finalResult = { isValid: true };
                        
                        // Cache the result
                        setCheckedEmails(prev => new Map(prev).set(trimmedEmail, { isValid: true }));
                        
                        updateField(fieldName, {
                            value,
                            hasError: false,
                            error: null,
                            isValid: true,
                            isChecking: false
                        });
                        
                        onValidationChange?.(fieldName, finalResult);
                        return finalResult;
                    } else {
                        // Sign-in UX: do not surface "email not found" during form validation
                        const finalResult = { isValid: true };
                        setCheckedEmails(prev => new Map(prev).set(trimmedEmail, { isValid: true }));
                        updateField(fieldName, {
                            value,
                            hasError: false,
                            error: null,
                            isValid: true,
                            isChecking: false
                        });
                        onValidationChange?.(fieldName, finalResult);
                        return finalResult;
                    }
                } else {
                    // Sign-up mode: email should be available
                    if (!emailCheck.available) {
                        // Email is already registered - bad for sign-up
                        const errorMsg = emailCheck.error || "Email is already registered";
                        const finalResult = { isValid: false, error: errorMsg };
                        
                        // Cache the result
                        setCheckedEmails(prev => new Map(prev).set(trimmedEmail, { isValid: false, error: errorMsg }));
                        
                        updateField(fieldName, {
                            value,
                            hasError: true,
                            error: errorMsg,
                            isValid: false,
                            isChecking: false
                        });
                        
                        onValidationChange?.(fieldName, finalResult);
                        return finalResult;
                    } else {
                        // Email is available - good for sign-up
                        const finalResult = { isValid: true };
                        
                        // Cache the result
                        setCheckedEmails(prev => new Map(prev).set(trimmedEmail, { isValid: true }));
                        
                        updateField(fieldName, {
                            value,
                            hasError: false,
                            error: null,
                            isValid: true,
                            isChecking: false
                        });
                        
                        onValidationChange?.(fieldName, finalResult);
                        return finalResult;
                    }
                }
            } catch {
                // Handle error gracefully
                updateField(fieldName, {
                    value,
                    hasError: false,
                    error: null,
                    isValid: result.isValid, // Fall back to format validation
                    isChecking: false
                });
                
                onValidationChange?.(fieldName, result);
                return result;
            }
        } else {
            // For non-email fields or invalid email format
            // Skip password validation for sign-in mode
            if (fieldName === "password" && mode === "signin") {
                updateField(fieldName, {
                    value,
                    hasError: false, // Never show errors for sign-in password
                    error: null,
                    isValid: result.isValid, // Use actual validation result
                    isChecking: false
                });

                const finalResult = { isValid: result.isValid };
                onValidationChange?.(fieldName, finalResult);
                return finalResult;
            }

            updateField(fieldName, {
                value,
                hasError: !result.isValid,
                error: result.isValid ? null : result.error || null,
                isValid: result.isValid,
                isChecking: false
            });

            onValidationChange?.(fieldName, result);
            return result;
        }
    }, [context, updateField, onValidationChange]);

    const handleFieldChange = useCallback((fieldName: string, value: string) => {
        updateField(fieldName, { value, hasTyped: true });
        
        // Reset error when user starts typing again
        if (fields[fieldName]?.hasError) {
            updateField(fieldName, { hasError: false, error: null });
        }
        
        // For confirm password, only validate silently (don't show tick until blur)
        if (fieldName === "confirmPassword") {
            // Silent validation - only update isValid for button enabling, but don't show tick
            const passwordValue = fields.password?.value || "";
            const validationContext = { ...context, password: passwordValue };
            const result = validateField(fieldName, value, validationContext);
            
            // Update isValid silently for button enabling, but don't show visual feedback yet
            updateField(fieldName, { 
                isValid: result.isValid,
                hasError: false, // Don't show errors until blur
                error: null
            });
        } else if (fieldName === "email" && mode === "signin") {
            // Silent validation for sign-in email - only update isValid for button enabling
            const result = validateField(fieldName, value, context);
            
            // Check if we have a cached result for this email
            const trimmedEmail = value.trim();
            const existingResult = checkedEmails.get(trimmedEmail);
            
            if (existingResult && result.isValid) {
                // Show cached result immediately
                updateField(fieldName, { 
                    isValid: existingResult.isValid,
                    hasError: !existingResult.isValid,
                    error: existingResult.error || null,
                    isChecking: false
                });
            } else {
                // For sign-in email, only show visual feedback when format is valid
                // Don't show errors while typing - only update isValid for button enabling
                updateField(fieldName, { 
                    isValid: result.isValid,
                    hasError: false, // Never show errors while typing for sign-in email
                    error: null,
                    isChecking: result.isValid // Show loading indicator if format is valid
                });
                
                // If format is valid, trigger DB check immediately
                if (result.isValid && value.trim()) {
                    // Only check if this is a new email
                    if (!checkedEmails.has(trimmedEmail)) {
                        validateFieldValue(fieldName, value);
                    }
                }
            }
        } else if (fieldName === "password" && mode === "signin") {
            // Silent validation for sign-in password - validate format but don't show errors
            const result = validateField(fieldName, value, context);
            
            // Update isValid for button enabling, but don't show visual feedback
            updateField(fieldName, { 
                isValid: result.isValid,
                hasError: false, // Never show errors for sign-in password
                error: null
            });
        } else if (fieldName === "email" && mode === "signup") {
            // Silent validation for sign-up email - only update isValid for button enabling
            const result = validateField(fieldName, value, context);
            
            // Check if we have a cached result for this email
            const trimmedEmail = value.trim();
            const existingResult = checkedEmails.get(trimmedEmail);
            
            if (existingResult && result.isValid) {
                // Show cached result immediately
                updateField(fieldName, { 
                    isValid: existingResult.isValid,
                    hasError: !existingResult.isValid,
                    error: existingResult.error || null,
                    isChecking: false
                });
            } else {
                // Only update isValid if format is valid, but don't show visual feedback until DB check
                updateField(fieldName, { 
                    isValid: result.isValid,
                    hasError: false, // Don't show errors until blur
                    error: null,
                    isChecking: result.isValid // Show loading indicator if format is valid
                });
                
                // If format is valid, trigger DB check immediately
                if (result.isValid && value.trim()) {
                    // Only check if this is a new email
                    if (!checkedEmails.has(trimmedEmail)) {
                        validateFieldValue(fieldName, value);
                    }
                }
            }
        } else if (fieldName === "password" && mode === "signup") {
            // Silent validation for sign-up password - validate format but don't show errors
            const result = validateField(fieldName, value, context);
            
            // Update isValid for button enabling, but don't show visual feedback
            updateField(fieldName, { 
                isValid: result.isValid,
                hasError: false, // Don't show errors until blur
                error: null
            });
        } else {
            // Validate other fields normally with visual feedback
            validateFieldValue(fieldName, value);
        }
        
        // If password field changes, re-validate confirm password field
        if (fieldName === "password" && fields.confirmPassword?.hasTyped) {
            const confirmPasswordValue = fields.confirmPassword.value;
            const passwordValue = value;
            const validationContext = { ...context, password: passwordValue };
            const result = validateField("confirmPassword", confirmPasswordValue, validationContext);
            
            // Silent validation for confirm password
            updateField("confirmPassword", { 
                isValid: result.isValid,
                hasError: false, // Don't show errors until blur
                error: null
            });
        }
        
        // If password field changes in sign-in mode, validate silently
        if (fieldName === "password" && mode === "signin") {
            const result = validateField("password", value, context);
            updateField("password", { 
                isValid: result.isValid,
                hasError: false, // Never show errors for sign-in password
                error: null
            });
        }
    }, [updateField, fields, validateFieldValue, context, mode, checkedEmails]);

    const handleFieldBlur = useCallback(async (fieldName: string, value: string) => {
        // Don't show errors on blur if user hasn't typed anything
        if (!fields[fieldName]?.hasTyped) {
            return;
        }
        
        // For confirm password, show visual feedback on blur only if password is present and valid
        if (fieldName === "confirmPassword") {
            const passwordValue = fields.password?.value || "";
            const passwordField = fields.password;
            
            // Only show error if password is present and valid
            if (passwordValue && passwordField?.isValid) {
                await validateFieldValue(fieldName, value, { password: passwordValue });
            } else {
                // Don't show error if password is missing or invalid
                updateField(fieldName, {
                    value,
                    hasError: false,
                    error: null,
                    isValid: false,
                    isChecking: false
                });
            }
        } else if (fieldName === "email" && mode === "signin") {
            // Show visual feedback for sign-in email on blur
            const result = validateField(fieldName, value, context);
            const trimmedEmail = value.trim();
            
            if (result.isValid) {
                // Check if we have a cached result for this email
                const existingResult = checkedEmails.get(trimmedEmail);
                if (existingResult) {
                    // Use cached result - show visual feedback immediately
                    updateField(fieldName, {
                        value,
                        hasError: !existingResult.isValid,
                        error: existingResult.error || null,
                        isValid: existingResult.isValid,
                        isChecking: false
                    });
                } else {
                    // No cached result, perform DB check
                    await validateFieldValue(fieldName, value);
                }
            } else {
                // Show error if user has typed something but format is invalid
                if (value.trim()) {
                    updateField(fieldName, {
                        value,
                        hasError: true,
                        error: result.error || "Please enter a valid email address",
                        isValid: false,
                        isChecking: false
                    });
                } else {
                    // Don't show error if field is empty
                    updateField(fieldName, {
                        value,
                        hasError: false,
                        error: null,
                        isValid: false,
                        isChecking: false
                    });
                }
            }
        } else if (fieldName === "password" && mode === "signin") {
            // Show visual feedback for sign-in password on blur (but never show errors)
            const result = validateField(fieldName, value, context);
            updateField(fieldName, {
                value,
                hasError: false, // Never show errors for sign-in password
                error: null,
                isValid: result.isValid,
                isChecking: false
            });
        } else if (fieldName === "email" && mode === "signup") {
            // Show visual feedback for sign-up email on blur
            const result = validateField(fieldName, value, context);
            const trimmedEmail = value.trim();
            
            if (result.isValid) {
                // Check if we have a cached result for this email
                const existingResult = checkedEmails.get(trimmedEmail);
                if (existingResult) {
                    // Use cached result - show visual feedback immediately
                    updateField(fieldName, {
                        value,
                        hasError: !existingResult.isValid,
                        error: existingResult.error || null,
                        isValid: existingResult.isValid,
                        isChecking: false
                    });
                } else {
                    // No cached result, perform DB check
                    await validateFieldValue(fieldName, value);
                }
            } else {
                // Show error if user has typed something but format is invalid
                if (value.trim()) {
                    updateField(fieldName, {
                        value,
                        hasError: true,
                        error: result.error || "Please enter a valid email address",
                        isValid: false,
                        isChecking: false
                    });
                } else {
                    // Don't show error if field is empty
                    updateField(fieldName, {
                        value,
                        hasError: false,
                        error: null,
                        isValid: false,
                        isChecking: false
                    });
                }
            }
        } else if (fieldName === "password" && mode === "signup") {
            // Show visual feedback for sign-up password on blur
            await validateFieldValue(fieldName, value);
        } else {
            // Always validate on blur to show error for the first time
            await validateFieldValue(fieldName, value);
        }
    }, [updateField, validateFieldValue, fields, context, mode, checkedEmails]);

    const setFieldValue = useCallback(async (fieldName: string, value: string) => {
        updateField(fieldName, { value });
        await validateFieldValue(fieldName, value);
    }, [updateField, validateFieldValue]);

    const setContextValue = useCallback((key: keyof ValidationContext, value: unknown) => {
        setContext(prev => ({ ...prev, [key]: value }));
    }, []);

    const validateAllFields = useCallback(async () => {
        const results: Record<string, ValidationResult> = {};
        
        for (const fieldName of Object.keys(fields)) {
            const field = fields[fieldName];
            updateField(fieldName, { hasTyped: true });
            const result = await validateFieldValue(fieldName, field.value);
            results[fieldName] = result;
        }

        return results;
    }, [fields, updateField, validateFieldValue]);

    const isFormValid = useCallback(() => {
        return Object.values(fields).every(field => field.isValid);
    }, [fields]);

    const getFieldError = useCallback((fieldName: string): string | null => {
        const field = fields[fieldName];
        if (!field?.hasTyped) return null;
        
        return field.hasError ? field.error : null;
    }, [fields]);

    const clearFieldError = useCallback((fieldName: string) => {
        updateField(fieldName, { error: null, hasError: false });
    }, [updateField]);

    const resetForm = useCallback((newValues?: Record<string, string>) => {
        const resetValues = newValues || initialValues;
        const newFields: Record<string, FieldState> = {};
        
        Object.keys(resetValues).forEach(key => {
            newFields[key] = {
                value: resetValues[key] || "",
                hasTyped: false,
                hasError: false,
                error: null,
                isValid: false,
                isChecking: false
            };
        });
        
        setFields(newFields);
        setContext({});
    }, [initialValues]);

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
        resetForm
    };
}; 