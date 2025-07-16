import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { useModels } from "../hooks/useModels";
import type { ModelData } from "@/features/models/types/model";

export function ModelEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { models } = useModels();
    const model: ModelData | undefined = models.find((m) => m.id === id);

    const [formData, setFormData] = useState<{
        name: string;
        description: string;
        tags: string;
    }>({
        name: "",
        description: "",
        tags: "",
    });
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        if (model) {
            setFormData({
                name: model.name ?? "",
                description: model.description ?? "",
                tags: Array.isArray(model.tags) ? model.tags.join(", ") : "",
            });
        }
    }, [model]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!model) {
            setError("Model not found.");
            return;
        }
        setIsUpdating(true);
        setError("");
        try {
            const docRef = doc(db, "models", id ?? "");
            await updateDoc(docRef, {
                name: formData.name,
                description: formData.description,
                tags: formData.tags.split(",").map((t) => t.trim()),
            });
            alert("Model updated successfully!");
            navigate(`/model/${id}`);
        } catch (err) {
            console.error(err);
            setError("Failed to update model.");
        }
        setIsUpdating(false);
    };

    if (!model) {
        return <p className="p-4">Loading model data...</p>;
    }

    return (
        <div className="min-h-screen p-8">
            <h1 className="text-3xl font-bold text-txt-primary mb-6">Edit Model</h1>
            {error && <p className="text-red-600 mb-4">{error}</p>}
            <form
                onSubmit={handleSubmit}
                className="max-w-2xl mx-auto bg-bg-surface p-6 rounded shadow"
            >
                <div className="mb-4">
                    <label className="block text-txt-secondary mb-1">Model Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full border border-br-primary rounded px-3 py-2"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-txt-secondary mb-1">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full border border-br-primary rounded px-3 py-2"
                        rows={4}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-txt-secondary mb-1">
                        Tags (comma-separated)
                    </label>
                    <input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        className="w-full border border-br-primary rounded px-3 py-2"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isUpdating}
                    className="bg-btn-primary text-white py-2 px-4 rounded"
                >
                    {isUpdating ? "Updating..." : "Update Model"}
                </button>
            </form>
        </div>
    );
}
