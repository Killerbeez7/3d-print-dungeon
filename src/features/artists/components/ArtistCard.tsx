import { Link } from "react-router-dom";
import { ArtistCardProps } from "../types/artists";

export function ArtistCard({ uid, displayName, photoURL, bio }: ArtistCardProps) {
    const name = displayName || "Anonymous";
    return (
        <Link
            to={`/artists/${uid}`}
            className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md group"
            aria-label={`View profile for ${name}`}
        >
            <article className="relative bg-bg-surface border border-br-primary rounded-md overflow-hidden shadow-sm transition-transform duration-300 ease-[cubic-bezier(.4,0,.2,1)] group-hover:shadow-xl group-hover:scale-[1.035] group-focus:shadow-xl group-focus:scale-[1.035]">
                <img
                    src={photoURL || "/user.png"}
                    alt={name}
                    className="w-full h-48 object-cover bg-bg-secondary"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = "/user.png";
                    }}
                />
                <section className="p-3">
                    <h4 className="text-lg font-semibold mb-1 truncate" title={name}>
                        {name}
                    </h4>
                    <p className="text-txt-secondary text-sm mb-2 line-clamp-2">
                        {bio || "No bio available"}
                    </p>
                </section>
            </article>
        </Link>
    );
}
