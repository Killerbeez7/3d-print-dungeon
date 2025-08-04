const ADJECTIVES = [
    "cool",
    "awesome",
    "super",
    "mega",
    "epic",
    "rad",
    "sweet",
    "amazing",
    "fantastic",
    "brilliant",
    "clever",
    "smart",
    "quick",
    "fast",
    "swift",
    "brave",
    "bold",
    "creative",
    "artistic",
    "talented",
    "skilled",
    "expert",
    "master",
    "pro",
    "elite",
    "premium",
    "golden",
    "silver",
    "platinum",
];
const NOUNS = [
    "user",
    "creator",
    "artist",
    "designer",
    "maker",
    "builder",
    "developer",
    "coder",
    "hacker",
    "guru",
    "master",
    "expert",
    "pro",
    "legend",
    "hero",
    "warrior",
    "knight",
    "wizard",
    "mage",
    "archer",
    "fighter",
    "ninja",
    "samurai",
    "viking",
    "dragon",
    "phoenix",
    "eagle",
    "wolf",
    "tiger",
];

// Generates a random username using adjective + noun + number pattern
export const generateRandomUsername = () => {
    const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const number = Math.floor(Math.random() * 1000);

    return `${adjective}${noun}${number}`;
};

// Generates a random username using UUID pattern
export const generateUUIDUsername = () => {
    const uuid =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
    return `user_${uuid}`;
};
