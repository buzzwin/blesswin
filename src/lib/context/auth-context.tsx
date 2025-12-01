import { useState, useEffect, useContext, createContext, useMemo } from 'react';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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

// Add Firebase error type
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

  // Detect if user is on mobile device
  const isMobileDevice = (): boolean => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };

  // Handle redirect result
  useEffect(() => {
    const handleRedirectResult = async (): Promise<void> => {
      try {
        // Add a small delay for iOS Safari to ensure redirect is ready
        if (typeof window !== 'undefined' && isMobileDevice()) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        const result = await getRedirectResult(auth);
        if (result && result.user) {
          setLoading(true); // Set loading state during redirect handling

          // Check for redirect path
          const redirectPath =
            typeof window !== 'undefined'
              ? sessionStorage.getItem('redirectAfterLogin') ||
                new URLSearchParams(window.location.search).get('redirect')
              : null;
          const authUser = result.user;
          const { uid, displayName, photoURL } = authUser;

          const userSnapshot = await getDoc(doc(usersCollection, uid));

          if (!userSnapshot.exists()) {
            let available = false;
            let randomUsername = '';

            while (!available) {
              const normalizeName = displayName
                ?.replace(/\s/g, '')
                .toLowerCase();
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
              coverPhotoURL: null
            };

            const userStatsData: WithFieldValue<Stats> = {
              likes: [],
              tweets: [],
              updatedAt: null
            };

            await Promise.all([
              setDoc(doc(usersCollection, uid), userData),
              setDoc(doc(userStatsCollection(uid), 'stats'), userStatsData)
            ]);

            const newUser = (await getDoc(doc(usersCollection, uid))).data();
            setUser(newUser as User);
            setLoading(false);
          } else {
            const userData = userSnapshot.data();
            setUser(userData);
            setLoading(false);
          }

          toast.success('Successfully signed in!');

          // Redirect to the stored path or default to home
          // Use replace instead of href for better iOS Safari compatibility
          if (redirectPath && typeof window !== 'undefined') {
            sessionStorage.removeItem('redirectAfterLogin');
            // Use replace to avoid adding to history, better for redirects
            window.location.replace(redirectPath);
          } else if (typeof window !== 'undefined') {
            // Default redirect to home if no specific path
            window.location.replace('/home');
          }
        }
      } catch (error) {
        const firebaseError = error as FirebaseError;
        console.error('Redirect result error:', firebaseError);

        // More specific error handling for iOS Safari
        if (firebaseError.code === 'auth/network-request-failed') {
          toast.error(
            'Network error. Please check your connection and try again.'
          );
        } else if (
          firebaseError.code === 'auth/popup-closed-by-user' ||
          firebaseError.code === 'auth/cancelled-popup-request'
        ) {
          // User cancelled, don't show error
          return;
        } else {
          toast.error('Failed to complete sign in. Please try again.');
        }
        setError(error as Error);
        setLoading(false);
      }
    };

    void handleRedirectResult();
  }, []);

  useEffect(() => {
    const manageUser = async (authUser: AuthUser): Promise<void> => {
      const { uid, displayName, photoURL } = authUser;

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
        } catch (error) {
          setError(error as Error);
        }
      } else {
        const userData = userSnapshot.data();
        setUser(userData);
      }

      setLoading(false);
    };

    const handleUserAuth = (authUser: AuthUser | null): void => {
      setLoading(true);

      if (authUser) {
        void manageUser(authUser).then(() => {
          // Check for redirect path after successful login (for email/password login)
          const redirectPath =
            typeof window !== 'undefined'
              ? sessionStorage.getItem('redirectAfterLogin') ||
                new URLSearchParams(window.location.search).get('redirect')
              : null;

          if (redirectPath && typeof window !== 'undefined') {
            sessionStorage.removeItem('redirectAfterLogin');
            // Use replace for better iOS Safari compatibility
            setTimeout(() => {
              window.location.replace(redirectPath);
            }, 500);
          }
        });
      } else {
        setUser(null);
        setLoading(false);
      }
    };

    onAuthStateChanged(auth, handleUserAuth);
  }, []);

  useEffect(() => {
    if (!user) return;

    const { id } = user;

    const unsubscribeUser = onSnapshot(doc(usersCollection, id), (doc) => {
      setUser(doc.data() as User);
    });

    const unsubscribeBookmarks = onSnapshot(
      userBookmarksCollection(id),
      (snapshot) => {
        const bookmarks = snapshot.docs.map((doc) => doc.data());
        setUserBookmarks(bookmarks);
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

      // Add custom parameters for better mobile support
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      // Use redirect for mobile devices, popup for desktop
      if (isMobileDevice()) {
        // Store current URL for redirect back
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname + window.location.search;
          if (currentPath !== '/login') {
            sessionStorage.setItem('redirectAfterLogin', currentPath);
          }
        }
        await signInWithRedirect(auth, provider);
        // Don't show success message yet as user will be redirected
        // The redirect will be handled by handleRedirectResult
      } else {
        await signInWithPopup(auth, provider);
        toast.success('Successfully signed in with Google!');
      }
    } catch (error) {
      const firebaseError = error as FirebaseError;
      if (
        firebaseError.code === 'auth/popup-closed-by-user' ||
        firebaseError.code === 'auth/cancelled-popup-request'
      ) {
        toast.error('Sign in cancelled');
      } else if (firebaseError.code === 'auth/network-request-failed') {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error('Failed to sign in with Google. Please try again.');
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

      // Use redirect for mobile devices, popup for desktop
      if (isMobileDevice()) {
        // Store current URL for redirect back
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname + window.location.search;
          if (currentPath !== '/login') {
            sessionStorage.setItem('redirectAfterLogin', currentPath);
          }
        }
        await signInWithRedirect(auth, provider);
        // Don't show success message yet as user will be redirected
        // The redirect will be handled by handleRedirectResult
      } else {
        await signInWithPopup(auth, provider);
        toast.success('Successfully signed in with Facebook!');
      }
    } catch (error) {
      const firebaseError = error as FirebaseError;
      if (
        firebaseError.code === 'auth/popup-closed-by-user' ||
        firebaseError.code === 'auth/cancelled-popup-request'
      ) {
        toast.error('Sign in cancelled');
      } else if (firebaseError.code === 'auth/network-request-failed') {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error('Failed to sign in with Facebook. Please try again.');
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
