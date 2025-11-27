import type { Timestamp, FirestoreDataConverter } from 'firebase/firestore';

export interface Comment {
  id?: string;
  text: string;
  momentId: string;
  createdBy: string;
  createdAt: Timestamp | Date | null;
  updatedAt?: Timestamp | Date | null;
}

export interface CommentWithUser extends Comment {
  user: {
    id: string;
    name: string;
    username: string;
    photoURL: string;
    verified?: boolean;
  };
}

export const commentConverter: FirestoreDataConverter<Comment> = {
  toFirestore(comment) {
    const { id, updatedAt, createdAt, ...rest } = comment;
    const data: Record<string, unknown> = {
      ...rest
    };

    // Only include createdAt if it's not a serverTimestamp() sentinel
    // serverTimestamp() will pass through as-is
    if (createdAt !== undefined && createdAt !== null) {
      if (createdAt instanceof Date) {
        data.createdAt = createdAt;
      } else {
        // Assume it's a Timestamp or serverTimestamp() sentinel - pass through
        data.createdAt = createdAt;
      }
    }

    if (updatedAt !== undefined) {
      data.updatedAt = updatedAt instanceof Date ? updatedAt : updatedAt;
    }

    return data;
  },
  fromFirestore(snapshot, options) {
    const { id } = snapshot;
    const data = snapshot.data(options);
    return { id, ...data } as Comment;
  }
};

