import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  doc,
  getDoc,
  query,
  where,
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
import { ArrowLeft, LogIn } from 'lucide-react';
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
  const [joinedCount, setJoinedCount] = useState(0);
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

        // Fetch joined count for social proof
        const joinedQuery = query(
          impactMomentsCollection,
          where('joinedFromMomentId', '==', id)
        );
        const joinedSnapshot = await getDocs(joinedQuery);
        setJoinedCount(joinedSnapshot.size);
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

          {/* Original Action Card */}
          <div className='mb-8'>
            <ImpactMomentCard
              moment={originalMoment}
              onRipple={() => {
                if (!user) {
                  void router.push(`/login?redirect=/impact/${id}/join`);
                }
              }}
            />
          </div>

          {/* Simple Join CTA */}
          <div className='mb-8 rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-12 text-center dark:border-green-800 dark:from-green-900/20 dark:to-emerald-900/20'>
            {user ? (
              <>
                <h2 className='mb-4 text-3xl font-bold text-gray-900 dark:text-white'>
                  Join This Action 🌱
                </h2>
                <p className='mb-8 text-lg text-gray-700 dark:text-gray-300'>
                  Share how you're joining and inspire others to do the same.
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
                  className='inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 px-10 py-5 text-xl font-bold text-white transition-all hover:from-green-700 hover:to-emerald-700 hover:scale-105 hover:shadow-xl dark:from-green-600 dark:to-emerald-600 dark:hover:from-green-700 dark:hover:to-emerald-700'
                >
                  <span className='text-3xl'>🌱</span>
                  Join This Action
                </button>
                {joinedCount > 0 && (
                  <p className='mt-6 text-sm text-gray-600 dark:text-gray-400'>
                    {joinedCount} {joinedCount === 1 ? 'person has' : 'people have'} already joined
                  </p>
                )}
              </>
            ) : (
              <>
                <h2 className='mb-4 text-3xl font-bold text-gray-900 dark:text-white'>
                  Join This Action 🌱
                </h2>
                <p className='mb-8 text-lg text-gray-700 dark:text-gray-300'>
                  Sign in to join this action and be part of the ripple.
                </p>
                <Link href={`/login?redirect=/impact/${id}/join`}>
                  <a className='inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-10 py-5 text-xl font-bold text-white transition-all hover:from-purple-700 hover:to-pink-700 hover:scale-105 hover:shadow-xl dark:from-purple-600 dark:to-pink-600 dark:hover:from-purple-700 dark:hover:to-pink-700'>
                    <LogIn className='h-6 w-6' />
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

