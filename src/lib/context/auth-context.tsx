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

  // Check if sessionStorage is accessible (iOS Safari may block it)
  const isSessionStorageAvailable = (): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      const testKey = '__sessionStorage_test__';
      sessionStorage.setItem(testKey, 'test');
      sessionStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Check if localStorage is accessible
  const isLocalStorageAvailable = (): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
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

          // Check for redirect path (try sessionStorage first, then localStorage)
          let redirectPath: string | null = null;
          if (typeof window !== 'undefined') {
            try {
              redirectPath =
                sessionStorage.getItem('redirectAfterLogin') ||
                localStorage.getItem('redirectAfterLogin') ||
                new URLSearchParams(window.location.search).get('redirect');
            } catch (e) {
              // Storage not accessible, try URL params only
              redirectPath = new URLSearchParams(window.location.search).get(
                'redirect'
              );
            }
          }
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
            // Clean up both storage locations
            try {
              sessionStorage.removeItem('redirectAfterLogin');
              localStorage.removeItem('redirectAfterLogin');
            } catch (e) {
              // Storage not accessible, continue anyway
            }
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
        if (
          firebaseError.message?.includes('missing initial state') ||
          firebaseError.code === 'auth/argument-error'
        ) {
          // iOS Safari sessionStorage issue
          toast.error(
            'Storage access issue detected. Please try signing in again or use email/password login.',
            { duration: 6000 }
          );
          // Clear any stale redirect state
          if (typeof window !== 'undefined') {
            try {
              sessionStorage.removeItem('redirectAfterLogin');
              localStorage.removeItem('redirectAfterLogin');
            } catch (e) {
              // Ignore storage errors
            }
          }
        } else if (firebaseError.code === 'auth/network-request-failed') {
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
          let redirectPath: string | null = null;
          if (typeof window !== 'undefined') {
            try {
              redirectPath =
                sessionStorage.getItem('redirectAfterLogin') ||
                localStorage.getItem('redirectAfterLogin') ||
                new URLSearchParams(window.location.search).get('redirect');
            } catch (e) {
              redirectPath = new URLSearchParams(window.location.search).get(
                'redirect'
              );
            }
          }

          if (redirectPath && typeof window !== 'undefined') {
            // Clean up both storage locations
            try {
              sessionStorage.removeItem('redirectAfterLogin');
              localStorage.removeItem('redirectAfterLogin');
            } catch (e) {
              // Storage not accessible, continue anyway
            }
            // Use replace for better iOS Safari compatibility
            setTimeout(() => {
              window.location.replace(redirectPath as string);
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

      const isMobile = isMobileDevice();
      const sessionStorageAvailable = isSessionStorageAvailable();
      const localStorageAvailable = isLocalStorageAvailable();

      // For iOS Safari, if sessionStorage is blocked, use popup instead
      // This avoids the "missing initial state" error
      if (isMobile && !sessionStorageAvailable) {
        // iOS Safari with blocked sessionStorage - use popup
        try {
          await signInWithPopup(auth, provider);
          toast.success('Successfully signed in with Google!');
          return;
        } catch (popupError) {
          const popupFirebaseError = popupError as FirebaseError;
          if (
            popupFirebaseError.code === 'auth/popup-blocked' ||
            popupFirebaseError.code === 'auth/popup-closed-by-user'
          ) {
            // Popup blocked or closed, suggest email/password
            toast.error(
              'Popup blocked. Please use email/password login or enable popups.',
              { duration: 5000 }
            );
            return;
          }
          throw popupError;
        }
      }

      // Use redirect for mobile devices (when sessionStorage is available), popup for desktop
      if (isMobile && sessionStorageAvailable) {
        // Store current URL for redirect back
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname + window.location.search;
          if (currentPath !== '/login') {
            // Try sessionStorage first, fallback to localStorage
            try {
              sessionStorage.setItem('redirectAfterLogin', currentPath);
            } catch (e) {
              if (localStorageAvailable) {
                localStorage.setItem('redirectAfterLogin', currentPath);
              }
            }
          }
        }
        await signInWithRedirect(auth, provider);
        // Don't show success message yet as user will be redirected
        // The redirect will be handled by handleRedirectResult
      } else {
        // Desktop or mobile with popup fallback
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
      } else if (firebaseError.code === 'auth/popup-blocked') {
        toast.error(
          'Popup blocked. Please enable popups or use email/password login.',
          { duration: 5000 }
        );
      } else if (firebaseError.code === 'auth/network-request-failed') {
        toast.error('Network error. Please check your connection.');
      } else if (
        firebaseError.message?.includes('missing initial state') ||
        firebaseError.code === 'auth/argument-error'
      ) {
        // iOS Safari sessionStorage issue - suggest popup or email
        toast.error(
          'Storage issue detected. Please try email/password login or enable popups.',
          { duration: 5000 }
        );
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

      const isMobile = isMobileDevice();
      const sessionStorageAvailable = isSessionStorageAvailable();
      const localStorageAvailable = isLocalStorageAvailable();

      // For iOS Safari, if sessionStorage is blocked, use popup instead
      if (isMobile && !sessionStorageAvailable) {
        // iOS Safari with blocked sessionStorage - use popup
        try {
          await signInWithPopup(auth, provider);
          toast.success('Successfully signed in with Facebook!');
          return;
        } catch (popupError) {
          const popupFirebaseError = popupError as FirebaseError;
          if (
            popupFirebaseError.code === 'auth/popup-blocked' ||
            popupFirebaseError.code === 'auth/popup-closed-by-user'
          ) {
            toast.error(
              'Popup blocked. Please use email/password login or enable popups.',
              { duration: 5000 }
            );
            return;
          }
          throw popupError;
        }
      }

      // Use redirect for mobile devices (when sessionStorage is available), popup for desktop
      if (isMobile && sessionStorageAvailable) {
        // Store current URL for redirect back
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname + window.location.search;
          if (currentPath !== '/login') {
            // Try sessionStorage first, fallback to localStorage
            try {
              sessionStorage.setItem('redirectAfterLogin', currentPath);
            } catch (e) {
              if (localStorageAvailable) {
                localStorage.setItem('redirectAfterLogin', currentPath);
              }
            }
          }
        }
        await signInWithRedirect(auth, provider);
        // Don't show success message yet as user will be redirected
        // The redirect will be handled by handleRedirectResult
      } else {
        // Desktop or mobile with popup fallback
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
      } else if (firebaseError.code === 'auth/popup-blocked') {
        toast.error(
          'Popup blocked. Please enable popups or use email/password login.',
          { duration: 5000 }
        );
      } else if (firebaseError.code === 'auth/network-request-failed') {
        toast.error('Network error. Please check your connection.');
      } else if (
        firebaseError.message?.includes('missing initial state') ||
        firebaseError.code === 'auth/argument-error'
      ) {
        // iOS Safari sessionStorage issue - suggest popup or email
        toast.error(
          'Storage issue detected. Please try email/password login or enable popups.',
          { duration: 5000 }
        );
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
