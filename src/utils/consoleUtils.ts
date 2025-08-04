export const suppressFirebaseCOOPErrors = (): void => {
    // Store original console methods
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    const originalConsoleLog = console.log;

    // Helper function to check if error should be suppressed
    const shouldSuppress = (message: string, stack?: string): boolean => {
        const messageStr = message.toString();
        const stackStr = (stack || "").toString();

        return (
            messageStr.includes("Cross-Origin-Opener-Policy") ||
            messageStr.includes("window.closed") ||
            messageStr.includes("window.close")
        ) && (
                messageStr.includes("firebase_auth.js") ||
                stackStr.includes("firebase_auth.js") ||
                stackStr.includes("poll")
            );
    };

    // Override console.error
    console.error = (...args) => {
        const message = args[0];
        const stack = args[1];

        if (shouldSuppress(message, stack)) {
            return;
        }

        originalConsoleError.apply(console, args);
    };

    // Override console.warn
    console.warn = (...args) => {
        const message = args[0];
        const stack = args[1];

        if (shouldSuppress(message, stack)) {
            return;
        }

        originalConsoleWarn.apply(console, args);
    };

    // Override console.log (in case Firebase logs these as regular logs)
    console.log = (...args) => {
        const message = args[0];
        const stack = args[1];

        if (shouldSuppress(message, stack)) {
            return;
        }

        originalConsoleLog.apply(console, args);
    };
};


export const restoreConsoleError = (): void => {
    // This would need to be called if you want to restore original behavior
    // For now, we keep the suppression active
}; 