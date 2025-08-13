const ADJECTIVES = [
    "vivid",
    "radiant",
    "luminous",
    "bold",
    "brave",
    "clever",
    "crafty",
    "creative",
    "curious",
    "elegant",
    "epic",
    "fearless",
    "glossy",
    "golden",
    "granite",
    "innovative",
    "kinetic",
    "masterful",
    "nimble",
    "polished",
    "precise",
    "prime",
    "refined",
    "sleek",
    "stellar",
    "swift",
    "tactile",
    "vintage",
];
const NOUNS = [
    "artist",
    "artisan",
    "builder",
    "creator",
    "designer",
    "forger",
    "foundry",
    "guild",
    "maker",
    "modeler",
    "sculptor",
    "smith",
    "studio",
    "workshop",
    // 3D-specific
    "mesh",
    "vertex",
    "poly",
    "voxel",
    "resin",
    "filament",
    "nozzle",
    "forge",
    "atelier",
];

const pickRandom = (list) => list[Math.floor(Math.random() * list.length)];
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const MAX_LEN = 20;

// Generates a human-friendly username using adjective-noun-number pattern
export const generateRandomUsername = () => {
    const adjective = pickRandom(ADJECTIVES);
    const noun = pickRandom(NOUNS);
    const num2 = Math.floor(10 + Math.random() * 90); // 2 digits

    const candidates = [
        `${adjective}-${noun}-${num2}`,
        `${adjective.slice(0, 3)}-${noun}-${num2}`,
        `${noun}-${num2}`,
    ].map(slugify);

    for (const cand of candidates) {
        if (cand.length <= MAX_LEN) return cand;
    }
    // Last resort: hard trim to MAX_LEN
    return candidates[0].slice(0, MAX_LEN);
};

// Generates a random username using UUID pattern
export const generateUUIDUsername = () => {
    const uuid =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
    return `user_${uuid}`;
};

// Generates a username from a display name (friendly, sanitized, length-capped)
export const generateUsername = (displayName = "") => {
    const base = String(displayName || "")
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "") // strip diacritics
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    // If base too short, fall back to adjective-noun-number
    if (!base || base.length < 3) return generateRandomUsername();

    // Ensure max length
    const trimmed = base.length > MAX_LEN ? base.slice(0, MAX_LEN) : base;
    return trimmed;
};
