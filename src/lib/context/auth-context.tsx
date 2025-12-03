import { useState, useEffect, useContext, createContext, useMemo, useRef } from 'react';
import {
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  onAuthStateChanged,
  signOut as signOutFirebase,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { auth } from '@lib/firebase/app';
import {
  usersCollection,
  userStatsCollection,
  userBookmarksCollection
} from '@lib/firebase/collections';
import { getRandomId, getRandomInt } from '@lib/random';
import { DefaultAvatar } from '@components/ui/default-avatar';
import { DEFAULT_KARMA_BREAKDOWN } from '@lib/types/karma';
import type { ReactNode } from 'react';
import type { User as AuthUser } from 'firebase/auth';
import type { WithFieldValue } from 'firebase/firestore';
import type { User } from '@lib/types/user';
import type { Bookmark } from '@lib/types/bookmark';
import type { Stats } from '@lib/types/stats';

type AuthContext = {
  user: User | null;
  error: Error | null;
  loading: boolean;
  isAdmin: boolean;
  randomSeed: string;
  userBookmarks: Bookmark[] | null;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInAnon: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  createUserWithEmail: (email: string, password: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  isEmailVerified: boolean;
  userEmail: string | null;
};

export const AuthContext = createContext<AuthContext | null>(null);

type AuthContextProviderProps = {
  children: ReactNode;
};

// Firebase error type
type FirebaseError = {
  code: string;
  message: string;
};

export function AuthContextProvider({
  children
}: AuthContextProviderProps): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [userBookmarks, setUserBookmarks] = useState<Bookmark[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const isInitialLoad = useRef(true);
  const previousUserId = useRef<string | null>(null);

  // Handle auth state changes - single source of truth
  useEffect(() => {
    const manageUser = async (authUser: AuthUser): Promise<void> => {
      const { uid, displayName, photoURL } = authUser;
      const isNewSignIn = !isInitialLoad.current && previousUserId.current !== uid;

      const userSnapshot = await getDoc(doc(usersCollection, uid));

      if (!userSnapshot.exists()) {
        let available = false;
        let randomUsername = '';

        while (!available) {
          const normalizeName = displayName?.replace(/\s/g, '').toLowerCase();
          const randomInt = getRandomInt(1, 10_000);

          randomUsername = `${normalizeName as string}${randomInt}`;

          const randomUserSnapshot = await getDoc(
            doc(usersCollection, randomUsername)
          );

          if (!randomUserSnapshot.exists()) available = true;
        }

        const userData: WithFieldValue<User> = {
          id: uid,
          bio: null,
          name: (displayName as string) ?? 'anonymous',
          theme: null,
          accent: null,
          website: null,
          location: null,
          photoURL: photoURL ?? '/logo.PNG',
          username: randomUsername,
          verified: false,
          following: [],
          followers: [],
          createdAt: serverTimestamp(),
          updatedAt: null,
          totalTweets: 0,
          totalPhotos: 0,
          pinnedTweet: null,
          coverPhotoURL: null,
          // Initialize karma fields
          karmaPoints: 0,
          karmaBreakdown: DEFAULT_KARMA_BREAKDOWN,
          lastKarmaUpdate: serverTimestamp()
        };

        const userStatsData: WithFieldValue<Stats> = {
          likes: [],
          tweets: [],
          updatedAt: null
        };

        try {
          await Promise.all([
            setDoc(doc(usersCollection, uid), userData),
            setDoc(doc(userStatsCollection(uid), 'stats'), userStatsData)
          ]);

          const newUser = (await getDoc(doc(usersCollection, uid))).data();
          setUser(newUser as User);
          
          if (isNewSignIn) {
            toast.success('Successfully signed in!');
          }
        } catch (error) {
          setError(error as Error);
        }
      } else {
        const userData = userSnapshot.data();
        setUser(userData);
        
        if (isNewSignIn) {
          toast.success('Successfully signed in!');
        }
      }

      previousUserId.current = uid;
      setLoading(false);
    };

    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setLoading(true);
      if (authUser) {
        void manageUser(authUser);
      } else {
        setUser(null);
        previousUserId.current = null;
        setLoading(false);
      }
      isInitialLoad.current = false;
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const { id } = user;

    const unsubscribeUser = onSnapshot(
      doc(usersCollection, id),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setUser(docSnapshot.data());
        }
      },
      (error) => {
        console.error('Error in user snapshot listener:', error);
        // Don't set error state here - just log it
        // The user might not exist yet, which is okay
      }
    );

    const unsubscribeBookmarks = onSnapshot(
      userBookmarksCollection(id),
      (snapshot) => {
        const bookmarks = snapshot.docs.map((doc) => doc.data());
        setUserBookmarks(bookmarks);
      },
      (error) => {
        console.error('Error in bookmarks snapshot listener:', error);
        // Don't set error state here - just log it
        // Bookmarks might not be accessible yet
      }
    );

    return () => {
      unsubscribeUser();
      unsubscribeBookmarks();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const signInWithGoogle = async (): Promise<void> => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      await signInWithPopup(auth, provider);
      // Success toast will be shown by onAuthStateChanged handler
    } catch (error) {
      const firebaseError = error as FirebaseError;
      
      if (
        firebaseError.code === 'auth/popup-closed-by-user' ||
        firebaseError.code === 'auth/cancelled-popup-request'
      ) {
        // User cancelled - don't show error
        return;
      } else if (firebaseError.code === 'auth/popup-blocked') {
        toast.error(
          'Popup was blocked. Please allow popups for this site and try again, or use email/password login.',
          { duration: 6000 }
        );
      } else if (firebaseError.code === 'auth/network-request-failed') {
        toast.error(
          'Network error. Please check your connection and try again.'
        );
      } else {
        const errorMessage = firebaseError.message || 'Unknown error occurred';
        toast.error(`Failed to sign in with Google: ${errorMessage}`);
      }
      setError(error as Error);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await signOutFirebase(auth);
      toast.success('Successfully signed out');
    } catch (error) {
      toast.error('Failed to sign out');
      setError(error as Error);
    }
  };

  const signInWithFacebook = async (): Promise<void> => {
    try {
      const provider = new FacebookAuthProvider();

      await signInWithPopup(auth, provider);
      // Success toast will be shown by onAuthStateChanged handler
    } catch (error) {
      const firebaseError = error as FirebaseError;
      
      if (
        firebaseError.code === 'auth/popup-closed-by-user' ||
        firebaseError.code === 'auth/cancelled-popup-request'
      ) {
        // User cancelled - don't show error
        return;
      } else if (firebaseError.code === 'auth/popup-blocked') {
        toast.error(
          'Popup was blocked. Please allow popups for this site and try again, or use email/password login.',
          { duration: 6000 }
        );
      } else if (firebaseError.code === 'auth/network-request-failed') {
        toast.error(
          'Network error. Please check your connection and try again.'
        );
      } else {
        const errorMessage = firebaseError.message || 'Unknown error occurred';
        toast.error(`Failed to sign in with Facebook: ${errorMessage}`);
      }
      setError(error as Error);
    }
  };

  const signInAnon = async (): Promise<void> => {
    try {
      await signInAnonymously(auth);
      toast.success('Signed in as guest');
    } catch (error) {
      toast.error('Failed to sign in as guest');
      setError(error as Error);
    }
  };

  const signInWithEmail = async (
    email: string,
    password: string
  ): Promise<void> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Successfully signed in!');
    } catch (error) {
      const firebaseError = error as FirebaseError;
      switch (firebaseError.code) {
        case 'auth/wrong-password':
          toast.error('Incorrect password');
          break;
        case 'auth/user-not-found':
          toast.error('No account found with this email');
          break;
        case 'auth/too-many-requests':
          toast.error('Too many attempts. Please try again later');
          break;
        default:
          toast.error('Failed to sign in. Please try again');
      }
      throw error;
    }
  };

  const createUserWithEmail = async (
    email: string,
    password: string
  ): Promise<void> => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success('Account created successfully!');
    } catch (error) {
      const firebaseError = error as FirebaseError;
      switch (firebaseError.code) {
        case 'auth/email-already-in-use':
          toast.error('Email already exists. Please try logging in instead');
          break;
        case 'auth/weak-password':
          toast.error('Password is too weak. Please use a stronger password');
          break;
        case 'auth/invalid-email':
          toast.error('Invalid email address');
          break;
        default:
          toast.error('Failed to create account. Please try again');
      }
      throw error;
    }
  };

  const sendVerificationEmail = async (): Promise<void> => {
    if (auth.currentUser && !auth.currentUser.emailVerified) {
      try {
        await sendEmailVerification(auth.currentUser);
        toast.success('Verification email sent!');
      } catch (error) {
        toast.error('Error sending verification email');
      }
    }
  };

  const isAdmin = user ? user.username === 'link2sources' : false;
  const randomSeed = useMemo(getRandomId, [user?.id]);

  const value: AuthContext = {
    user,
    error,
    loading,
    isAdmin,
    randomSeed,
    userBookmarks,
    signOut,
    signInWithGoogle,
    signInWithFacebook,
    signInAnon,
    signInWithEmail,
    createUserWithEmail,
    sendVerificationEmail,
    isEmailVerified: auth.currentUser?.emailVerified ?? false,
    userEmail: auth.currentUser?.email ?? null
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContext {
  const context = useContext(AuthContext);

  if (!context)
    throw new Error('useAuth must be used within an AuthContextProvider');

  return context;
}
