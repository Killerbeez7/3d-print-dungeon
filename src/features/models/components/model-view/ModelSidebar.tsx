import { useEffect, useState, ChangeEvent } from "react";
import { Check, Link2, Pencil, Trash2 } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components";
import { MODEL_CATEGORIES } from "@/features/models/constants/modelCategories";
import { formatPrice, getFileFormat, toDate } from "@/features/models/utils/modelMeta";
import { toUrlSafeUsername } from "@/utils/stringUtils";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useSystemAlert } from "@/features/system-alerts/hooks/useSystemAlert";
//components
import { LikeButton } from "../../likes/components/likeButton";
import { FavoritesButton } from "../../favorites/components/favoritesButton";
import { PurchaseButton } from "@/features/payment/components/PurchaseButton";
import { FollowButton } from "@/features/user/follow/components/FollowButton";

//types
import type { CurrentUser } from "@/features/auth/types/auth";
import type { ModelData } from "@/features/models/types/model";

interface Uploader {
  username?: string;
  displayName?: string;
  photoURL?: string | null;
}

interface ModelSidebarProps {
  model: ModelData;
  uploader?: Uploader;
  viewCount: number;
  viewCountLoading?: boolean;
  currentUser: CurrentUser | null;
  openAuthModal: () => void;
  /** On phones the purchase button lives in a sticky bottom bar instead. */
  showPurchase?: boolean;
}

const inputClass =
  "w-full rounded-lg border border-br-input bg-page px-3 py-2.5 text-sm text-txt-primary placeholder:text-txt-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25";

/** Copies the page link (or opens the share sheet on phones). */
const ShareButton = ({ title }: { title: string }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Share sheet dismissed or clipboard blocked: nothing to do.
    }
  };

  return (
    <Button
      variant="secondary"
      onClick={() => void handleShare()}
      aria-label={copied ? "Link copied" : "Share link"}
      leftIcon={
        copied ? (
          <Check className="size-4 text-success" aria-hidden="true" />
        ) : (
          <Link2 className="size-4" aria-hidden="true" />
        )
      }
    >
      <span className="sr-only sm:not-sr-only">{copied ? "Copied" : "Share"}</span>
    </Button>
  );
};

