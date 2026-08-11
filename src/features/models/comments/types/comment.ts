import type { Timestamp } from "firebase/firestore";

export interface ModelComment {
  id: string;
  modelId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt?: Timestamp;
}

export interface CreateCommentData {
  userId: string;
  userName: string;
  text: string;
}

export interface UpdateCommentData {
  text: string;
}
