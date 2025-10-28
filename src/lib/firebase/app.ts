import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFirebaseConfig } from './config';



const app = initializeApp(getFirebaseConfig());

export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();

// Set auth persistence to use local storage (works on both desktop and mobile)
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence);
}