export function ModelSidebar({
  model,
  uploader,
  viewCount,
  viewCountLoading,
  currentUser,
  openAuthModal,
  showPurchase = true,
}: ModelSidebarProps) {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const notification = useSystemAlert();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: model.name || "",
    description: model.description || "",
    tags: model.tags ? model.tags.join(", ") : "",
  });
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  // Keep formData in sync if model changes (e.g. after update)
  useEffect(() => {
    setFormData({
      name: model.name || "",
      description: model.description || "",
      tags: model.tags ? model.tags.join(", ") : "",
    });
  }, [model]);

  // Handle input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Start editing
  const handleEdit = () => {
    setIsEditing(true);
    setError("");
  };

  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: model.name || "",
      description: model.description || "",
      tags: model.tags ? model.tags.join(", ") : "",
    });
    setError("");
  };

  // Save edited model info
  const handleSave = async () => {
    setIsUpdating(true);
    setError("");
    try {
      const docRef = doc(db, "models", model.id);
      await updateDoc(docRef, {
        name: formData.name,
        description: formData.description,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError("Failed to update model.");
    }
    setIsUpdating(false);
  };

  // Delete model using Cloud Function
  const handleDelete = async () => {
    setIsDeleting(true);
    setError("");
    try {
      // Import the delete function from the service
      const { deleteModel } = await import("../../services/modelsService");
      await deleteModel(model.id);

      // Show success notification
      notification.success("Model Deleted", "The model has been successfully deleted.");

      // Navigate to home page after successful deletion
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Failed to delete model.");
      setIsDeleting(false);
    }
  };

  const category = MODEL_CATEGORIES.find((item) => model.categoryIds?.includes(item.id));
  const createdAt = toDate(model.createdAt);
  const fileFormat = getFileFormat(model.originalFileUrl);
  const tags = formData.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const isPaid = Boolean(model.isPaid && model.price && model.price > 0);
  const profilePath = uploader?.username ? `/${toUrlSafeUsername(uploader.username)}` : null;
  const creatorName = uploader?.displayName || "Anonymous";
  const imageCount =
    (model.renderPrimaryUrl ? 1 : 0) + (Array.isArray(model.renderExtraUrls) ? model.renderExtraUrls.length : 0);

  const specs = [
    { label: "Format", value: fileFormat },
    { label: "Category", value: category?.name },
    { label: "Images", value: imageCount ? String(imageCount) : null },
    {
      label: "Uploaded",
      value: createdAt?.toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" }),
    },
    { label: "Made with AI", value: model.isAI ? "Yes" : null },
  ].filter((spec): spec is { label: string; value: string } => Boolean(spec.value));

  const stats = [
    { label: "Views", value: viewCountLoading ? "…" : viewCount.toLocaleString("en") },
    { label: "Likes", value: (model.likes ?? 0).toLocaleString("en") },
    {
      label: "Added",
      value: createdAt ? createdAt.toLocaleDateString("en", { month: "short", year: "numeric" }) : "—",
    },
  ];

  return (
    <aside className="flex w-full flex-col gap-6 lg:sticky lg:top-24 lg:w-[400px] lg:shrink-0 lg:self-start">
      {/* Title */}
      <section>
        {isEditing ? (
          <div className="space-y-3">
            <label className="block">
              <span className="label-mono mb-1.5 block text-txt-muted">Name</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`${inputClass} text-lg font-semibold`}
                required
              />
            </label>
            <label className="block">
              <span className="label-mono mb-1.5 block text-txt-muted">Description</span>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={inputClass}
                rows={4}
              />
            </label>
            <label className="block">
              <span className="label-mono mb-1.5 block text-txt-muted">Tags</span>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className={inputClass}
                placeholder="dragon, presupported, 32mm"
              />
            </label>
            {error && <p className="text-sm text-error">{error}</p>}
            <div className="flex gap-2">
              <Button onClick={handleSave} isLoading={isUpdating} className="flex-1">
                {isUpdating ? "Saving…" : "Save changes"}
              </Button>
              <Button variant="secondary" onClick={handleCancel} disabled={isUpdating} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            {category && (
              <Link
                to={`/?category=${category.id}`}
                className="label-mono text-accent transition-colors hover:text-accent-hover"
              >
                {category.name}
              </Link>
            )}
            <h1 className="mt-2 break-words text-2xl font-bold leading-tight lg:text-3xl">
              {formData.name}
            </h1>
          </>
        )}
      </section>

      {/* Creator */}
      <section className="flex items-center gap-3">
        <span className="chamfer size-12 shrink-0 overflow-hidden bg-muted [--cut:9px]">
          <img
            src={uploader?.photoURL || "/assets/images/user.png"}
            alt=""
            className="size-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/assets/images/user.png";
            }}
          />
        </span>
        <div className="min-w-0 flex-1">
          {profilePath ? (
            <Link
              to={profilePath}
              className="block truncate text-sm font-semibold text-txt-primary transition-colors hover:text-accent"
            >
              {creatorName}
            </Link>
          ) : (
            <p className="truncate text-sm font-semibold text-txt-primary">{creatorName}</p>
          )}
          {uploader?.username && (
            <p className="truncate font-mono text-xs text-txt-muted">@{uploader.username}</p>
          )}
        </div>
        {model.uploaderId && (
          <FollowButton
            targetUserId={model.uploaderId}
            targetUserName={uploader?.displayName || undefined}
            size="sm"
            variant="primary"
            openAuthModal={openAuthModal}
          />
        )}
      </section>

      {/* Stats */}
      <dl className="grid grid-cols-3 divide-x divide-br-subtle border-y border-br-subtle py-3 text-center">
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt className="label-mono text-txt-muted">{stat.label}</dt>
            <dd className="mt-1 font-mono text-base font-semibold text-txt-primary">{stat.value}</dd>
          </div>
        ))}
      </dl>

      {/* Actions */}
      <section className="space-y-3">
        {isPaid && showPurchase && (
          <div className="flex items-baseline justify-between">
            <span className="label-mono text-txt-muted">Price</span>
            <span className="font-mono text-3xl font-semibold text-ember">
              {formatPrice(model.price as number, model.currency)}
            </span>
          </div>
        )}

        {showPurchase && (
          <PurchaseButton
            model={{
              ...model,
              price: model.price ?? 0,
              uploaderId: model.uploaderId ?? "",
            }}
            className="w-full"
          />
        )}

        <div className="flex gap-2">
          <LikeButton
            modelId={model.id}
            initialLikes={model.likes}
            currentUser={currentUser}
            openAuthModal={openAuthModal}
          />
          <FavoritesButton
            modelId={model.id}
            currentUser={currentUser}
            openAuthModal={openAuthModal}
          />
          <ShareButton title={model.name} />
        </div>
      </section>

      {/* Description */}
      {!isEditing && formData.description && (
        <section>
          <h2 className="label-mono mb-2 text-txt-muted">About this model</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-txt-secondary">
            {formData.description}
          </p>
        </section>
      )}

      {/* Specs */}
      {specs.length > 0 && (
        <section>
          <h2 className="label-mono mb-2 text-txt-muted">Specs</h2>
          <dl className="divide-y divide-br-subtle rounded-lg border border-br-subtle bg-surface-card">
            {specs.map((spec) => (
              <div key={spec.label} className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
                <dt className="text-txt-muted">{spec.label}</dt>
                <dd className="font-mono text-txt-primary">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Tags */}
      {!isEditing && tags.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
          {tags.map((tag) => (
            <li key={tag}>
              <Link
                to={`/search?sort_by=relevance&query=${encodeURIComponent(tag)}`}
                className="inline-block border border-br-secondary px-2 py-1 font-mono text-xs text-txt-secondary transition-colors hover:border-accent hover:text-accent"
              >
                #{tag}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Owner actions */}
      {currentUser && (currentUser.uid === model.uploaderId || isAdmin) && !isEditing && (
        <section className="rounded-lg border border-dashed border-br-secondary p-4">
          <h2 className="label-mono mb-3 text-txt-muted">Owner actions</h2>
          {showDeleteConfirm ? (
            <div className="space-y-3">
              <p className="text-sm text-error">Delete this model? This can&apos;t be undone.</p>
              {error && <p className="text-sm text-error">{error}</p>}
              <div className="flex gap-2">
                <Button
                  onClick={handleDelete}
                  isLoading={isDeleting}
                  className="flex-1 [--btn-bg:var(--error)] [--btn-edge:var(--error)]"
                >
                  {isDeleting ? "Deleting…" : "Delete"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={handleEdit}
                className="flex-1"
                leftIcon={<Pencil className="size-4" aria-hidden="true" />}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex-1 text-error"
                leftIcon={<Trash2 className="size-4" aria-hidden="true" />}
              >
                Delete
              </Button>
            </div>
          )}
        </section>
      )}
    </aside>
  );
}
