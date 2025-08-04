export const sanitizeUserInput = (input: string): string => {
    return input
        .trim()
        .replace(/[<>]/g, "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\//g, "&#x2F;");
}; 