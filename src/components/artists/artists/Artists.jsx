import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllArtists } from "../../../services/artistsService";

export const Artists = () => {
    const [artists, setArtists] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArtists = async () => {
            try {
                setLoading(true);
                setArtists(await getAllArtists());
            } catch (error) {
                console.error("Error fetching artists:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchArtists();
    }, []);

    if (loading) {
        return <p className="p-4">Loading artists...</p>;
    }

    return (
        <div className="bg-bg-primary text-txt-primary min-h-screen">
            <section className="relative bg-gradient-to-r from-accent to-accent-hover px-4 py-12">
                <h1 className="text-3xl text-white font-bold text-center">Artists</h1>
            </section>
            <div className="container mx-auto px-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {artists.map((artist) => (
                        <Link key={artist.id} to={`/artist/${artist.id}`}>
                            <article className="relative bg-bg-surface border border-br-primary rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <img
                                    src={artist.photoURL || "/user.png"}
                                    alt={artist.displayName}
                                    style={{
                                        width: "100%",
                                        height: "200px",
                                        objectFit: "cover",
                                    }}
                                />
                                <div className="p-3">
                                    <h2 className="text-lg font-semibold mb-1">
                                        {artist.displayName || "Anonymous"}
                                    </h2>
                                    <p className="text-txt-secondary text-sm mb-2">
                                        {artist.bio || "No bio available"}
                                    </p>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};
