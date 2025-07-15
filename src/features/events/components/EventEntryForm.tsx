import { useState } from "react";
import type { EventEntry } from "@/types/event";

export const EventEntryForm = ({
    onSubmit,
}: {
    onSubmit: (entry: Omit<EventEntry, "id">) => void;
}) => {
    const [userName, setUserName] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!userName.trim() || !imageUrl.trim() || !description.trim()) {
            setError("All fields are required.");
            return;
        }
        onSubmit({
            userName: userName.trim(),
            imageUrl: imageUrl.trim(),
            description: description.trim(),
        });
        setUserName("");
        setImageUrl("");
        setDescription("");
    };

    return (
        <form className="max-w-xl mx-auto py-8 px-6 bg-[var(--bg-surface)] rounded-lg shadow text-center" onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold mb-4">Submit Your Entry</h2>
            {error && <div className="mb-2 text-red-600">{error}</div>}
            <div className="mb-3">
                <label className="block font-semibold mb-1">Your Name *</label>
                <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full border border-[var(--accent)] rounded px-2 py-2 bg-white dark:bg-[#232323] text-[var(--txt-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
                    required
                />
            </div>
            <div className="mb-3">
                <label className="block font-semibold mb-1">Image URL *</label>
                <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full border border-[var(--accent)] rounded px-2 py-2 bg-white dark:bg-[#232323] text-[var(--txt-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
                    required
                />
            </div>
            <div className="mb-3">
                <label className="block font-semibold mb-1">Description *</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-[var(--accent)] rounded px-2 py-2 bg-white dark:bg-[#232323] text-[var(--txt-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
                    required
                />
            </div>
            <button
                type="submit"
                className="mt-4 px-6 py-2 bg-[var(--accent)] text-white rounded font-semibold hover:bg-[var(--accent-hover)] transition"
            >
                Submit Entry
            </button>
        </form>
    );
};
