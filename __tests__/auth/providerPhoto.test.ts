import { describe, expect, it } from "vitest";

import { googlePhotoURL, photoToSync } from "@/features/auth/utils/providerPhoto";

const OLD = "https://lh3.googleusercontent.com/a/old=s96-c";
const NEW = "https://lh3.googleusercontent.com/a/new=s96-c";
const UPLOADED =
  "https://firebasestorage.googleapis.com/v0/b/demo/o/users%2Fu1%2Fprofile?alt=media";

describe("googlePhotoURL", () => {
  it("reads the Google account's photo", () => {
    const user = {
      providerData: [
        { providerId: "password", photoURL: null },
        { providerId: "google.com", photoURL: NEW },
      ],
    } as never;
    expect(googlePhotoURL(user)).toBe(NEW);
    expect(googlePhotoURL({ providerData: [] } as never)).toBeNull();
    expect(googlePhotoURL(null)).toBeNull();
  });
});

describe("photoToSync", () => {
  it("replaces an older Google photo or an empty one", () => {
    expect(photoToSync(OLD, NEW)).toBe(NEW);
    expect(photoToSync(null, NEW)).toBe(NEW);
    expect(photoToSync("", NEW)).toBe(NEW);
  });

  it("never replaces a photo uploaded on the site", () => {
    expect(photoToSync(UPLOADED, NEW)).toBeNull();
  });

  it("does nothing when already current or there is no Google photo", () => {
    expect(photoToSync(NEW, NEW)).toBeNull();
    expect(photoToSync(OLD, null)).toBeNull();
  });
});
