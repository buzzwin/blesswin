import {
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  arrayUnion,
  increment,
  writeBatch,
  runTransaction,
  limit
} from 'firebase/firestore';
import { db, storage } from '../app';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { buzzesCollection, buzzSignaturesCollection, tweetsCollection } from '../collections';
import type { NewBuzzData, NewSignatureData, Buzz } from '@lib/types/buzz';
import type { TweetUser } from '@lib/types/tweet';

function generateShareToken(): string {
  return Math.random().toString(36).slice(2, 7);
}

export async function createBuzz(data: NewBuzzData): Promise<{ buzzId: string; shareToken: string }> {
  const shareToken = generateShareToken();

  const docRef = await addDoc(buzzesCollection, {
    ...data,
    shareToken,
    status: 'collecting',
    totalSignatures: 0,
    signedBy: [],
    feedTweetId: null,
    revealTweetId: null,
    createdAt: serverTimestamp(),
    updatedAt: null
  } as any);

  return { buzzId: docRef.id, shareToken };
}

export async function getBuzzByToken(token: string): Promise<Buzz | null> {
  const q = query(buzzesCollection, where('shareToken', '==', token), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return snapshot.docs[0].data();
}

export async function getUserBuzzes(userId: string): Promise<Buzz[]> {
  const q = query(
    buzzesCollection,
    where('createdBy', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => d.data());
}

export async function signBuzz(data: NewSignatureData): Promise<void> {
  const batch = writeBatch(db);

  const sigRef = doc(buzzSignaturesCollection(data.buzzId));
  batch.set(sigRef, {
    ...data,
    createdAt: serverTimestamp(),
    isHidden: false
  } as any);

  const buzzRef = doc(buzzesCollection, data.buzzId);
  batch.update(buzzRef, {
    signedBy: arrayUnion(data.authorId),
    totalSignatures: increment(1),
    updatedAt: serverTimestamp()
  });

  await batch.commit();
}

export async function revealBuzz(buzzId: string): Promise<void> {
  const buzzRef = doc(buzzesCollection, buzzId);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(buzzRef);
    if (!snap.exists()) return;
    if (snap.data().status === 'revealed') return;

    tx.update(buzzRef, {
      status: 'revealed',
      updatedAt: serverTimestamp()
    });
  });
}

export async function hideBuzzSignature(
  buzzId: string,
  signatureId: string,
  isHidden: boolean
): Promise<void> {
  const sigRef = doc(buzzSignaturesCollection(buzzId), signatureId);
  await updateDoc(sigRef, { isHidden });
}

export async function setBuzzFeedTweetId(buzzId: string, tweetId: string): Promise<void> {
  await updateDoc(doc(buzzesCollection, buzzId), { feedTweetId: tweetId });
}

export async function setBuzzRevealTweetId(buzzId: string, tweetId: string): Promise<void> {
  await updateDoc(doc(buzzesCollection, buzzId), { revealTweetId: tweetId });
}

export async function awardBuzzKarma(userId: string, points: number): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { karmaTotal: increment(points) });
}

export async function uploadBuzzMedia(
  buzzId: string,
  authorId: string,
  file: File
): Promise<string> {
  const storageRef = ref(storage, `buzzes/${buzzId}/${authorId}/${file.name}`);
  await uploadBytesResumable(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function sendBuzzRevealTweet(
  buzz: Pick<Buzz, 'id' | 'shareToken' | 'occasion' | 'recipientName' | 'title'>,
  user: TweetUser
): Promise<string> {
  const text =
    buzz.occasion === 'birthday'
      ? `${buzz.recipientName}'s birthday Buzzbook is now open! 📖`
      : `The Buzzbook for ${buzz.recipientName} is now open! 📖`;

  const docRef = await addDoc(tweetsCollection, {
    text,
    images: null,
    parent: null,
    userLikes: [],
    createdBy: user.id,
    userReplies: 0,
    userRetweets: [],
    photoURL: user.photoURL,
    userWatching: [],
    totalWatchers: 0,
    updatedAt: null,
    user,
    createdAt: serverTimestamp(),
    viewingActivity: {
      tmdbId: 'buzz',
      title: buzz.title,
      poster_path: '',
      status: 'buzz-revealed',
      username: user.username,
      photoURL: user.photoURL
    },
    buzzRef: {
      buzzId: buzz.id,
      shareToken: buzz.shareToken,
      occasion: buzz.occasion,
      recipientName: buzz.recipientName,
      title: buzz.title
    }
  } as any);

  return docRef.id;
}

export async function sendBuzzTweet(
  buzz: Pick<Buzz, 'id' | 'shareToken' | 'occasion' | 'recipientName' | 'title'>,
  user: TweetUser
): Promise<string> {
  const text =
    buzz.occasion === 'birthday'
      ? `Just started a Buzz for ${buzz.recipientName}'s birthday — add your page before the Buzzbook is revealed! 🎂`
      : `Just started a Buzz for ${buzz.recipientName} — add your page to the Buzzbook! 📖`;

  const docRef = await addDoc(tweetsCollection, {
    text,
    images: null,
    parent: null,
    userLikes: [],
    createdBy: user.id,
    userReplies: 0,
    userRetweets: [],
    photoURL: user.photoURL,
    userWatching: [],
    totalWatchers: 0,
    updatedAt: null,
    user,
    createdAt: serverTimestamp(),
    // sentinel so the feed renderer knows this is a Buzz tweet
    viewingActivity: {
      tmdbId: 'buzz',
      title: buzz.title,
      poster_path: '',
      status: 'buzz',
      username: user.username,
      photoURL: user.photoURL
    },
    buzzRef: {
      buzzId: buzz.id,
      shareToken: buzz.shareToken,
      occasion: buzz.occasion,
      recipientName: buzz.recipientName,
      title: buzz.title
    }
  } as any);

  return docRef.id;
}
