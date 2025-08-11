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
            className="w-full"
            onSubmit={handleSubmit}
        >
            <h2 className="text-2xl font-bold mb-6 text-txt-primary text-center">Create New Event</h2>
            {error && <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">{error}</div>}
            <div className="mb-4">
                <label className="block text-sm font-medium text-txt-secondary mb-2">Title *</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-br-secondary rounded-lg bg-bg-surface text-txt-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-txt-secondary mb-2">Type *</label>
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value as EventType)}
                    className="w-full px-3 py-2 border border-br-secondary rounded-lg bg-bg-surface text-txt-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
                >
                    <option value="competition">Competition</option>
                    <option value="meetup">Meetup</option>
                    <option value="webinar">Webinar</option>
                </select>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-txt-secondary mb-2">Description *</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-br-secondary rounded-lg bg-bg-surface text-txt-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
                    rows={3}
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-txt-secondary mb-2">Banner Image URL *</label>
                <input
                    type="url"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-br-secondary rounded-lg bg-bg-surface text-txt-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
                    required
                />
            </div>
            <div className="mb-4 flex gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-txt-secondary mb-2">Start Date *</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-br-secondary rounded-lg bg-bg-surface text-txt-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
                        required
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-txt-secondary mb-2">End Date *</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-br-secondary rounded-lg bg-bg-surface text-txt-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
                        required
                    />
                </div>
            </div>
            {type === "competition" && (
                <div className="mb-4">
                    <label className="block text-sm font-medium text-txt-secondary mb-2">Prizes *</label>
                    <input
                        type="text"
                        value={prizes}
                        onChange={(e) => setPrizes(e.target.value)}
                        className="w-full px-3 py-2 border border-br-secondary rounded-lg bg-bg-surface text-txt-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
                        required={type === "competition"}
                    />
                </div>
            )}
            <div className="mb-4">
                <label className="block text-sm font-medium text-txt-secondary mb-2">Rules</label>
                <textarea
                    value={rules}
                    onChange={(e) => setRules(e.target.value)}
                    className="w-full px-3 py-2 border border-br-secondary rounded-lg bg-bg-surface text-txt-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
                    rows={3}
                />
            </div>
            {type !== "competition" && (
                <div className="mb-4">
                    <label className="block text-sm font-medium text-txt-secondary mb-2">Location</label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-3 py-2 border border-br-secondary rounded-lg bg-bg-surface text-txt-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
                    />
                </div>
            )}
            <div className="flex justify-center mt-6">
                <button
                    type="submit"
                    className="px-8 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                    Create Event
                </button>
            </div>
        </form>
    );
};
