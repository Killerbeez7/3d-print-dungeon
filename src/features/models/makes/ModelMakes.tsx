import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, ImagePlus, Trash2, X } from "lucide-react";

import { Button } from "@/components";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toUrlSafeUsername } from "@/utils/stringUtils";

import { deleteMake, listMakes, MAX_CAPTION, postMake, type Make } from "./makesService";

interface ModelMakesProps {
  modelId: string;
  /** The model's creator can remove makes posted under it. */
  modelOwnerId?: string;
  openAuthModal: () => void;
}

/** "Makes": photos people posted of their print of this model. */
export const ModelMakes = ({ modelId, modelOwnerId, openAuthModal }: ModelMakesProps) => {
  const { currentUser, authUser, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const key = ["makes", modelId];
  const { data: makes = [], isError } = useQuery({
    queryKey: key,
    queryFn: () => listMakes(modelId),
    staleTime: 60_000,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [viewing, setViewing] = useState<Make | null>(null);

  const remove = useMutation({
    mutationFn: deleteMake,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });

  const canDelete = (make: Make) =>
    Boolean(currentUser) &&
    (make.userId === currentUser?.uid || modelOwnerId === currentUser?.uid || isAdmin);

  return (
    <section aria-labelledby="makes-heading">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 id="makes-heading" className="text-lg font-semibold text-txt-primary">
            Makes{makes.length > 0 && <span className="ml-2 text-txt-muted">{makes.length}</span>}
          </h2>
          <p className="text-sm text-txt-secondary">
            Photos of this model, printed by the community.
          </p>
        </div>
        {!formOpen && (
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Camera className="size-4" aria-hidden="true" />}
            onClick={() => (currentUser ? setFormOpen(true) : openAuthModal())}
          >
            Post your make
          </Button>
        )}
      </div>

      {formOpen && currentUser && (
        <MakeForm
          modelId={modelId}
          user={{
            uid: currentUser.uid,
            displayName: authUser?.displayName || currentUser.displayName || "Maker",
            username: authUser?.username ?? null,
          }}
          onDone={() => {
            setFormOpen(false);
            queryClient.invalidateQueries({ queryKey: key });
          }}
          onCancel={() => setFormOpen(false)}
        />
      )}

      {makes.length > 0 ? (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {makes.map((make) => (
            <li key={make.id} className="group relative overflow-hidden rounded-lg bg-muted">
              <button
                type="button"
                onClick={() => setViewing(make)}
                className="block w-full"
                aria-label={`Open ${make.userName}'s make`}
              >
                <img
                  src={make.imageUrl}
                  alt={make.caption || `${make.userName}'s print`}
                  loading="lazy"
                  decoding="async"
                  className="aspect-square w-full object-cover transition-transform duration-500 ease-forge group-hover:scale-105"
                />
              </button>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-scrim/85 to-transparent p-2 pt-8">
                <p className="truncate text-xs font-medium text-on-scrim">{make.userName}</p>
              </div>
              {canDelete(make) && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Remove this make?")) remove.mutate(make);
                  }}
                  className="absolute right-1.5 top-1.5 flex size-8 items-center justify-center rounded-md bg-scrim/60 text-on-scrim transition-colors hover:bg-error"
                  aria-label="Remove this make"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        !formOpen && (
          <p className="rounded-lg border border-dashed border-br-secondary px-4 py-8 text-center text-sm text-txt-secondary">
            {isError
              ? "Makes couldn't be loaded right now."
              : "No makes yet. Printed this one? Show how it came out."}
          </p>
        )
      )}

      {viewing && <MakeViewer make={viewing} onClose={() => setViewing(null)} />}
    </section>
  );
};

const MakeForm = ({
  modelId,
  user,
  onDone,
  onCancel,
}: {
  modelId: string;
  user: { uid: string; displayName: string; username: string | null };
  onDone: () => void;
  onCancel: () => void;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const post = useMutation({ mutationFn: postMake, onSuccess: onDone });

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const choose = (event: ChangeEvent<HTMLInputElement>) => setFile(event.target.files?.[0] ?? null);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (file) post.mutate({ modelId, file, caption, user });
  };

  return (
    <form
      onSubmit={submit}
      className="mb-5 grid gap-4 rounded-xl border border-br-subtle bg-surface-card p-4 sm:grid-cols-[180px_1fr]"
    >
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-dashed border-br-secondary bg-page text-txt-muted transition-colors hover:border-accent hover:text-accent"
        aria-label={file ? "Choose a different photo" : "Choose a photo"}
      >
        {preview ? (
          <img src={preview} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-2 text-sm">
            <ImagePlus className="size-7" aria-hidden="true" />
            Choose a photo
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={choose}
        className="sr-only"
        tabIndex={-1}
      />

      <div className="flex flex-col gap-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-txt-secondary">
            Caption <span className="text-txt-muted">(optional)</span>
          </span>
          <textarea
            value={caption}
            onChange={(event) => setCaption(event.target.value.slice(0, MAX_CAPTION))}
            rows={3}
            placeholder="Printer, resin or filament, settings, paint scheme…"
            className="w-full resize-none rounded-lg border border-br-input bg-page px-3 py-2 text-sm text-txt-primary placeholder:text-txt-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
          />
          <span className="mt-1 block text-right text-xs text-txt-muted">
            {caption.length}/{MAX_CAPTION}
          </span>
        </label>
        {post.isError && (
          <p className="text-sm text-error" role="alert">
            {post.error instanceof Error && post.error.message.includes("permission")
              ? "Posting makes isn't switched on yet."
              : (post.error as Error)?.message || "Couldn't post your make. Try again."}
          </p>
        )}
        <div className="mt-auto flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={post.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={!file} isLoading={post.isPending}>
            Post make
          </Button>
        </div>
      </div>
    </form>
  );
};

const MakeViewer = ({ make, onClose }: { make: Make; onClose: () => void }) => {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-scrim/90 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${make.userName}'s make`}
      onClick={onClose}
    >
      <figure className="max-h-full max-w-3xl" onClick={(event) => event.stopPropagation()}>
        <img
          src={make.imageUrl}
          alt={make.caption || `${make.userName}'s print`}
          className="max-h-[78vh] w-auto rounded-lg object-contain"
        />
        <figcaption className="mt-3 text-sm text-on-scrim">
          {make.username ? (
            <Link
              to={`/${toUrlSafeUsername(make.username)}`}
              className="font-semibold hover:underline"
            >
              {make.userName}
            </Link>
          ) : (
            <span className="font-semibold">{make.userName}</span>
          )}
          {make.caption && <span className="text-on-scrim/80"> · {make.caption}</span>}
        </figcaption>
      </figure>
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-lg text-on-scrim hover:bg-white/10"
        aria-label="Close"
        autoFocus
      >
        <X className="size-6" aria-hidden="true" />
      </button>
    </div>
  );
};
