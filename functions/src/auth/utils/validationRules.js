export const VALIDATION_RULES = {
    username: {
        minLength: 3,
        maxLength: 20,
        pattern: /^[a-zA-Z0-9_-]+$/,
        reserved: [
            "admin",
            "administrator",
            "root",
            "system",
            "support",
            "help",
            "info",
            "api",
            "www",
            "mail",
            "ftp",
        ],
        debounceMs: 300,
    },
    password: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        requireSpecial: false,
    },
    email: {
        pattern: /^[^@]+@[^@]+\.[^@]+$/,
    },
};