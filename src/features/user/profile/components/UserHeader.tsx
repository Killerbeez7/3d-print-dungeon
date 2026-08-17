import { getAvatarUrlWithCacheBust } from "@/utils/avatarUtils";

import { FaFacebook, FaInstagram, FaXTwitter, FaGlobe } from "react-icons/fa6";
import { FaExternalLinkAlt } from "react-icons/fa";

import type { PublicProfile } from "../types/profile";

const socialPlatforms = [
  {
    key: "twitter",
    name: "Twitter",
    icon: FaXTwitter,
    color: "hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/20",
    bgColor: "bg-blue-500/5",
    borderColor: "border-blue-500/20",
    textColor: "text-blue-500",
  },
  {
    key: "instagram",
    name: "Instagram",
    icon: FaInstagram,
    color: "hover:bg-pink-500/10 hover:text-pink-500 hover:border-pink-500/20",
    bgColor: "bg-pink-500/5",
    borderColor: "border-pink-500/20",
    textColor: "text-pink-500",
  },
  {
    key: "facebook",
    name: "Facebook",
    icon: FaFacebook,
    color: "hover:bg-blue-600/10 hover:text-blue-600 hover:border-blue-600/20",
    bgColor: "bg-blue-600/5",
    borderColor: "border-blue-600/20",
    textColor: "text-blue-600",
  },

  {
    key: "website",
    name: "Website",
    icon: FaGlobe,
    color: "hover:bg-accent-soft hover:text-accent-text hover:border-accent/25",
    bgColor: "bg-accent-soft",
    borderColor: "border-accent/25",
    textColor: "text-accent-text",
  },
];

interface UserHeaderProps {
  user: PublicProfile;
}

export const UserHeader = ({ user }: UserHeaderProps) => {
  const avatarUrl = getAvatarUrlWithCacheBust(user.photoURL);

  // Get available social links
  const availableSocialLinks = socialPlatforms.filter((platform) => {
    if (platform.key === "website") {
      return user.website;
    }
    return user.socialLinks?.[platform.key as keyof typeof user.socialLinks];
  });

  const hasSocialLinks = availableSocialLinks.length > 0;

  return (
    <div className="bg-section rounded-lg p-4 sm:p-6 shadow-md">
      <div className="flex items-start space-x-6">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-surface-card">
            <img
              src={avatarUrl}
              alt={user.displayName || "User Avatar"}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl">{user.displayName}</h1>
              <div className="text-txt-secondary text-sm">@{user.username}</div>
              {user.bio && <p className="mb-6 text-lg text-txt-secondary">{user.bio}</p>}
            </div>
          </div>

          {/* User Stats */}
          <div className="flex space-x-4 sm:space-x-6 md:space-x-8 mt-4">
            <div className="text-center">
              <div className="mb-1 text-2xl font-bold text-txt-primary">
                {user.stats.uploadsCount}
              </div>
              <div className="text-xs text-txt-secondary sm:text-sm">Uploads</div>
            </div>
            <div className="text-center">
              <div className="mb-1 text-2xl font-bold text-txt-primary">
                {user.stats.followersCount}
              </div>
              <div className="text-xs text-txt-secondary sm:text-sm">Followers</div>
            </div>
            <div className="text-center">
              <div className="mb-1 text-2xl font-bold text-txt-primary">
                {user.stats.likesCount}
              </div>
              <div className="text-xs text-txt-secondary sm:text-sm">Likes</div>
            </div>
          </div>

          {/* Social Links - Beautiful UI with Icons */}
          {hasSocialLinks && (
            <div className="mt-6">
              <div className="flex flex-wrap gap-3">
                {availableSocialLinks.map((platform) => {
                  const IconComponent = platform.icon;
                  const url =
                    platform.key === "website"
                      ? user.website
                      : user.socialLinks?.[platform.key as keyof typeof user.socialLinks];

                  if (!url) return null;

                  return (
                    <a
                      key={platform.key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`
                                                group relative flex items-center gap-2 px-3 py-2 
                                                rounded-lg border transition-all duration-200 
                                                ${platform.bgColor} ${platform.borderColor} 
                                                ${platform.color}
                                                hover:scale-105 hover:shadow-md
                                            `}
                      title={`Visit ${platform.name}`}
                    >
                      {IconComponent && (
                        <IconComponent
                          className={`w-4 h-4 ${platform.textColor} transition-colors`}
                        />
                      )}
                      <span className="text-sm font-medium text-txt-secondary group-hover:text-txt-primary transition-colors">
                        {platform.name}
                      </span>
                      <FaExternalLinkAlt className="w-3 h-3 text-txt-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
