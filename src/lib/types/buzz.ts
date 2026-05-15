import type { Timestamp, FirestoreDataConverter } from 'firebase/firestore';
import type { User } from './user';

export type BuzzOccasion =
  | 'birthday'
  | 'diwali'
  | 'christmas'
  | 'eid'
  | 'anniversary'
  | 'custom';

export type BuzzBoardMode = 'personal' | 'group';
export type BuzzStatus = 'collecting' | 'revealed';
export type SignatureType = 'text' | 'photo';

export type Buzz = {
  id: string;
  title: string;
  occasion: BuzzOccasion;
  customOccasion: string | null;
  boardMode: BuzzBoardMode;
  recipientName: string;
  recipientUserId: string | null;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp | null;
  revealAt: Timestamp;
  status: BuzzStatus;
  totalSignatures: number;
  coverImageURL: string | null;
  shareToken: string;
  signedBy: string[];
  feedTweetId: string | null;
  revealTweetId: string | null;
};

export type BuzzWithUser = Buzz & {
  user: Pick<User, 'id' | 'name' | 'username' | 'photoURL' | 'verified'>;
};

export type Signature = {
  id: string;
  buzzId: string;
  authorId: string;
  authorName: string;
  authorPhotoURL: string | null;
  type: SignatureType;
  text: string | null;
  mediaURL: string | null;
  mediaThumbnailURL: string | null;
  createdAt: Timestamp;
  isHidden: boolean;
};

export type NewBuzzData = Pick<
  Buzz,
  | 'title'
  | 'occasion'
  | 'customOccasion'
  | 'boardMode'
  | 'recipientName'
  | 'recipientUserId'
  | 'revealAt'
  | 'coverImageURL'
  | 'createdBy'
>;

export type NewSignatureData = Pick<
  Signature,
  'buzzId' | 'authorId' | 'authorName' | 'authorPhotoURL' | 'type' | 'text' | 'mediaURL' | 'mediaThumbnailURL'
>;

export const buzzConverter: FirestoreDataConverter<Buzz> = {
  toFirestore(buzz) {
    const { id, ...rest } = buzz;
    return rest;
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return { id: snapshot.id, ...data } as Buzz;
  }
};

export const signatureConverter: FirestoreDataConverter<Signature> = {
  toFirestore(sig) {
    const { id, ...rest } = sig;
    return rest;
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return { id: snapshot.id, ...data } as Signature;
  }
};
