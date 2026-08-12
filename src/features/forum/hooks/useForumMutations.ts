import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/hooks/useAuth";

import {
  createThread,
  updateThread,
  deleteThread,
  createReply,
  updateReply,
  deleteReply,
  incrementThreadViews,
} from "../services/forumService";

import type {
  CreateThreadInput,
  CreateThreadData,
  UpdateThreadInput,
  CreateReplyInput,
  CreateReplyData,
  UpdateReplyInput,
} from "../types/forum";

export const useCreateThread = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  return useMutation<string, Error, CreateThreadInput>({
    mutationFn: async (input) => {
      if (!currentUser) {
        throw new Error("You must be logged in to create a thread");
      }

      const data: CreateThreadData = {
        ...input,
        authorId: currentUser.uid,
        authorName: currentUser.displayName ?? "Anonymous",
        authorPhotoURL: currentUser.photoURL ?? undefined,
      };

      return createThread(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["forum-threads"],
      });

      queryClient.invalidateQueries({
        queryKey: ["forum-categories"],
      });
    },
  });
};

interface UpdateThreadMutation {
  threadId: string;
  data: UpdateThreadInput;
}

export const useUpdateThread = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  return useMutation<string, Error, UpdateThreadMutation>({
    mutationFn: async ({ threadId, data }) => {
      if (!currentUser) {
        throw new Error("You must be logged in to update a thread");
      }

      return updateThread(threadId, data);
    },
    onSuccess: (_, { threadId }) => {
      queryClient.invalidateQueries({
        queryKey: ["forum-thread", threadId],
      });

      queryClient.invalidateQueries({
        queryKey: ["forum-threads"],
      });
    },
  });
};

export const useDeleteThread = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  return useMutation<string, Error, string>({
    mutationFn: async (threadId) => {
      if (!currentUser) {
        throw new Error("You must be logged in to delete a thread");
      }

      return deleteThread(threadId);
    },
    onSuccess: (_, threadId) => {
      queryClient.removeQueries({
        queryKey: ["forum-thread", threadId],
      });

      queryClient.removeQueries({
        queryKey: ["forum-replies", threadId],
      });

      queryClient.invalidateQueries({
        queryKey: ["forum-threads"],
      });

      queryClient.invalidateQueries({
        queryKey: ["forum-categories"],
      });
    },
  });
};

export const useCreateReply = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  return useMutation<string, Error, CreateReplyInput>({
    mutationFn: async (input) => {
      if (!currentUser) {
        throw new Error("You must be logged in to reply");
      }

      const data: CreateReplyData = {
        ...input,
        authorId: currentUser.uid,
        authorName: currentUser.displayName ?? "Anonymous",
        authorPhotoURL: currentUser.photoURL ?? undefined,
      };

      return createReply(data);
    },
    onSuccess: (_, { threadId }) => {
      queryClient.invalidateQueries({
        queryKey: ["forum-thread", threadId],
      });

      queryClient.invalidateQueries({
        queryKey: ["forum-replies"],
      });

      queryClient.invalidateQueries({
        queryKey: ["forum-threads"],
      });
    },
  });
};

interface UpdateReplyMutation {
  replyId: string;
  threadId: string;
  data: UpdateReplyInput;
}

export const useUpdateReply = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  return useMutation<string, Error, UpdateReplyMutation>({
    mutationFn: async ({ replyId, data }) => {
      if (!currentUser) {
        throw new Error("You must be logged in to update a reply");
      }

      return updateReply(replyId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["forum-replies"],
      });
    },
  });
};

interface DeleteReplyMutation {
  replyId: string;
  threadId: string;
}

export const useDeleteReply = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  return useMutation<string, Error, DeleteReplyMutation>({
    mutationFn: async ({ replyId, threadId }) => {
      if (!currentUser) {
        throw new Error("You must be logged in to delete a reply");
      }

      return deleteReply(replyId, threadId);
    },
    onSuccess: (_, { threadId }) => {
      queryClient.invalidateQueries({
        queryKey: ["forum-thread", threadId],
      });

      queryClient.invalidateQueries({
        queryKey: ["forum-replies"],
      });

      queryClient.invalidateQueries({
        queryKey: ["forum-threads"],
      });
    },
  });
};

export const useIncrementThreadViews = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (threadId) => {
      return incrementThreadViews(threadId);
    },
    onSuccess: (_, threadId) => {
      queryClient.invalidateQueries({
        queryKey: ["forum-thread", threadId],
      });

      queryClient.invalidateQueries({
        queryKey: ["forum-threads"],
      });
    },
  });
};
