import { useEffect, useRef, useState, type ChangeEvent } from "react";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useSystemAlert } from "@/features/system-alerts";
import { profileService } from "@/features/user/settings/services/profileService";

import { STATIC_ASSETS } from "@/config/assetsConfig";
import { countries } from "@/data/countries";
import { getAvatarUrlWithCacheBust } from "@/utils/avatarUtils";

import type { ProfileSettingsData } from "../types/settings";

import { SaveChanges } from "./parts/SaveChanges";

interface OriginalProfileData {
  displayName: string;
  city: string;
  country: string;
  bio: string;
  facebook: string;
  twitter: string;
  instagram: string;
}

const EMPTY_PROFILE_DATA: OriginalProfileData = {
  displayName: "",
  city: "",
  country: "",
  bio: "",
  facebook: "",
  twitter: "",
  instagram: "",
};

const parseLocation = (
  location?: string | null
): {
  city: string;
  country: string;
} => {
  if (!location) {
    return {
      city: "",
      country: "",
    };
  }

  const parts = location.split(", ");

  if (parts.length < 2) {
    return {
      city: location,
      country: "",
    };
  }

  return {
    city: parts[0],
    country: parts.slice(1).join(", "),
  };
};

export const ProfileSettings = () => {
  const { authUser, currentUser, publicProfile } = useAuth();

  const { success, error: showError } = useSystemAlert();

  const profilePictureInputRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState("");

  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [bio, setBio] = useState("");

  const [facebook, setFacebook] = useState("");
  const [twitter, setTwitter] = useState("");
  const [instagram, setInstagram] = useState("");

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreviewUrl, setProfilePicturePreviewUrl] = useState<
    string | null
  >(null);

  const [photoURL, setPhotoURL] = useState<string | null>(
    authUser?.photoURL ?? currentUser?.photoURL ?? null
  );

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [originalData, setOriginalData] =
    useState<OriginalProfileData>(EMPTY_PROFILE_DATA);

  const avatarUrl = getAvatarUrlWithCacheBust(
    photoURL ?? authUser?.photoURL ?? publicProfile?.photoURL ?? currentUser?.photoURL
  );
  const displayedAvatarUrl = profilePicturePreviewUrl ?? avatarUrl;

  const hasChanges =
    profilePicture !== null ||
    displayName !== originalData.displayName ||
    city !== originalData.city ||
    country !== originalData.country ||
    bio !== originalData.bio ||
    facebook !== originalData.facebook ||
    twitter !== originalData.twitter ||
    instagram !== originalData.instagram;

  useEffect(() => {
    const loadProfileData = async () => {
      if (!currentUser?.uid) {
        return;
      }

      try {
        const { publicData } = await profileService.getProfileData(currentUser.uid);

        const { city: cityValue, country: countryValue } = parseLocation(
          publicData?.location
        );

        const displayNameValue = publicData?.displayName ?? currentUser.displayName ?? "";

        const bioValue = publicData?.bio ?? "";

        const facebookValue = publicData?.socialLinks?.facebook ?? "";

        const twitterValue = publicData?.socialLinks?.twitter ?? "";

        const instagramValue = publicData?.socialLinks?.instagram ?? "";

        setDisplayName(displayNameValue);

        setCity(cityValue);
        setCountry(countryValue);
        setBio(bioValue);

        setFacebook(facebookValue);
        setTwitter(twitterValue);
        setInstagram(instagramValue);

        setPhotoURL(publicData?.photoURL ?? currentUser.photoURL ?? null);

        setOriginalData({
          displayName: displayNameValue,
          city: cityValue,
          country: countryValue,
          bio: bioValue,
          facebook: facebookValue,
          twitter: twitterValue,
          instagram: instagramValue,
        });
      } catch (caughtError) {
        console.error("Error loading profile data:", caughtError);

        const message = "Failed to load profile data. Please try again.";

        setError(message);

        showError("Profile Load Error", message);
      }
    };

    loadProfileData();
  }, [currentUser, showError]);

  useEffect(() => {
    if (!profilePicture) {
      setProfilePicturePreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(profilePicture);

    setProfilePicturePreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [profilePicture]);

  const handleProfilePictureChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setProfilePicture(file);
  };

  const clearProfilePicture = () => {
    setProfilePicture(null);

    if (profilePictureInputRef.current) {
      profilePictureInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!currentUser || !hasChanges) {
      return;
    }

    setLoading(true);
    setError(null);

    const profileData: ProfileSettingsData = {
      displayName: displayName.trim(),

      city: city.trim(),

      country: country.trim(),

      bio: bio.trim(),

      socials: {
        facebook: facebook.trim(),

        twitter: twitter.trim(),

        instagram: instagram.trim(),
      },
    };

    try {
      const result = await profileService.updateProfile(
        currentUser,
        profileData,
        profilePicture
      );

      setDisplayName(profileData.displayName);

      setCity(profileData.city);
      setCountry(profileData.country);
      setBio(profileData.bio);

      setFacebook(profileData.socials.facebook ?? "");

      setTwitter(profileData.socials.twitter ?? "");

      setInstagram(profileData.socials.instagram ?? "");

      setPhotoURL(result.photoURL);

      setOriginalData({
        displayName: profileData.displayName,

        city: profileData.city,

        country: profileData.country,

        bio: profileData.bio,

        facebook: profileData.socials.facebook ?? "",

        twitter: profileData.socials.twitter ?? "",

        instagram: profileData.socials.instagram ?? "",
      });

      clearProfilePicture();

      success("Profile Updated", "Your profile has been updated successfully!");
    } catch (caughtError) {
      console.error("Error updating profile:", caughtError);

      const message = "Failed to update profile. Please try again.";

      setError(message);

      showError("Profile Update Error", message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDisplayName(originalData.displayName);

    setCity(originalData.city);

    setCountry(originalData.country);

    setBio(originalData.bio);

    setFacebook(originalData.facebook);

    setTwitter(originalData.twitter);

    setInstagram(originalData.instagram);

    clearProfilePicture();
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-txt-primary mb-2">Profile Settings</h2>

        <p className="text-txt-secondary text-sm">
          Manage your profile information and appearance
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-error/40 bg-error/10 p-4 text-sm text-txt-primary">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Profile Images */}
        <div className="overflow-hidden rounded-xl border border-br-subtle bg-surface-card">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-txt-primary mb-4">
              Profile picture
            </h3>

            <div>
              {/* Profile Picture */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-txt-secondary">
                  Profile Picture
                </label>

                <div className="flex flex-col space-y-4">
                  <div className="chamfer size-32 overflow-hidden bg-muted [--cut:18px]">
                    <img
                      src={displayedAvatarUrl}
                      alt="Profile avatar"
                      referrerPolicy="no-referrer"
                      onError={(event) => {
                        const image = event.currentTarget;

                        if (image.src.endsWith(STATIC_ASSETS.DEFAULT_AVATAR)) {
                          return;
                        }

                        image.src = STATIC_ASSETS.DEFAULT_AVATAR;
                      }}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <input
                    ref={profilePictureInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    disabled={loading}
                    className="block w-full text-sm spellcheck-disabled text-txt-secondary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-btn-primary file:text-btn-primary-text hover:file:bg-btn-primary-hover disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="overflow-hidden rounded-xl border border-br-subtle bg-surface-card">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-txt-primary mb-4">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="displayName"
                  className="block text-sm font-medium text-txt-secondary mb-1"
                >
                  Display Name
                </label>

                <input
                  type="text"
                  id="displayName"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  className="h-11 w-full rounded-lg border border-br-input bg-page px-3 text-sm text-txt-primary placeholder:text-txt-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-txt-secondary mb-1"
                >
                  Email Address
                </label>

                <input
                  type="email"
                  id="email"
                  value={currentUser?.email ?? ""}
                  readOnly
                  className="w-full px-3 py-2 rounded-md border border-br-primary bg-section text-txt-secondary cursor-not-allowed"
                />

                <p className="mt-2 text-xs text-txt-muted">
                  Email visibility is managed from Privacy Settings.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-txt-secondary mb-1"
              >
                Bio
              </label>

              <textarea
                id="bio"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                rows={3}
                className="h-11 w-full rounded-lg border border-br-input bg-page px-3 text-sm text-txt-primary placeholder:text-txt-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="overflow-hidden rounded-xl border border-br-subtle bg-surface-card">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-txt-primary mb-4">Location</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-txt-secondary mb-1"
                >
                  City
                </label>

                <input
                  type="text"
                  id="city"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className="h-11 w-full rounded-lg border border-br-input bg-page px-3 text-sm text-txt-primary placeholder:text-txt-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
                />
              </div>

              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-txt-secondary mb-1"
                >
                  Country
                </label>

                <select
                  id="country"
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  className="h-11 w-full rounded-lg border border-br-input bg-page px-3 text-sm text-txt-primary placeholder:text-txt-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
                >
                  <option value="">Select a country</option>

                  {countries.map((countryName) => (
                    <option key={countryName} value={countryName}>
                      {countryName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="overflow-hidden rounded-xl border border-br-subtle bg-surface-card">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-txt-primary mb-4">Social Media</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="facebook"
                  className="block text-sm font-medium text-txt-secondary mb-1"
                >
                  Facebook
                </label>

                <input
                  type="url"
                  id="facebook"
                  value={facebook}
                  onChange={(event) => setFacebook(event.target.value)}
                  className="h-11 w-full rounded-lg border border-br-input bg-page px-3 text-sm text-txt-primary placeholder:text-txt-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
                  placeholder="https://facebook.com/username"
                />
              </div>

              <div>
                <label
                  htmlFor="twitter"
                  className="block text-sm font-medium text-txt-secondary mb-1"
                >
                  Twitter
                </label>

                <input
                  type="url"
                  id="twitter"
                  value={twitter}
                  onChange={(event) => setTwitter(event.target.value)}
                  className="h-11 w-full rounded-lg border border-br-input bg-page px-3 text-sm text-txt-primary placeholder:text-txt-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
                  placeholder="https://twitter.com/username"
                />
              </div>

              <div>
                <label
                  htmlFor="instagram"
                  className="block text-sm font-medium text-txt-secondary mb-1"
                >
                  Instagram
                </label>

                <input
                  type="url"
                  id="instagram"
                  value={instagram}
                  onChange={(event) => setInstagram(event.target.value)}
                  className="h-11 w-full rounded-lg border border-br-input bg-page px-3 text-sm text-txt-primary placeholder:text-txt-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
                  placeholder="https://instagram.com/username"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <SaveChanges
        hasChanges={hasChanges}
        loading={loading}
        onSave={handleSave}
        onReset={handleReset}
      />
    </div>
  );
};
