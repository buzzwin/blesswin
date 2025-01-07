import {
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  collection
} from 'firebase/firestore';
import { db } from '../app';
import type { WatchClub, WatchClubWithUser, ClubMedia } from '@lib/types/watchclub';

const watchClubsRef = collection(db, 'watchClubs');
const usersRef = collection(db, 'users');

export const createWatchClub = async (
  clubData: Omit<WatchClub, 'id' | 'createdAt' | 'updatedAt' | 'members' | 'totalMembers'>
): Promise<string> => {
  try {
    const newClubData = {
      ...clubData,
      members: [clubData.createdBy],
      totalMembers: 1,
      createdAt: serverTimestamp(),
      updatedAt: null
    };
    
    console.log('Creating club with data:', newClubData);
    const docRef = await addDoc(watchClubsRef, newClubData);
    console.log('Created club with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating watch club:', error);
    throw error;
  }
};

export const joinWatchClub = async (
  clubId: string,
  userId: string
): Promise<void> => {
  const clubRef = doc(watchClubsRef, clubId);
  
  await updateDoc(clubRef, {
    members: arrayUnion(userId),
    totalMembers: increment(1)
  });
};

export const leaveWatchClub = async (
  clubId: string,
  userId: string
): Promise<void> => {
  const clubRef = doc(watchClubsRef, clubId);
  
  await updateDoc(clubRef, {
    members: arrayRemove(userId),
    totalMembers: increment(-1)
  });
};

export const getWatchClubs = async (): Promise<WatchClubWithUser[]> => {
  try {
    console.log('Starting to fetch watch clubs...');
    const q = query(
      watchClubsRef,
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    console.log('Found', snapshot.docs.length, 'clubs');

    const clubs = await Promise.all(
      snapshot.docs.map(async (docSnapshot) => {
        console.log('Processing club document:', docSnapshot.id);
        const clubData = docSnapshot.data();
        console.log('Club data:', clubData);

        const userRef = doc(usersRef, clubData.createdBy);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        if (!userData) {
          console.error('User not found for club:', docSnapshot.id);
          throw new Error(`User not found: ${clubData.createdBy}`);
        }

        console.log('Found user data:', userData);

        const clubWithUser = {
          ...clubData,
          id: docSnapshot.id,
          user: {
            id: userData.id,
            name: userData.name,
            username: userData.username,
            photoURL: userData.photoURL,
            verified: userData.verified
          }
        };

        console.log('Processed club with user:', clubWithUser);
        return clubWithUser;
      })
    );

    console.log('Final processed clubs:', clubs);
    return clubs;
  } catch (error) {
    console.error('Error fetching watch clubs:', error);
    throw error;
  }
};

export const addMediaToClub = async (
  clubId: string,
  mediaData: Omit<ClubMedia, 'id' | 'createdAt' | 'discussions'>
): Promise<void> => {
  const clubRef = doc(watchClubsRef, clubId);
  
  await updateDoc(clubRef, {
    media: arrayUnion({
      ...mediaData,
      id: crypto.randomUUID(),
      createdAt: serverTimestamp(),
      discussions: []
    })
  });
}; 