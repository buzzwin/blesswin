import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import {
  query,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  addDoc,
  serverTimestamp,
  where
} from 'firebase/firestore';
import { impactMomentsCollection } from '@lib/firebase/collections';
import { usersCollection } from '@lib/firebase/collections';
import { CommonLayout } from '@components/layout/common-layout';
import { MainContainer } from '@components/home/main-container';
import { MainHeader } from '@components/home/main-header';
import { ImpactMomentInput } from '@components/impact/impact-moment-input';
import { ImpactMomentCard } from '@components/impact/impact-moment-card';
import { JoinMomentModal } from '@components/impact/join-moment-modal';
import { SEO } from '@components/common/seo';
import { Loading } from '@components/ui/loading';
import { StatsEmpty } from '@components/tweet/stats-empty';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getDoc } from 'firebase/firestore';
import { useAuth } from '@lib/context/auth-context';
import { toast } from 'react-hot-toast';
import { useModal } from '@lib/hooks/useModal';
import type {
  ImpactMomentWithUser,
  RippleType,
  ImpactTag,
  EffortLevel
} from '@lib/types/impact-moment';
import type { ReactElement, ReactNode } from 'react';

export default function HomeFeed(): JSX.Element {
  const router = useRouter();
  const { user } = useAuth();
  const [moments, setMoments] = useState<ImpactMomentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const {
    open: joinModalOpen,
    openModal: openJoinModal,
    closeModal: closeJoinModal
  } = useModal();
  const [selectedMomentForJoin, setSelectedMomentForJoin] =
    useState<ImpactMomentWithUser | null>(null);

  const fetchMoments = async (): Promise<void> => {
    try {
      setLoading(true);
      const snapshot = await getDocs(
        query(impactMomentsCollection, orderBy('createdAt', 'desc'))
      );

      const filteredDocs = snapshot.docs.filter((docSnapshot) => {
        const momentData = docSnapshot.data();
        const isPublic = momentData.isPublic !== false;
        const isCreator = user?.id === momentData.createdBy;
        return isPublic || isCreator;
      });

      const momentsWithUsers = await Promise.all(
        filteredDocs.map(async (docSnapshot) => {
          const momentData = { id: docSnapshot.id, ...docSnapshot.data() };

          if (!momentData.joinedByUsers && momentData.id) {
            try {
              const joinedSnapshot = await getDocs(
                query(
                  impactMomentsCollection,
                  where('joinedFromMomentId', '==', momentData.id)
                )
              );
              momentData.joinedByUsers = joinedSnapshot.docs.map(
                (d) => d.data().createdBy
              );
            } catch (error) {
              console.error('Error fetching joined users:', error);
              momentData.joinedByUsers = [];
            }
          }

          const userDoc = await getDoc(
            doc(usersCollection, momentData.createdBy)
          );
          const userData = userDoc.exists() ? userDoc.data() : null;

          return {
            ...momentData,
            user: userData
              ? {
                  id: userData.id,
                  name: userData.name,
                  username: userData.username,
                  photoURL: userData.photoURL,
                  verified: userData.verified ?? false
                }
              : {
                  id: momentData.createdBy,
                  name: 'Unknown User',
                  username: 'unknown',
                  photoURL: '',
                  verified: false
                }
          } as ImpactMomentWithUser;
        })
      );

      setMoments(momentsWithUsers);
    } catch (error) {
      console.error('Error fetching impact moments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchMoments();
  }, []);

  const handleRipple = async (
    momentId: string,
    rippleType: RippleType
  ): Promise<void> => {
    if (!user?.id) {
      toast.error('Please sign in to react to impact moments');
      return;
    }

    if (rippleType === 'joined_you') {
      void router.push(`/impact/${momentId}/join`);
      return;
    }

    try {
      const momentRef = doc(impactMomentsCollection, momentId);
      const momentDoc = await getDoc(momentRef);

      if (!momentDoc.exists()) {
        toast.error('Impact moment not found');
        return;
      }

      const momentData = momentDoc.data();
      const rippleKey = rippleType as keyof typeof momentData.ripples;
      const currentRipples = momentData.ripples[rippleKey] || [];
      const hasRippled = currentRipples.includes(user.id);

      const reactionTypes: RippleType[] = ['inspired', 'grateful', 'sent_love'];
      for (const type of reactionTypes) {
        if (type !== rippleType && momentData.ripples[type]?.includes(user.id)) {
          await updateDoc(momentRef, {
            [`ripples.${type}`]: arrayRemove(user.id)
          });
        }
      }

      if (hasRippled) {
        await updateDoc(momentRef, {
          [`ripples.${rippleKey}`]: arrayRemove(user.id)
        });
        toast.success(`Removed ${rippleType} reaction`);
      } else {
        await updateDoc(momentRef, {
          [`ripples.${rippleKey}`]: arrayUnion(user.id)
        });
        toast.success(`Added ${rippleType} reaction! ✨`);

        const momentCreatorId = momentData.createdBy;
        if (momentCreatorId && momentCreatorId !== user.id) {
          try {
            await fetch('/api/karma/award', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: momentCreatorId, action: 'reaction_received' })
            });
          } catch (karmaError) {
            console.error('Error awarding karma for reaction:', karmaError);
          }
        }
      }

      await fetchMoments();
    } catch (error) {
      console.error('Error updating ripple:', error);
      toast.error('Failed to update ripple');
    }
  };

  const handleJoinMoment = async (joinedMomentData: {
    text: string;
    tags: ImpactTag[];
    effortLevel: EffortLevel;
    moodCheckIn?: { before: number; after: number };
    images?: string[];
  }): Promise<void> => {
    if (!user?.id || !selectedMomentForJoin) {
      toast.error('Unable to join action');
      return;
    }

    const momentId = selectedMomentForJoin.id;
    const originalCreatorId = selectedMomentForJoin.createdBy;

    try {
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
        joinedFromMomentId: momentId
      };

      if (joinedMomentData.moodCheckIn) {
        (joinedMoment as any).moodCheckIn = joinedMomentData.moodCheckIn;
      }
      if (joinedMomentData.images && joinedMomentData.images.length > 0) {
        (joinedMoment as any).images = joinedMomentData.images;
      }

      await addDoc(impactMomentsCollection, joinedMoment as any);

      const originalMomentRef = doc(impactMomentsCollection, momentId);
      const originalMomentDoc = await getDoc(originalMomentRef);

      if (originalMomentDoc.exists()) {
        const originalData = originalMomentDoc.data();
        const currentJoinedBy = originalData.joinedByUsers || [];
        const currentJoinedYouRipples = originalData.ripples?.joined_you || [];

        if (!currentJoinedBy.includes(user.id)) {
          await updateDoc(originalMomentRef, {
            joinedByUsers: arrayUnion(user.id),
            'ripples.joined_you': arrayUnion(user.id),
            rippleCount: (originalData.rippleCount || 0) + 1
          });
        } else if (!currentJoinedYouRipples.includes(user.id)) {
          await updateDoc(originalMomentRef, {
            'ripples.joined_you': arrayUnion(user.id),
            rippleCount: (originalData.rippleCount || 0) + 1
          });
        }
      }

      try {
        await fetch('/api/karma/award', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, action: 'joined_you_created' })
        });

        if (originalCreatorId && originalCreatorId !== user.id) {
          await fetch('/api/karma/award', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: originalCreatorId, action: 'joined_you_received' })
          });
        }
      } catch (karmaError) {
        console.error('Error awarding karma for joined action:', karmaError);
      }

      closeJoinModal();
      setSelectedMomentForJoin(null);

      if (momentId) {
        void router.push(`/impact/${momentId}/ripple`);
      } else {
        await fetchMoments();
      }
    } catch (error) {
      console.error('Error joining moment:', error);
      throw error;
    }
  };

  const handleMomentCreated = (): void => {
    void fetchMoments();
  };

  return (
    <MainContainer>
      <SEO
        title='Home / Buzzwin'
        description='Share moments and celebrate the people you love.'
      />
      <MainHeader title='Home' />

      {/* Post to feed */}
      <div className='mb-3'>
        <ImpactMomentInput onSuccess={handleMomentCreated} />
      </div>

      {/* Buzzbook nudge */}
      <Link href='/buzzes/new'>
        <a className='mb-4 flex items-center gap-3 rounded-2xl border p-4 transition-all
                      border-[rgba(255,179,0,0.2)] bg-[rgba(255,179,0,0.04)]
                      hover:border-[rgba(255,179,0,0.35)] hover:bg-[rgba(255,179,0,0.07)]
                      dark:border-[rgba(255,179,0,0.15)] dark:bg-[rgba(255,179,0,0.03)]'>
          <svg viewBox='0 0 64 64' fill='none' className='h-10 w-10 shrink-0' aria-hidden='true'>
            <path d='M32 28 Q22 24 12 28 L12 50 Q22 46 32 50 Z' fill='#FFB300' stroke='#7a3e20' strokeWidth='1.5' strokeLinejoin='round'/>
            <path d='M32 28 Q42 24 52 28 L52 50 Q42 46 32 50 Z' fill='#E5407A' stroke='#7a3e20' strokeWidth='1.5' strokeLinejoin='round'/>
            <line x1='32' y1='28' x2='32' y2='50' stroke='#7a3e20' strokeWidth='1.5' strokeLinecap='round'/>
            <path d='M32 3 L33.5 10.5 L40.5 12 L33.5 13.5 L32 21 L30.5 13.5 L23.5 12 L30.5 10.5 Z' fill='#FFB300'/>
          </svg>
          <div className='min-w-0 flex-1'>
            <p className='text-sm font-bold text-[#1a1108] dark:text-[#F5EFE6]'>
              Something to celebrate together?
            </p>
            <p className='mt-0.5 text-xs text-[#6b5744] dark:text-[rgba(245,239,230,0.5)]'>
              Everyone adds a page — you open it as a Buzzbook.
            </p>
          </div>
          <span className='shrink-0 text-sm font-bold' style={{ color: '#FFB300' }}>Make one →</span>
        </a>
      </Link>

      {/* Community feed */}
      <section>
        {loading ? (
          <Loading className='mt-5' />
        ) : moments.length === 0 ? (
          <StatsEmpty
            title='Nothing shared yet'
            description='Be the first to share a moment with the community.'
          />
        ) : (
          <AnimatePresence mode='popLayout'>
            {moments.map((moment, idx) => (
              <ImpactMomentCard
                key={moment.id || `moment-${idx}`}
                moment={moment}
                onRipple={handleRipple}
              />
            ))}
          </AnimatePresence>
        )}
      </section>

      {selectedMomentForJoin && (
        <JoinMomentModal
          originalMoment={selectedMomentForJoin}
          open={joinModalOpen}
          closeModal={() => {
            closeJoinModal();
            setSelectedMomentForJoin(null);
          }}
          onJoin={handleJoinMoment}
        />
      )}
    </MainContainer>
  );
}

HomeFeed.getLayout = (page: ReactElement): ReactNode => (
  <CommonLayout>{page}</CommonLayout>
);
