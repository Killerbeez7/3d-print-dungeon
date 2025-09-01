import { useState, useEffect, ChangeEvent } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { profileService } from "@/features/user/settings/services/profileService";
import { countries } from "@/data/countries";
import { useSystemAlert } from "@/features/system-alerts";
import { getAvatarUrlWithCacheBust } from "@/utils/avatarUtils";
import { SaveChanges } from "./parts/SaveChanges";

/**
 * ProfileSettings component for managing user profile information.
 */
export const ProfileSettings = () => {
    const { currentUser, publicProfile } = useAuth();
    const { success, error: showError } = useSystemAlert();
    const [displayName, setDisplayName] = useState<string>(publicProfile?.displayName || currentUser?.displayName || "");
    const [email, setEmail] = useState<string>(currentUser?.email || "");
    const [isEmailPublic, setIsEmailPublic] = useState<boolean>(false);
    const [city, setCity] = useState<string>("");
    const [country, setCountry] = useState<string>("");
    const [bio, setBio] = useState<string>("");
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [hasChanges, setHasChanges] = useState<boolean>(false);

    const avatarUrl = getAvatarUrlWithCacheBust(publicProfile?.photoURL || currentUser?.photoURL);

    // Social media states
    const [facebook, setFacebook] = useState<string>("");
    const [twitter, setTwitter] = useState<string>("");
    const [instagram, setInstagram] = useState<string>("");
    const [linkedin, setLinkedin] = useState<string>("");

    // Original data for comparison
    const [originalData, setOriginalData] = useState({
        displayName: "",
        email: "",
        isEmailPublic: false,
        city: "",
        country: "",
        bio: "",
        facebook: "",
        twitter: "",
        instagram: "",
        linkedin: "",
    });

    useEffect(() => {
        const loadProfileData = async () => {
            if (!currentUser?.uid) return;

            try {
                const { publicData } = await profileService.getProfileData(currentUser.uid);
                
                let cityValue = "";
                let countryValue = "";
                
                if (publicData) {
                    // Parse location into city and country
                    if (publicData.location) {
                        const locationParts = publicData.location.split(', ');
                        if (locationParts.length >= 2) {
                            cityValue = locationParts[0];
                            countryValue = locationParts.slice(1).join(', ');
                        } else {
                            cityValue = publicData.location;
                            countryValue = "";
                        }
                    }
                    
                    setBio(publicData.bio || "");
                    
                    // Load social media data
                    if (publicData.socialLinks) {
                        setFacebook(publicData.socialLinks.facebook || "");
                        setTwitter(publicData.socialLinks.twitter || "");
                        setInstagram(publicData.socialLinks.instagram || "");
                        setLinkedin(publicData.socialLinks.linkedin || "");
                    }
                }
                
                // Email comes from Firebase Auth user object
                const emailValue = currentUser.email || "";
                setEmail(emailValue);
                
                const displayNameValue = currentUser.displayName || "";
                setDisplayName(displayNameValue);
                
                setCity(cityValue);
                setCountry(countryValue);
                
                // Set original data for comparison
                setOriginalData({
                    displayName: displayNameValue,
                    email: emailValue,
                    isEmailPublic: false,
                    city: cityValue,
                    country: countryValue,
                    bio: publicData?.bio || "",
                    facebook: publicData?.socialLinks?.facebook || "",
                    twitter: publicData?.socialLinks?.twitter || "",
                    instagram: publicData?.socialLinks?.instagram || "",
                    linkedin: publicData?.socialLinks?.linkedin || "",
                });
            } catch (err) {
                console.error("Error loading profile data:", err);
                const errorMessage = "Failed to load profile data. Please try again.";
                setError(errorMessage);
                showError("Profile Load Error", errorMessage);
            }
        };

        loadProfileData();
    }, [currentUser, showError]);

    // Check for changes
    useEffect(() => {
        const currentData = {
            displayName,
            email,
            isEmailPublic,
            city,
            country,
            bio,
            facebook,
            twitter,
            instagram,
            linkedin,
        };
        const hasChanges = JSON.stringify(currentData) !== JSON.stringify(originalData);
        setHasChanges(hasChanges);
    }, [displayName, email, isEmailPublic, city, country, bio, facebook, twitter, instagram, linkedin, originalData]);

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

    const handleSave = async () => {
        setLoading(true);
        setError(null);

        try {
            if (!currentUser) {
                const errorMessage = "User not authenticated.";
                setError(errorMessage);
                showError("Authentication Error", errorMessage);
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
            
            // Update original data
            setOriginalData({
                displayName,
                email,
                isEmailPublic,
                city,
                country,
                bio,
                facebook,
                twitter,
                instagram,
                linkedin,
            });
            setHasChanges(false);
            
            success("Profile Updated", "Your profile has been updated successfully!");
        } catch (err) {
            console.error("Error updating profile:", err);
            const errorMessage = "Failed to update profile. Please try again.";
            setError(errorMessage);
            showError("Profile Update Error", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setDisplayName(originalData.displayName);
        setEmail(originalData.email);
        setIsEmailPublic(originalData.isEmailPublic);
        setCity(originalData.city);
        setCountry(originalData.country);
        setBio(originalData.bio);
        setFacebook(originalData.facebook);
        setTwitter(originalData.twitter);
        setInstagram(originalData.instagram);
        setLinkedin(originalData.linkedin);
        setHasChanges(false);
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
            <div>
                <h2 className="text-2xl font-bold text-txt-primary mb-2">Profile Settings</h2>
                <p className="text-txt-secondary text-sm">
                    Manage your profile information and appearance
                </p>
            </div>

            {error && (
                <div className="p-4 bg-bg-reverse border border-error text-error rounded-md">
                    {error}
                </div>
            )}

            <div className="space-y-6">
                {/* Profile Images */}
                <div className="bg-bg-surface rounded-lg border border-br-secondary overflow-hidden">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-txt-primary mb-4">Profile Images</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Profile Picture */}
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-txt-secondary">Profile Picture</label>
                                <div className="flex flex-col space-y-4">
                                    <div className="h-32 w-32 rounded-full overflow-hidden bg-bg-secondary border-2 border-br-secondary">
                                        <img
                                            src={avatarUrl}
                                            alt="Profile avatar"
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
                                    <div className="h-48 w-full overflow-hidden rounded-lg bg-bg-secondary border-2 border-br-secondary">
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
                </div>

                {/* Basic Information */}
                <div className="bg-bg-surface rounded-lg border border-br-secondary overflow-hidden">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-txt-primary mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="displayName" className="block text-sm font-medium text-txt-secondary mb-1">
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    id="displayName"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md border border-br-primary bg-bg-secondary text-txt-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-txt-secondary mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md border border-br-primary bg-bg-secondary text-txt-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                                    required
                                />
                                <div className="mt-2 flex items-center">
                                    <input
                                        type="checkbox"
                                        id="isEmailPublic"
                                        checked={isEmailPublic}
                                        onChange={(e) => setIsEmailPublic(e.target.checked)}
                                        className="h-4 w-4 rounded border-br-primary text-accent focus:ring-accent"
                                    />
                                    <label htmlFor="isEmailPublic" className="ml-2 block text-sm text-txt-secondary">
                                        Make email public
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6">
                            <label htmlFor="bio" className="block text-sm font-medium text-txt-secondary mb-1">
                                Bio
                            </label>
                            <textarea
                                id="bio"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 rounded-md border border-br-primary bg-bg-secondary text-txt-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                                placeholder="Tell us about yourself..."
                            />
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div className="bg-bg-surface rounded-lg border border-br-secondary overflow-hidden">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-txt-primary mb-4">Location</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-txt-secondary mb-1">
                                    City
                                </label>
                                <input
                                    type="text"
                                    id="city"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md border border-br-primary bg-bg-secondary text-txt-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                                />
                            </div>
                            <div>
                                <label htmlFor="country" className="block text-sm font-medium text-txt-secondary mb-1">
                                    Country
                                </label>
                                <select
                                    id="country"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md border border-br-primary bg-bg-secondary text-txt-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
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
                <div className="bg-bg-surface rounded-lg border border-br-secondary overflow-hidden">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-txt-primary mb-4">Social Media</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="facebook" className="block text-sm font-medium text-txt-secondary mb-1">
                                    Facebook
                                </label>
                                <input
                                    type="url"
                                    id="facebook"
                                    value={facebook}
                                    onChange={(e) => setFacebook(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md border border-br-primary bg-bg-secondary text-txt-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                                    placeholder="https://facebook.com/username"
                                />
                            </div>
                            <div>
                                <label htmlFor="twitter" className="block text-sm font-medium text-txt-secondary mb-1">
                                    Twitter
                                </label>
                                <input
                                    type="url"
                                    id="twitter"
                                    value={twitter}
                                    onChange={(e) => setTwitter(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md border border-br-primary bg-bg-secondary text-txt-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                                    placeholder="https://twitter.com/username"
                                />
                            </div>
                            <div>
                                <label htmlFor="instagram" className="block text-sm font-medium text-txt-secondary mb-1">
                                    Instagram
                                </label>
                                <input
                                    type="url"
                                    id="instagram"
                                    value={instagram}
                                    onChange={(e) => setInstagram(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md border border-br-primary bg-bg-secondary text-txt-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                                    placeholder="https://instagram.com/username"
                                />
                            </div>
                            <div>
                                <label htmlFor="linkedin" className="block text-sm font-medium text-txt-secondary mb-1">
                                    LinkedIn
                                </label>
                                <input
                                    type="url"
                                    id="linkedin"
                                    value={linkedin}
                                    onChange={(e) => setLinkedin(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md border border-br-primary bg-bg-secondary text-txt-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                                    placeholder="https://linkedin.com/in/username"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Buttons */}
            <SaveChanges
                hasChanges={hasChanges}
                loading={loading}
                onSave={handleSave}
                onReset={handleReset}
            />
        </div>
    );
}; 