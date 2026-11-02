/**
 * Who was signed in on this browser last time, so the header can show the
 * right buttons on reload before Firebase has restored the session. Only
 * public profile details are kept, never the email address.
 */
export interface SessionHint {
  displayName: string;
  username: string | null;
  photoURL: string | null;
}

const KEY = "session-hint-v1";

export const readSessionHint = (): SessionHint | null => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const hint = JSON.parse(raw) as SessionHint;
    return typeof hint?.displayName === "string" ? hint : null;
  } catch {
    return null;
  }
};

export const writeSessionHint = (hint: SessionHint): void => {
  try {
    localStorage.setItem(KEY, JSON.stringify(hint));
  } catch {
    // Storage blocked: the header falls back to waiting for Firebase.
  }
};

export const clearSessionHint = (): void => {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
};
