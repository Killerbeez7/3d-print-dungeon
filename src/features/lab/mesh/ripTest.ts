import { loadStorage } from "@/config/firebaseLazy";

/**
 * Rip test: a scrambled preview published on its own, so someone can try to rip it with nothing
 * else on the page (the lab itself downloads the plain model, which would make it too easy).
 * The file goes to the publisher's own folder of converted models, which the storage rules
 * already allow; the link carries the path and the unscramble key, like a page would.
 */
export interface RipTest {
  /** Storage path of the scrambled GLB. */
  path: string;
  key: number;
  amount: number;
  /** Radius of the real model (it is centred at the origin), for framing. */
  radius: number;
}

const PATH = /^models\/converted\/[A-Za-z0-9]{1,128}\/rip-test\/[a-z0-9-]{1,64}\.glb$/;

const toBase64Url = (text: string) => btoa(text).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromBase64Url = (text: string) => atob(text.replace(/-/g, "+").replace(/_/g, "/"));

export function encodeRipTest(test: RipTest): string {
  return toBase64Url(JSON.stringify({ p: test.path, k: test.key, a: test.amount, r: test.radius }));
}

/** The test in a link's `t` parameter, or null when it is missing or malformed. */
export function decodeRipTest(token: string | null): RipTest | null {
  if (!token) return null;
  try {
    const { p, k, a, r } = JSON.parse(fromBase64Url(token)) as Record<string, unknown>;
    if (typeof p !== "string" || !PATH.test(p)) return null;
    if (![k, a, r].every((value) => typeof value === "number" && Number.isFinite(value))) return null;
    return { path: p, key: (k as number) >>> 0, amount: a as number, radius: r as number };
  } catch {
    return null;
  }
}

export async function publishRipTest(
  glb: Blob,
  ownerId: string,
  scramble: { key: number; amount: number },
  radius: number,
): Promise<RipTest> {
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const path = `models/converted/${ownerId}/rip-test/${id}.glb`;
  const { ref, storage, uploadBytes } = await loadStorage();
  await uploadBytes(ref(storage, path), glb, { contentType: "model/gltf-binary" });
  return { path, key: scramble.key, amount: scramble.amount, radius };
}

export async function ripTestUrl(test: RipTest): Promise<string> {
  const { ref, storage, getDownloadURL } = await loadStorage();
  return getDownloadURL(ref(storage, test.path));
}
