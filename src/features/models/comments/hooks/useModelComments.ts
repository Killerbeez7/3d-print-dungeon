import { useEffect, useState } from "react";

import {
  addComment,
  editComment,
  deleteComment,
  subscribeToModelComments,
} from "../services/commentsService";

import type {
  ModelComment,
  CreateCommentData,
  UpdateCommentData,
} from "../types/comment";

export function useModelComments(modelId: string) {
  const [comments, setComments] = useState<ModelComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!modelId) {
      setComments([]);
      setLoading(false);

      return;
    }

    setLoading(true);

    const unsubscribe = subscribeToModelComments(
      modelId,
      (nextComments) => {
        setComments(nextComments);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to load model comments:", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [modelId]);

  const submitComment = async (commentData: CreateCommentData): Promise<void> => {
    await addComment(modelId, commentData);
  };

  const updateComment = async (
    commentId: string,
    commentData: UpdateCommentData
  ): Promise<void> => {
    await editComment(commentId, commentData);
  };

  const removeComment = async (commentId: string): Promise<void> => {
    await deleteComment(commentId);
  };

  return {
    comments,
    loading,
    submitComment,
    updateComment,
    removeComment,
  };
}
