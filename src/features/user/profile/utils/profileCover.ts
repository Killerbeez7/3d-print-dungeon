/** Stable 0-100 numbers from a seed, so each cover looks different. */
const seededPositions = (seed: string): number[] => {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return [hash % 100, (hash >> 7) % 100, (hash >> 14) % 100, (hash >> 21) % 100];
};

/** Generated cover art: an accent and an ember glow placed by the username. */
export const profileCoverBackground = (seed: string): string => {
  const [ax, ay, ex, ey] = seededPositions(seed);
  return `radial-gradient(640px circle at ${ax}% ${ay}%, rgba(var(--accent-rgb), 0.35), transparent 60%), radial-gradient(520px circle at ${ex}% ${ey}%, rgba(var(--ember-rgb), 0.22), transparent 60%)`;
};
