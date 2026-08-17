import { Link } from "react-router-dom";
import { ArtistCardProps } from "../types/artists";
import { toUrlSafeUsername } from "@/utils/stringUtils";
import { getAvatarUrlWithCacheBust } from "@/utils/avatarUtils";

export function ArtistCard({ displayName, username, photoURL, bio }: ArtistCardProps) {
  const name = displayName || "Anonymous";
  const urlSafeUsername = toUrlSafeUsername(username);

  return (
    <Link to={`/${urlSafeUsername}`} className="group block h-full cursor-pointer">
      <article className="bg-section border border-br-secondary rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-br-primary transition-all duration-200 h-full flex flex-col">
        {/* Artist Image - High Quality */}
        <div className="relative overflow-hidden bg-surface-card">
          <img
            src={getAvatarUrlWithCacheBust(photoURL)}
            alt={name}
            className="w-full h-56 object-cover transition-all duration-200 group-hover:brightness-105 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
          {/* Subtle hover indicator */}
          <div className="absolute inset-0 bg-gradient-to-t from-inverse/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        </div>

        {/* Artist Info - Flexible with fixed structure */}
        <section className="p-4 flex-1 flex flex-col">
          {/* Artist Name - Fixed Height */}
          <h4
            className="text-lg font-semibold text-txt-primary mb-2 truncate min-h-[1.75rem]"
            title={name}
          >
            {name}
          </h4>

          {/* Bio - Fixed Height Container */}
          <div className="flex-1 mb-3 min-h-[2.5rem]">
            <p className="text-txt-secondary text-sm line-clamp-2 leading-relaxed">
              {bio || "Artist exploring the world of 3D design and creativity."}
            </p>
          </div>

          {/* Bottom Section - Fixed Height */}
          <div className="flex justify-center items-center min-h-[1.5rem]">
            <span className="text-xs text-txt-muted">@{username || "artist"}</span>
          </div>
        </section>
      </article>
    </Link>
  );
}
