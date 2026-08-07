import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { useFetchModel } from "../hooks";
import { updateModel } from "@/features/models/services";
import { Spinner } from "@/features/shared/reusable/Spinner";

type FormData = {
  name: string;
  description: string;
  tags: string;
};

export function ModelEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: model, isLoading, isError } = useFetchModel(id);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    tags: "",
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!model) {
      return;
    }

    setFormData({
      name: model.name ?? "",
      description: model.description ?? "",
      tags: Array.isArray(model.tags) ? model.tags.join(", ") : "",
    });
  }, [model]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!id || !model) {
      setError("Model not found.");
      return;
    }

    setIsUpdating(true);
    setError("");

    try {
      await updateModel(id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      });

      await queryClient.invalidateQueries({
        queryKey: ["models"],
      });

      navigate(`/model/${id}`);
    } catch (error) {
      console.error("Failed to update model:", error);
      setError("Failed to update model.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size={24} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Failed to load model.
      </div>
    );
  }

  if (!model) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Model not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="mb-6 text-3xl font-bold text-txt-primary">Edit Model</h1>

      {error && <p className="mb-4 text-red-600">{error}</p>}

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-2xl rounded bg-bg-surface p-6 shadow"
      >
        <div className="mb-4">
          <label htmlFor="name" className="mb-1 block text-txt-secondary">
            Model Name
          </label>

          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded border border-br-primary px-3 py-2"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="mb-1 block text-txt-secondary">
            Description
          </label>

          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full rounded border border-br-primary px-3 py-2"
            rows={4}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="tags" className="mb-1 block text-txt-secondary">
            Tags (comma-separated)
          </label>

          <input
            id="tags"
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full rounded border border-br-primary px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={isUpdating}
          className="rounded bg-btn-primary px-4 py-2 text-white disabled:opacity-50"
        >
          {isUpdating ? "Updating..." : "Update Model"}
        </button>
      </form>
    </div>
  );
}
