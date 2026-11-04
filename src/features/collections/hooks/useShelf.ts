import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getFavoritesForUser, toggleFavorite } from "@/features/models/favorites/services/favoritesService";
import {
  createCollection,
  deleteCollection,
  getModelsByIds,
  listCollections,
  renameCollection,
  setModelInCollection,
  type ModelCollection,
} from "../services/collectionsService";

// "Shelf" = what a signed-in user keeps: the Saved list (favourites) and their own collections.

export const favoritesKey = (uid?: string) => ["favorites", uid ?? "anon"] as const;
export const collectionsKey = (uid?: string) => ["collections", uid ?? "anon"] as const;

/** Saved model ids, newest first. */
export function useFavoriteIds(uid?: string) {
  return useQuery({
    queryKey: favoritesKey(uid),
    queryFn: async () => (await getFavoritesForUser(uid!)).slice().reverse(),
    enabled: Boolean(uid),
    staleTime: 60_000,
  });
}

export function useToggleFavorite(uid?: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (modelId: string) => toggleFavorite(uid!, modelId),
    onMutate: async (modelId) => {
      await client.cancelQueries({ queryKey: favoritesKey(uid) });
      const before = client.getQueryData<string[]>(favoritesKey(uid));
      client.setQueryData<string[]>(favoritesKey(uid), (ids = []) =>
        ids.includes(modelId) ? ids.filter((id) => id !== modelId) : [modelId, ...ids],
      );
      return { before };
    },
    onError: (_error, _modelId, context) => client.setQueryData(favoritesKey(uid), context?.before),
    onSettled: () => client.invalidateQueries({ queryKey: favoritesKey(uid) }),
  });
}

export function useMyCollections(uid?: string) {
  return useQuery({
    queryKey: collectionsKey(uid),
    queryFn: () => listCollections(uid!),
    enabled: Boolean(uid),
    staleTime: 60_000,
  });
}

/** Runs a change on the collections list: optimistic in the cache, rolled back on failure. */
function useCollectionsMutation<Vars, Result = void>(
  uid: string | undefined,
  run: (vars: Vars) => Promise<Result>,
  apply: (lists: ModelCollection[], vars: Vars) => ModelCollection[],
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: run,
    onMutate: async (vars: Vars) => {
      await client.cancelQueries({ queryKey: collectionsKey(uid) });
      const before = client.getQueryData<ModelCollection[]>(collectionsKey(uid));
      client.setQueryData<ModelCollection[]>(collectionsKey(uid), (lists = []) => apply(lists, vars));
      return { before };
    },
    onError: (_error, _vars, context) => client.setQueryData(collectionsKey(uid), context?.before),
    onSettled: () => client.invalidateQueries({ queryKey: collectionsKey(uid) }),
  });
}

export function useCreateCollection(uid?: string) {
  return useCollectionsMutation<{ name: string; modelId?: string }, string>(
    uid,
    ({ name, modelId }) => createCollection(uid!, name, modelId),
    (lists) => lists, // the new id comes from the server round trip
  );
}

export function useRenameCollection(uid?: string) {
  return useCollectionsMutation<{ id: string; name: string }>(
    uid,
    ({ id, name }) => renameCollection(uid!, id, name),
    (lists, { id, name }) => lists.map((c) => (c.id === id ? { ...c, name: name.trim() } : c)),
  );
}

export function useDeleteCollection(uid?: string) {
  return useCollectionsMutation<{ id: string }>(
    uid,
    ({ id }) => deleteCollection(uid!, id),
    (lists, { id }) => lists.filter((c) => c.id !== id),
  );
}

export function useSetModelInCollection(uid?: string) {
  return useCollectionsMutation<{ id: string; modelId: string; included: boolean }>(
    uid,
    ({ id, modelId, included }) => setModelInCollection(uid!, id, modelId, included),
    (lists, { id, modelId, included }) =>
      lists.map((c) =>
        c.id !== id
          ? c
          : {
              ...c,
              modelIds: included
                ? [...c.modelIds.filter((m) => m !== modelId), modelId]
                : c.modelIds.filter((m) => m !== modelId),
              updatedAt: Date.now(),
            },
      ),
  );
}

export function useModelsByIds(ids: string[] | undefined) {
  const key = (ids ?? []).join(",");
  return useQuery({
    queryKey: ["models", "byIds", key],
    queryFn: () => getModelsByIds(ids ?? []),
    enabled: ids !== undefined,
    staleTime: 5 * 60_000,
    placeholderData: (previous) => previous,
  });
}
