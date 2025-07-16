import { useState } from "react";
import type { EventType, Event } from "@/features/events/types/event";

export const EventCreateForm = ({
    onCreate,
}: {
    onCreate: (event: Omit<Event, "id">) => void;
}) => {
    const [title, setTitle] = useState("");
    const [type, setType] = useState<EventType>("competition");
    const [description, setDescription] = useState("");
    const [bannerUrl, setBannerUrl] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [prizes, setPrizes] = useState("");
    const [rules, setRules] = useState("");
    const [location, setLocation] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (
            !title.trim() ||
            !description.trim() ||
            !bannerUrl.trim() ||
            !startDate ||
            !endDate
        ) {
            setError("All required fields must be filled.");
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            setError("Start date must be before end date.");
            return;
        }
        if (type === "competition" && !prizes.trim()) {
            setError("Competitions must have prizes.");
            return;
        }
        onCreate({
            type,
            title: title.trim(),
            description: description.trim(),
            bannerUrl: bannerUrl.trim(),
            startDate,
            endDate,
            status: "upcoming",
            prizes: type === "competition" ? prizes.trim() : undefined,
            rules: rules.trim() || undefined,
            location: type !== "competition" ? location.trim() : undefined,
            entries: [],
        });
        setTitle("");
        setDescription("");
        setBannerUrl("");
        setStartDate("");
        setEndDate("");
        setPrizes("");
        setRules("");
        setLocation("");
    };

    return (
        <form
            className="max-w-2xl mx-auto p-6 bg-white dark:bg-[var(--bg-surface)] rounded shadow"
            onSubmit={handleSubmit}
        >
            <h2 className="text-2xl font-bold mb-4">Create New Event</h2>
            {error && <div className="mb-2 text-red-600">{error}</div>}
            <div className="mb-3">
                <label className="block font-semibold mb-1">Title *</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border rounded px-2 py-1"
                    required
                />
            </div>
            <div className="mb-3">
                <label className="block font-semibold mb-1">Type *</label>
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value as EventType)}
                    className="w-full border rounded px-2 py-1"
                >
                    <option value="competition">Competition</option>
                    <option value="meetup">Meetup</option>
                    <option value="webinar">Webinar</option>
                </select>
            </div>
            <div className="mb-3">
                <label className="block font-semibold mb-1">Description *</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border rounded px-2 py-1"
                    required
                />
            </div>
            <div className="mb-3">
                <label className="block font-semibold mb-1">Banner Image URL *</label>
                <input
                    type="url"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    className="w-full border rounded px-2 py-1"
                    required
                />
            </div>
            <div className="mb-3 flex gap-2">
                <div className="flex-1">
                    <label className="block font-semibold mb-1">Start Date *</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full border rounded px-2 py-1"
                        required
                    />
                </div>
                <div className="flex-1">
                    <label className="block font-semibold mb-1">End Date *</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full border rounded px-2 py-1"
                        required
                    />
                </div>
            </div>
            {type === "competition" && (
                <div className="mb-3">
                    <label className="block font-semibold mb-1">Prizes *</label>
                    <input
                        type="text"
                        value={prizes}
                        onChange={(e) => setPrizes(e.target.value)}
                        className="w-full border rounded px-2 py-1"
                        required={type === "competition"}
                    />
                </div>
            )}
            <div className="mb-3">
                <label className="block font-semibold mb-1">Rules</label>
                <textarea
                    value={rules}
                    onChange={(e) => setRules(e.target.value)}
                    className="w-full border rounded px-2 py-1"
                />
            </div>
            {type !== "competition" && (
                <div className="mb-3">
                    <label className="block font-semibold mb-1">Location</label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full border rounded px-2 py-1"
                    />
                </div>
            )}
            <button
                type="submit"
                className="mt-4 px-6 py-2 bg-[var(--accent)] text-white rounded font-semibold hover:bg-[var(--accent-hover)] transition"
            >
                Create Event
            </button>
        </form>
    );
};
