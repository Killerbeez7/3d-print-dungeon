import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Box, Check } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { useFetchModel } from "../hooks";
import { updateModel } from "@/features/models/services";
import { Button, buttonClassName } from "@/components";
import { StatePanel } from "@/features/shared/components/StatePanel";

type FormData = {
  name: string;
  description: string;
  tags: string;
};

export function ModelEdit() {
  // The route is /model/:modelId/edit
  const { modelId: id } = useParams<{ modelId: string }>();
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
      <div className="mx-auto max-w-2xl space-y-5 px-4 pb-16 pt-8 sm:px-6" role="status" aria-label="Loading">
        <div className="skeleton-print h-9 w-56" />
        <div className="skeleton-print h-12" />
        <div className="skeleton-print h-32" />
        <div className="skeleton-print h-11" />
      </div>
    );
  }

  if (isError || !model) {
    return (
      <StatePanel
        icon={Box}
        title={isError ? "Couldn't load this model" : "Model not found"}
        actions={
          <Link to="/" className={buttonClassName()}>
            Browse models
          </Link>
        }
      >
        {isError ? "Check your connection and refresh the page." : "It may have been removed, or the link is wrong."}
      </StatePanel>
    );
  }

  const labelClass = "mb-1.5 block text-sm font-medium text-txt-secondary";

  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-8 sm:px-6">
      <header className="mb-8">
        <Link to={`/model/${id}`} className="label-mono text-accent hover:underline">
          ← {model.name}
        </Link>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Edit model</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-br-subtle bg-surface-card p-5 sm:p-7">
        {error && (
          <p role="alert" className="rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-sm text-txt-primary">
            {error}
          </p>
        )}

        <div>
          <label htmlFor="name" className={labelClass}>
            Model name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="field h-12 text-base"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="field resize-y py-3 leading-relaxed"
            rows={6}
          />
        </div>

        <div>
          <label htmlFor="tags" className={labelClass}>
            Tags
          </label>
          <input
            id="tags"
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            aria-describedby="tags-hint"
            className="field h-11"
          />
          <p id="tags-hint" className="mt-1.5 text-xs text-txt-muted">
            Separate tags with commas.
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-br-subtle pt-5">
          <Link to={`/model/${id}`} className={buttonClassName({ variant: "ghost" })}>
            Cancel
          </Link>
          <Button type="submit" isLoading={isUpdating} leftIcon={<Check className="size-4" aria-hidden="true" />}>
            {isUpdating ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
