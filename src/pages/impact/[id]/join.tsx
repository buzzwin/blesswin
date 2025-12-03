import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  doc,
  getDoc,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp
} from 'firebase/firestore';
import {
  impactMomentsCollection,
  usersCollection
} from '@lib/firebase/collections';
import { PublicLayout } from '@components/layout/pub_layout';
import { MainHeader } from '@components/home/main-header';
import { ImpactMomentCard } from '@components/impact/impact-moment-card';
import { JoinMomentModal } from '@components/impact/join-moment-modal';
import { Loading } from '@components/ui/loading';
import { ArrowLeft, LogIn, Users, Sparkles, Heart, Lightbulb, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useAuth } from '@lib/context/auth-context';
import { useModal } from '@lib/hooks/useModal';
import { siteURL } from '@lib/env';
import type { ImpactMomentWithUser } from '@lib/types/impact-moment';
import type { ImpactTag, EffortLevel } from '@lib/types/impact-moment';

export default function JoinActionPage(): JSX.Element {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = router.query;
  const [originalMoment, setOriginalMoment] = useState<ImpactMomentWithUser | null>(null);
  const [joinedMoments, setJoinedMoments] = useState<ImpactMomentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { open: joinModalOpen, openModal: openJoinModal, closeModal: closeJoinModal } = useModal();

  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);

        // Fetch original moment
        const originalDoc = await getDoc(doc(impactMomentsCollection, id));

        if (!originalDoc.exists()) {
          toast.error('Impact moment not found');
          void router.push('/');
          return;
        }

        const originalData = { id: originalDoc.id, ...originalDoc.data() };

        // Update joinedByUsers count if not present
        if (!originalData.joinedByUsers) {
          const joinedSnapshot = await getDocs(
            query(
              impactMomentsCollection,
              where('joinedFromMomentId', '==', id)
            )
          );
          originalData.joinedByUsers = joinedSnapshot.docs.map(
            (d) => d.data().createdBy
          );
        }

        const originalUserDoc = await getDoc(
          doc(usersCollection, originalData.createdBy)
        );
        const originalUserData = originalUserDoc.exists()
          ? originalUserDoc.data()
          : null;

        setOriginalMoment({
          ...originalData,
          user: originalUserData
            ? {
                id: originalUserData.id,
                name: originalUserData.name,
                username: originalUserData.username,
                photoURL: originalUserData.photoURL,
                verified: originalUserData.verified ?? false
              }
            : {
                id: originalData.createdBy,
                name: 'Unknown User',
                username: 'unknown',
                photoURL: '',
                verified: false
              }
        } as ImpactMomentWithUser);

        // Fetch joined moments for social proof
        let joinedSnapshot;
        try {
          const joinedQuery = query(
            impactMomentsCollection,
            where('joinedFromMomentId', '==', id),
            orderBy('createdAt', 'asc')
          );
          joinedSnapshot = await getDocs(joinedQuery);
        } catch (error) {
          const joinedQuery = query(
            impactMomentsCollection,
            where('joinedFromMomentId', '==', id)
          );
          joinedSnapshot = await getDocs(joinedQuery);
          joinedSnapshot.docs.sort((a, b) => {
            const aCreatedAt = a.data().createdAt;
            const bCreatedAt = b.data().createdAt;
            const aTime =
              aCreatedAt instanceof Date
                ? aCreatedAt.getTime()
                : aCreatedAt?.toMillis?.() || 0;
            const bTime =
              bCreatedAt instanceof Date
                ? bCreatedAt.getTime()
                : bCreatedAt?.toMillis?.() || 0;
            return aTime - bTime;
          });
        }

        const joinedWithUsers = await Promise.all(
          joinedSnapshot.docs.slice(0, 5).map(async (joinedDoc) => {
            const joinedData = { id: joinedDoc.id, ...joinedDoc.data() };
            const joinedUserDoc = await getDoc(
              doc(usersCollection, joinedData.createdBy)
            );
            const joinedUserData = joinedUserDoc.exists()
              ? joinedUserDoc.data()
              : null;

            return {
              ...joinedData,
              user: joinedUserData
                ? {
                    id: joinedUserData.id,
                    name: joinedUserData.name,
                    username: joinedUserData.username,
                    photoURL: joinedUserData.photoURL,
                    verified: joinedUserData.verified ?? false
                  }
                : {
                    id: joinedData.createdBy,
                    name: 'Unknown User',
                    username: 'unknown',
                    photoURL: '',
                    verified: false
                  }
            } as ImpactMomentWithUser;
          })
        );

        setJoinedMoments(joinedWithUsers);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load action details');
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [id, router]);

  const handleJoin = async (joinedMomentData: {
    text: string;
    tags: ImpactTag[];
    effortLevel: EffortLevel;
    moodCheckIn?: { before: number; after: number };
    images?: string[];
  }): Promise<void> => {
    if (!user?.id || !originalMoment?.id) {
      toast.error('Unable to join action');
      return;
    }

    try {
      // Create the joined moment
      const joinedMoment = {
        text: joinedMomentData.text,
        tags: joinedMomentData.tags,
        effortLevel: joinedMomentData.effortLevel,
        createdBy: user.id,
        createdAt: serverTimestamp(),
        ripples: {
          inspired: [],
          grateful: [],
          joined_you: [],
          sent_love: []
        },
        rippleCount: 0,
        joinedFromMomentId: originalMoment.id
      };

      // Add optional fields
      if (joinedMomentData.moodCheckIn) {
        (joinedMoment as any).moodCheckIn = joinedMomentData.moodCheckIn;
      }
      if (joinedMomentData.images && joinedMomentData.images.length > 0) {
        (joinedMoment as any).images = joinedMomentData.images;
      }

      // Create the joined moment
      await addDoc(impactMomentsCollection, joinedMoment as any);

      // Update the original moment
      const originalMomentRef = doc(impactMomentsCollection, originalMoment.id);
      const originalMomentDoc = await getDoc(originalMomentRef);
      
      if (originalMomentDoc.exists()) {
        const originalData = originalMomentDoc.data();
        const currentJoinedBy = originalData.joinedByUsers || [];
        const currentJoinedYouRipples = originalData.ripples?.joined_you || [];
        
        // Add user to joinedByUsers if not already there
        if (!currentJoinedBy.includes(user.id)) {
          await updateDoc(originalMomentRef, {
            joinedByUsers: arrayUnion(user.id),
            'ripples.joined_you': arrayUnion(user.id),
            rippleCount: (originalData.rippleCount || 0) + 1
          });
        } else {
          // User already in list, just update ripple
          if (!currentJoinedYouRipples.includes(user.id)) {
            await updateDoc(originalMomentRef, {
              'ripples.joined_you': arrayUnion(user.id),
              rippleCount: (originalData.rippleCount || 0) + 1
            });
          }
        }
      }

      // Award karma
      try {
        await fetch('/api/karma/award', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            action: 'joined_action'
          })
        });

        const originalCreatorId = originalMoment.createdBy;
        if (originalCreatorId && originalCreatorId !== user.id) {
          await fetch('/api/karma/award', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: originalCreatorId,
              action: 'action_joined'
            })
          });
        }
      } catch (karmaError) {
        console.error('Error awarding karma:', karmaError);
      }

      toast.success('You joined this action! 🌱');
      closeJoinModal();
      
      // Redirect to ripple page to see the join
      void router.push(`/impact/${originalMoment.id}/ripple`);
    } catch (error) {
      console.error('Error joining action:', error);
      toast.error('Failed to join action');
      throw error;
    }
  };

  if (loading) {
    return (
      <PublicLayout
        title='Join Action - Buzzwin'
        description='Join this positive action and create a ripple of impact'
      >
        <MainHeader title='Join Action' />
        <div className='dark:bg-dark-background mx-auto min-h-screen max-w-2xl bg-main-background px-4 py-8'>
          <Loading className='mt-5' />
        </div>
      </PublicLayout>
    );
  }

  if (!originalMoment) {
    return (
      <PublicLayout
        title='Action Not Found - Buzzwin'
        description='The action you are looking for could not be found'
      >
        <MainHeader title='Join Action' />
        <div className='mx-auto max-w-2xl px-4 py-8'>
          <div className='rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800'>
            <p className='mb-4 text-gray-600 dark:text-gray-400'>
              Action not found
            </p>
            <Link href='/'>
              <a className='inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 dark:text-purple-400'>
                <ArrowLeft className='h-4 w-4' />
                Back to Home
              </a>
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const publicUrl = `${siteURL || 'https://buzzwin.com'}/impact/${id}/join`;
  const userName = originalMoment.user.name;
  const seoTitle = `Join ${userName}'s Action - Buzzwin`;
  const seoDescription = `Join ${userName}'s positive action and create a ripple of impact`;

  // Don't allow creators to join their own action
  if (originalMoment.createdBy === user?.id) {
    return (
      <PublicLayout title={seoTitle} description={seoDescription}>
        <MainHeader title='Join Action' />
        <div className='dark:bg-dark-background mx-auto min-h-screen max-w-2xl bg-main-background px-4 py-8'>
          <div className='rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800'>
            <p className='mb-4 text-gray-600 dark:text-gray-400'>
              You created this action! View the ripple to see who joined.
            </p>
            <Link href={`/impact/${id}/ripple`}>
              <a className='inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700'>
                View Ripple
              </a>
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <>
      <PublicLayout title={seoTitle} description={seoDescription} ogUrl={publicUrl}>
        <div className='dark:bg-dark-background mx-auto min-h-screen max-w-2xl bg-main-background px-4 py-8'>
          {/* Back Button */}
          <div className='mb-4'>
            <Link href={`/impact/${id}/ripple`}>
              <a className='inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'>
                <ArrowLeft className='h-4 w-4' />
                Back to Ripple
              </a>
            </Link>
          </div>

          {/* Hero Section */}
          <div className='mb-8 rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-8 text-center dark:border-purple-800 dark:from-purple-900/20 dark:to-pink-900/20'>
            <div className='mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600'>
              <Sparkles className='h-8 w-8 text-white' />
            </div>
            <h1 className='mb-3 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl'>
              Join This Action
            </h1>
            <p className='mx-auto max-w-lg text-lg text-gray-700 dark:text-gray-300'>
              Be part of a growing ripple of positive impact. Your action matters and inspires others to do the same.
            </p>
          </div>

          {/* Original Action Card */}
          <div className='mb-8'>
            <div className='mb-4 flex items-center gap-2'>
              <Heart className='h-5 w-5 text-purple-600 dark:text-purple-400' />
              <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
                The Original Action
              </h2>
            </div>
            <div className='rounded-lg border-2 border-purple-300 bg-purple-50 p-4 dark:border-purple-700 dark:bg-purple-900/20'>
              <ImpactMomentCard
                moment={originalMoment}
                onRipple={() => {
                  if (!user) {
                    void router.push(`/login?redirect=/impact/${id}/join`);
                  }
                }}
              />
            </div>
          </div>

          {/* Social Proof */}
          {joinedMoments.length > 0 && (
            <div className='mb-8'>
              <div className='mb-4 flex items-center gap-2'>
                <Users className='h-5 w-5 text-green-600 dark:text-green-400' />
                <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
                  Others Who Joined ({joinedMoments.length}+)
                </h2>
              </div>
              <div className='space-y-3'>
                {joinedMoments.map((joinedMoment) => (
                  <div
                    key={joinedMoment.id}
                    className='rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800'
                  >
                    <ImpactMomentCard
                      moment={joinedMoment}
                      onRipple={() => {
                        if (!user) {
                          void router.push(`/login?redirect=/impact/${id}/join`);
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className='mt-4 text-center'>
                <Link href={`/impact/${id}/ripple`}>
                  <a className='text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300'>
                    View all ripples →
                  </a>
                </Link>
              </div>
            </div>
          )}

          {/* Why Join Section */}
          <div className='mb-8 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'>
            <div className='mb-4 flex items-center gap-2'>
              <Lightbulb className='h-5 w-5 text-yellow-600 dark:text-yellow-400' />
              <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
                Why Join?
              </h2>
            </div>
            <div className='space-y-4'>
              <div className='flex items-start gap-3'>
                <TrendingUp className='mt-1 h-5 w-5 shrink-0 text-green-600 dark:text-green-400' />
                <div>
                  <h3 className='font-semibold text-gray-900 dark:text-white'>
                    Create a Ripple Effect
                  </h3>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    Your action inspires others, creating a ripple of positive impact.
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Heart className='mt-1 h-5 w-5 shrink-0 text-red-600 dark:text-red-400' />
                <div>
                  <h3 className='font-semibold text-gray-900 dark:text-white'>
                    Build Community
                  </h3>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    Connect with others who share your values and commitment to making a difference.
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Sparkles className='mt-1 h-5 w-5 shrink-0 text-purple-600 dark:text-purple-400' />
                <div>
                  <h3 className='font-semibold text-gray-900 dark:text-white'>
                    Earn Karma Points
                  </h3>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    Get rewarded for your positive actions and track your impact over time.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Join CTA */}
          <div className='rounded-lg border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-8 text-center dark:border-green-800 dark:from-green-900/20 dark:to-emerald-900/20'>
            {user ? (
              <>
                <h2 className='mb-3 text-2xl font-bold text-gray-900 dark:text-white'>
                  Ready to Join?
                </h2>
                <p className='mb-6 text-gray-700 dark:text-gray-300'>
                  Share how you're joining this action and inspire others to do the same.
                </p>
                <button
                  onClick={() => {
                    // Check if user already joined
                    const checkExistingJoin = async (): Promise<void> => {
                      try {
                        const existingJoined = await getDocs(
                          query(
                            impactMomentsCollection,
                            where('joinedFromMomentId', '==', id),
                            where('createdBy', '==', user.id)
                          )
                        );

                        if (!existingJoined.empty) {
                          const confirmed = confirm('You already joined this action. Want to share a new version?');
                          if (!confirmed) return;
                        }

                        openJoinModal();
                      } catch (error) {
                        console.error('Error checking existing joins:', error);
                        openJoinModal();
                      }
                    };
                    void checkExistingJoin();
                  }}
                  className='inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:from-green-700 hover:to-emerald-700 hover:shadow-lg dark:from-green-600 dark:to-emerald-600 dark:hover:from-green-700 dark:hover:to-emerald-700'
                >
                  <span className='text-2xl'>🌱</span>
                  Join This Action
                </button>
              </>
            ) : (
              <>
                <h2 className='mb-3 text-2xl font-bold text-gray-900 dark:text-white'>
                  Sign In to Join
                </h2>
                <p className='mb-6 text-gray-700 dark:text-gray-300'>
                  Create an account or sign in to join this action and be part of the ripple.
                </p>
                <Link href={`/login?redirect=/impact/${id}/join`}>
                  <a className='inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:from-purple-700 hover:to-pink-700 hover:shadow-lg dark:from-purple-600 dark:to-pink-600 dark:hover:from-purple-700 dark:hover:to-pink-700'>
                    <LogIn className='h-5 w-5' />
                    Sign In to Join
                  </a>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Join Modal */}
        {originalMoment && user && (
          <JoinMomentModal
            originalMoment={originalMoment}
            open={joinModalOpen}
            closeModal={closeJoinModal}
            onJoin={handleJoin}
          />
        )}
      </PublicLayout>
    </>
  );
}

