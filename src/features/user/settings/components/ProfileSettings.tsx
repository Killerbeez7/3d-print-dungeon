import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { profileService } from "@/features/user/settings/services/profileService";
import { countries } from "@/data/countries";
import { AlertModal } from "@/features/shared/AlertModal";

/**
 * ProfileSettings component for managing user profile information.
 */
export const ProfileSettings = () => {
    const { currentUser } = useAuth();
    const [displayName, setDisplayName] = useState<string>(currentUser?.displayName || "");
    const [email, setEmail] = useState<string>(currentUser?.email || "");
    const [isEmailPublic, setIsEmailPublic] = useState<boolean>(false);
    const [city, setCity] = useState<string>("");
    const [country, setCountry] = useState<string>("");
    const [bio, setBio] = useState<string>("");
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

    // Social media states
    const [facebook, setFacebook] = useState<string>("");
    const [twitter, setTwitter] = useState<string>("");
    const [instagram, setInstagram] = useState<string>("");
    const [linkedin, setLinkedin] = useState<string>("");

    useEffect(() => {
        const loadProfileData = async () => {
            if (!currentUser?.uid) return;

            try {
                const profileData = await profileService.getProfileData(currentUser.uid);
                if (profileData) {
                    setCity(profileData.city || "");
                    setCountry(profileData.country || "");
                    setBio(profileData.bio || "");
                    setIsEmailPublic(Boolean(profileData.isEmailPublic));

                    // Load social media data
                    if (profileData.socials) {
                        setFacebook(profileData.socials.facebook || "");
                        setTwitter(profileData.socials.twitter || "");
                        setInstagram(profileData.socials.instagram || "");
                        setLinkedin(profileData.socials.linkedin || "");
                    }
                }
            } catch (err) {
                console.error("Error loading profile data:", err);
                setError("Failed to load profile data. Please try again.");
            }
        };

        loadProfileData();
    }, [currentUser]);

    const handleProfilePictureChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProfilePicture(e.target.files[0]);
        }
    };

    const handleCoverPhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setCoverPhoto(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!currentUser) {
                setError("User not authenticated.");
                setLoading(false);
                return;
            }
            const profileData = {
                displayName,
                email,
                isEmailPublic,
                city,
                country,
                bio,
                socials: {
                    facebook,
                    twitter,
                    instagram,
                    linkedin,
                },
            };

            await profileService.updateProfile(
                currentUser,
                profileData,
                profilePicture,
                coverPhoto
            );

            setProfilePicture(null);
            setCoverPhoto(null);
            setShowSuccessModal(true);
        } catch (err) {
            console.error("Error updating profile:", err);
            setError("Failed to update profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Helper to get coverURL if present
    const getCoverUrl = (): string => {
        if (currentUser && typeof currentUser === "object" && "coverURL" in currentUser) {
            const cover = (currentUser as { coverURL?: string }).coverURL;
            return typeof cover === "string" ? cover : "";
        }
        return "";
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-txt-primary">Profile Settings</h2>

            {error && (
                <div className="p-4 bg-bg-reverse border border-error text-error rounded-md">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 divider-top-left pt-4">
                {/* User's Info Section */}
                <div>
                    <h4 className="mb-6 font-semibold text-txt-primary">User</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="displayName" className="block text-sm font-medium text-txt-secondary">Display Name</label>
                            <input
                                type="text"
                                id="displayName"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="mt-1 block w-full rounded-md spellcheck-disabled border border-br-primary bg-bg-secondary px-3 py-2 text-txt-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-txt-secondary">Email</label>
                            <input
                                type="text"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full rounded-md spellcheck-disabled border border-br-primary bg-bg-secondary px-3 py-2 text-txt-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                                required
                            />
                            <div className="mt-2 flex items-center">
                                <input
                                    type="checkbox"
                                    id="isEmailPublic"
                                    checked={isEmailPublic}
                                    onChange={(e) => setIsEmailPublic(e.target.checked)}
                                    className="h-4 w-4 rounded spellcheck-disabled border-br-primary text-accent focus:ring-accent"
                                />
                                <label htmlFor="isEmailPublic" className="ml-2 block text-sm text-txt-secondary">Public Email</label>
                            </div>
                        </div>
                    </div>
                    <div className="md:mt-0 mt-6">
                        <label htmlFor="bio" className="block text-sm font-medium text-txt-secondary">Short Bio</label>
                        <textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={3}
                            className="mt-1 block w-full rounded-md spellcheck-disabled border border-br-primary bg-bg-secondary px-3 py-2 text-txt-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                            placeholder="A quick glimpse of who you are and what you do...."
                        />
                    </div>
                </div>
                {/* Social Section */}
                <div className="mt-16">
                    <h4 className="mb-6 font-semibold text-txt-primary">Social</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="facebook" className="block text-sm font-medium text-txt-secondary">Facebook</label>
                            <input
                                type="text"
                                id="facebook"
                                value={facebook}
                                onChange={(e) => setFacebook(e.target.value)}
                                className="mt-1 block w-full rounded-md spellcheck-disabled border border-br-primary bg-bg-secondary px-3 py-2 text-txt-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                            />
                        </div>
                        <div>
                            <label htmlFor="twitter" className="block text-sm font-medium text-txt-secondary">Twitter</label>
                            <input
                                type="text"
                                id="twitter"
                                value={twitter}
                                onChange={(e) => setTwitter(e.target.value)}
                                className="mt-1 block w-full rounded-md spellcheck-disabled border border-br-primary bg-bg-secondary px-3 py-2 text-txt-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                            />
                        </div>
                        <div>
                            <label htmlFor="instagram" className="block text-sm font-medium text-txt-secondary">Instagram</label>
                            <input
                                type="text"
                                id="instagram"
                                value={instagram}
                                onChange={(e) => setInstagram(e.target.value)}
                                className="mt-1 block w-full rounded-md spellcheck-disabled border border-br-primary bg-bg-secondary px-3 py-2 text-txt-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                            />
                        </div>
                        <div>
                            <label htmlFor="linkedin" className="block text-sm font-medium text-txt-secondary">LinkedIn</label>
                            <input
                                type="text"
                                id="linkedin"
                                value={linkedin}
                                onChange={(e) => setLinkedin(e.target.value)}
                                className="mt-1 block w-full rounded-md border spellcheck-disabled border-br-primary bg-bg-secondary px-3 py-2 text-txt-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                            />
                        </div>
                    </div>
                </div>
                {/* Location Section */}
                <div className="mt-16">
                    <h4 className="mb-6 font-semibold text-txt-primary">Location</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-txt-secondary">City</label>
                            <input
                                type="text"
                                id="city"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="mt-1 block w-full rounded-md border spellcheck-disabled border-br-primary bg-bg-secondary px-3 py-2 text-txt-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                            />
                        </div>
                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-txt-secondary">Country</label>
                            <select
                                id="country"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="mt-1 block w-full rounded-md border spellcheck-disabled border-br-primary bg-bg-secondary px-3 py-2 text-txt-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
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
                {/* Appearance Section */}
                <div className="mt-16">
                    <h4 className="mb-6 font-semibold text-txt-primary">Appearance</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Profile Picture */}
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-txt-secondary">Profile Picture</label>
                            <div className="flex flex-col space-y-4">
                                <div className="h-32 w-32 rounded-full overflow-hidden bg-bg-secondary">
                                    <img
                                        src={currentUser?.photoURL || "/user.png"}
                                        alt="Profile"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleProfilePictureChange}
                                    className="block w-full text-sm spellcheck-disabled text-txt-secondary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent/90"
                                />
                            </div>
                        </div>
                        {/* Cover Photo */}
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-txt-secondary">Cover Photo</label>
                            <div className="flex flex-col space-y-4">
                                <div className="h-48 w-full overflow-hidden rounded-lg bg-bg-secondary">
                                    {getCoverUrl() ? (
                                        <img
                                            src={getCoverUrl()}
                                            alt="Cover"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-txt-secondary">
                                            No cover photo
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleCoverPhotoChange}
                                    className="block w-full text-sm spellcheck-disabled text-txt-secondary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent/90"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {/* Submit Button */}
                <div className="flex justify-start pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 cta-button disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
            <AlertModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title="Success"
                message="Your profile has been updated successfully!"
            />
        </div>
    );
}; 