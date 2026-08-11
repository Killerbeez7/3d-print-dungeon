import { db } from "@/config/firebaseConfig";
import {
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  type DocumentData,
  query,
  where,
  orderBy,
  onSnapshot,
  type QueryDocumentSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";

import type {
  ModelComment,
  CreateCommentData,
  UpdateCommentData,
} from "../types/comment";

const mapComment = (snapshot: QueryDocumentSnapshot<DocumentData>): ModelComment => {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    modelId: data.modelId ?? "",
    userId: data.userId ?? "",
    userName: data.userName ?? "Anonymous",
    text: data.text ?? "",
    createdAt: data.createdAt,
  };
};

export function subscribeToModelComments(
  modelId: string,
  onComments: (comments: ModelComment[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  if (!modelId) {
    throw new Error("modelId is required.");
  }

  const commentsQuery = query(
    collection(db, "comments"),
    where("modelId", "==", modelId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    commentsQuery,
    (snapshot) => {
      const comments = snapshot.docs.map((document) => {
        return mapComment(document);
      });

      onComments(comments);
    },
    onError
  );
}

export async function addComment(
  modelId: string,
  commentData: CreateCommentData
): Promise<void> {
  if (!modelId) {
    throw new Error("modelId is required.");
  }

  await addDoc(collection(db, "comments"), {
    ...commentData,
    modelId,
    createdAt: serverTimestamp(),
  });
}

export async function deleteComment(commentId: string): Promise<void> {
  if (!commentId) {
    throw new Error("commentId is required.");
  }

  await deleteDoc(doc(db, "comments", commentId));
}

export async function editComment(
  commentId: string,
  commentData: UpdateCommentData
): Promise<void> {
  if (!commentId) {
    throw new Error("commentId is required.");
  }

  await updateDoc(doc(db, "comments", commentId), { text: commentData.text });
}
