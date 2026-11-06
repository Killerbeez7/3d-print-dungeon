import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components";
import {
  createDevlogPost,
  deleteDevlogPost,
  DEVLOG_BODY_MAX,
  DEVLOG_QUERY_KEY,
  DEVLOG_TITLE_MAX,
  fetchDevlogPosts,
  updateDevlogPost,
  type DevlogPost,
} from "@/features/prelaunch/services/devlogService";
import { formatDevlogDate } from "@/features/prelaunch/utils/formatDevlogDate";

/** Write, edit and delete the dev log posts shown on the coming-soon page. */
export const DevlogManager = () => {
  const queryClient = useQueryClient();
  const { data: posts = [], isLoading, isError } = useQuery({
    queryKey: DEVLOG_QUERY_KEY,
    queryFn: fetchDevlogPosts,
  });

  const [editing, setEditing] = useState<DevlogPost | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setEditing(null);
    setTitle("");
    setBody("");
    setError(null);
  };

  const startEdit = (post: DevlogPost) => {
    setEditing(post);
    setTitle(post.title);
    setBody(post.body);
    setError(null);
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      setError("Give the post a title.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await updateDevlogPost(editing.id, title, body);
      } else {
        await createDevlogPost(title, body);
      }
      reset();
      await queryClient.invalidateQueries({ queryKey: DEVLOG_QUERY_KEY });
    } catch (err) {
      console.error("Saving the dev log post failed:", (err as { code?: string })?.code ?? err);
      setError("Couldn't save the post. If the dev log rules aren't deployed yet, deploy them first.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (post: DevlogPost) => {
    if (!window.confirm(`Delete "${post.title}"?`)) return;
    try {
      await deleteDevlogPost(post.id);
      if (editing?.id === post.id) reset();
      await queryClient.invalidateQueries({ queryKey: DEVLOG_QUERY_KEY });
    } catch (err) {
      console.error("Deleting the dev log post failed:", (err as { code?: string })?.code ?? err);
      setError("Couldn't delete the post.");
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={save} className="space-y-4" aria-label={editing ? "Edit post" : "New post"}>
        <div>
          <label htmlFor="devlog-title" className="mb-1 block font-medium text-txt-primary">
            Title
          </label>
          <input
            id="devlog-title"
            className="field"
            value={title}
            maxLength={DEVLOG_TITLE_MAX}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Makes are live"
          />
        </div>
        <div>
          <label htmlFor="devlog-body" className="mb-1 block font-medium text-txt-primary">
            Post
          </label>
          <textarea
            id="devlog-body"
            className="field min-h-[140px] py-2"
            value={body}
            maxLength={DEVLOG_BODY_MAX}
            onChange={(event) => setBody(event.target.value)}
            placeholder="What changed, in a few sentences. Blank lines start a new paragraph."
          />
          <p className="mt-1 text-xs text-txt-muted">
            {body.length} / {DEVLOG_BODY_MAX}
          </p>
        </div>
        {error && (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" isLoading={saving}>
            {editing ? "Save changes" : "Publish post"}
          </Button>
          {editing && (
            <Button variant="ghost" onClick={reset}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      <section aria-labelledby="devlog-posts">
        <h3 id="devlog-posts" className="text-lg font-bold text-txt-primary">
          Published posts
        </h3>
        {isLoading ? (
          <p className="mt-3 text-sm text-txt-muted">Loading…</p>
        ) : isError ? (
          <p className="mt-3 text-sm text-error">
            Couldn&apos;t load the posts. The dev log rules may not be deployed yet.
          </p>
        ) : posts.length === 0 ? (
          <p className="mt-3 text-sm text-txt-muted">No posts yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-br-subtle">
            {posts.map((post) => (
              <li key={post.id} className="flex items-start justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="font-medium text-txt-primary">{post.title}</p>
                  <p className="text-xs text-txt-muted">{formatDevlogDate(post.createdAt)}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(post)} aria-label={`Edit "${post.title}"`}>
                    <Pencil className="size-4" aria-hidden="true" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(post)} aria-label={`Delete "${post.title}"`}>
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
