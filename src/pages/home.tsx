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
  increment,
  addDoc,
  serverTimestamp,
  where
} from 'firebase/firestore';
import { impactMomentsCollection } from '@lib/firebase/collections';
import { usersCollection } from '@lib/firebase/collections';
import { CommonLayout } from '@components/layout/common-layout';
import { MainLayout } from '@components/layout/main-layout';
import { MainContainer } from '@components/home/main-container';
import { MainHeader } from '@components/home/main-header';
import { ImpactMomentInput } from '@components/impact/impact-moment-input';
import { ImpactMomentCard } from '@components/impact/impact-moment-card';
import { JoinMomentModal } from '@components/impact/join-moment-modal';
import { RitualsBanner } from '@components/rituals/rituals-banner';
import { RitualStatsWidget } from '@components/rituals/ritual-stats-widget';
import { RitualSettings } from '@components/rituals/ritual-settings';
import { UserKarmaDisplay } from '@components/user/user-karma-display';
import { StoryFeedCard } from '@components/stories/story-feed-card';
import { DEFAULT_KARMA_BREAKDOWN } from '@lib/types/karma';
import { SEO } from '@components/common/seo';
import { Loading } from '@components/ui/loading';
import { StatsEmpty } from '@components/tweet/stats-empty';
import { Sparkles } from 'lucide-react';
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
import type { RitualDefinition, RitualStats } from '@lib/types/ritual';
import type { RealStory } from '@lib/types/real-story';
import type { ReactElement, ReactNode } from 'react';

export default function HomeFeed(): JSX.Element {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [moments, setMoments] = useState<ImpactMomentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const {
    open: joinModalOpen,
    openModal: openJoinModal,
    closeModal: closeJoinModal
  } = useModal();
  const {
    open: settingsModalOpen,
    openModal: openSettingsModal,
    closeModal: closeSettingsModal
  } = useModal();
  const [selectedMomentForJoin, setSelectedMomentForJoin] =
    useState<ImpactMomentWithUser | null>(null);
  const [todayRitual, setTodayRitual] = useState<RitualDefinition | null>(null);
  const [ritualCompleted, setRitualCompleted] = useState(false);
  const [ritualStats, setRitualStats] = useState<RitualStats | null>(null);
  const [ritualStatsLoading, setRitualStatsLoading] = useState(false);
  const [userKarma, setUserKarma] = useState<{
    karmaPoints: number;
    karmaBreakdown: typeof DEFAULT_KARMA_BREAKDOWN;
  } | null>(null);
  const [featuredStories, setFeaturedStories] = useState<RealStory[]>([]);
  const [storiesLoading, setStoriesLoading] = useState(false);

  const fetchMoments = async (): Promise<void> => {
    try {
      setLoading(true);
      const snapshot = await getDocs(
        query(impactMomentsCollection, orderBy('createdAt', 'desc'))
      );

      // Filter moments based on privacy: show public moments to all, private moments only to creator
      const filteredDocs = snapshot.docs.filter((docSnapshot) => {
        const momentData = docSnapshot.data();
        const isPublic = momentData.isPublic !== false; // Default to true for backward compatibility
        const isCreator = user?.id === momentData.createdBy;
        // Show if public OR if user is the creator
        return isPublic || isCreator;
      });

      const momentsWithUsers = await Promise.all(
        filteredDocs.map(async (docSnapshot) => {
          const momentData = { id: docSnapshot.id, ...docSnapshot.data() };

          // If joinedByUsers doesn't exist, query for it
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

          // Fetch user data
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

  // Fetch featured stories for feed - CACHE ONLY (no Gemini calls)
  const fetchFeaturedStories = async (): Promise<void> => {
    try {
      setStoriesLoading(true);
      const response = await fetch('/api/real-stories?cacheOnly=true');
      if (response.ok) {
        const data = await response.json();
        if (data.stories && Array.isArray(data.stories)) {
          // Take top 2-3 stories to feature in feed
          setFeaturedStories(data.stories.slice(0, 3));
        }
      }
    } catch (error) {
      console.error('Error fetching featured stories:', error);
    } finally {
      setStoriesLoading(false);
    }
  };

  // Fetch user karma
  const fetchUserKarma = async (): Promise<void> => {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/karma/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserKarma({
            karmaPoints: data.karmaPoints || 0,
            karmaBreakdown: data.karmaBreakdown || DEFAULT_KARMA_BREAKDOWN
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user karma:', error);
    }
  };

  // Fetch today's ritual for banner
  const fetchTodayRitual = async (): Promise<void> => {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/rituals/today?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.rituals?.globalRitual) {
          const ritual = data.rituals.globalRitual;
          setTodayRitual(ritual);
          setRitualCompleted(ritual.completed || false);
        }
      }
    } catch (error) {
      console.error("Error fetching today's ritual:", error);
    }
  };

  // Fetch ritual stats
  const fetchRitualStats = async (): Promise<void> => {
    if (!user?.id) return;
    setRitualStatsLoading(true);
    try {
      const response = await fetch(`/api/rituals/stats?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.stats) {
          setRitualStats(data.stats);
        }
      }
    } catch (error) {
      console.error('Error fetching ritual stats:', error);
    } finally {
      setRitualStatsLoading(false);
    }
  };

  // All useEffect hooks must be before any early returns
  useEffect(() => {
    void fetchMoments();
    void fetchFeaturedStories();
  }, []);

  useEffect(() => {
    void fetchUserKarma();
  }, [user?.id]);

  useEffect(() => {
    void fetchTodayRitual();
  }, [user?.id]);

  useEffect(() => {
    void fetchRitualStats();
  }, [user?.id]);

  const handleRipple = async (
    momentId: string,
    rippleType: RippleType
  ): Promise<void> => {
    if (!user?.id) {
      toast.error('Please sign in to react to impact moments');
      return;
    }

    // Only handle reactions: inspired, grateful, sent_love
    // Join is handled separately via "Join This Action" button
    if (rippleType === 'joined_you') {
      // This should not happen, but if it does, redirect to join page
      void router.push(`/impact/${momentId}/join`);
      return;
    }

    // Regular reaction handling
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

      // Check if user has reacted in any other category
      let wasReactedElsewhere = false;
      const reactionTypes: RippleType[] = ['inspired', 'grateful', 'sent_love'];
      for (const type of reactionTypes) {
        if (
          type !== rippleType &&
          momentData.ripples[type]?.includes(user.id)
        ) {
          wasReactedElsewhere = true;
          // Remove from other category
          await updateDoc(momentRef, {
            [`ripples.${type}`]: arrayRemove(user.id)
          });
        }
      }

      if (hasRippled) {
        // Remove reaction
        await updateDoc(momentRef, {
          [`ripples.${rippleKey}`]: arrayRemove(user.id)
        });
        toast.success(`Removed ${rippleType} reaction`);
      } else {
        // Add reaction
        await updateDoc(momentRef, {
          [`ripples.${rippleKey}`]: arrayUnion(user.id)
        });
        toast.success(`Added ${rippleType} reaction! ✨`);

        // Award karma to moment creator for receiving reaction (if not themselves)
        const momentCreatorId = momentData.createdBy;
        if (momentCreatorId && momentCreatorId !== user.id) {
          try {
            await fetch('/api/karma/award', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: momentCreatorId,
                action: 'reaction_received'
              })
            });
          } catch (karmaError) {
            console.error('Error awarding karma for reaction:', karmaError);
            // Don't fail the reaction if karma fails
          }
        }
      }

      // Refresh moments to show updated ripple counts
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

    // Save the moment ID and creator ID before clearing state
    // After the null check above, selectedMomentForJoin is guaranteed to be non-null
    const momentId = selectedMomentForJoin.id;
    const originalCreatorId = selectedMomentForJoin.createdBy;

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
        joinedFromMomentId: momentId
      };

      // Add optional fields
      if (joinedMomentData.moodCheckIn) {
        (joinedMoment as any).moodCheckIn = joinedMomentData.moodCheckIn;
      }
      if (joinedMomentData.images && joinedMomentData.images.length > 0) {
        (joinedMoment as any).images = joinedMomentData.images;
      }

      // Create the joined moment
      const joinedMomentRef = await addDoc(
        impactMomentsCollection,
        joinedMoment as any
      );

      // Update the original moment
      const originalMomentRef = doc(impactMomentsCollection, momentId);
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

      // Award karma for "Joined You" actions
      try {
        // Award karma to user who joined
        await fetch('/api/karma/award', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            action: 'joined_you_created'
          })
        });

        // Award karma to original creator (if not themselves)
        if (originalCreatorId && originalCreatorId !== user.id) {
          await fetch('/api/karma/award', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: originalCreatorId,
              action: 'joined_you_received'
            })
          });
        }
      } catch (karmaError) {
        console.error('Error awarding karma for joined action:', karmaError);
        // Don't fail the join if karma fails
      }

      // Refresh karma display
      void fetchUserKarma();

      // Redirect to ripple page to see the join
      closeJoinModal();
      setSelectedMomentForJoin(null);

      if (momentId) {
        void router.push(`/impact/${momentId}/ripple`);
      } else {
        // Fallback: refresh moments if no ID
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
        title='Community Feed - Stories of Good / Buzzwin'
        description='A social feed amplifying stories of creativity, kindness, and community impact. Share meditation insights, yoga practices, and positive news from do-gooders around the world.'
      />
      <MainHeader title='Community Feed' useMobileSidebar />

      {/* Feed Description */}
      <div className='border-b border-light-border py-2 dark:border-dark-border'>
        <div className='flex items-start gap-3'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30'>
            <Sparkles className='h-5 w-5 text-purple-600 dark:text-purple-400' />
          </div>
          <div className='flex-1'>
            <h3 className='mb-1 text-sm font-semibold text-gray-900 dark:text-white'>
              Amplify Stories of Good
            </h3>
            <p className='text-xs text-gray-600 dark:text-gray-400'>
              Share meditation insights, yoga practices, acts of kindness, and
              community impact stories. Together we're building a more hopeful
              world.
            </p>
          </div>
        </div>
      </div>

      {/* Karma Display */}
      {userKarma && user?.id && (
        <div className='border-b border-gray-200 py-2 dark:border-gray-700'>
          <UserKarmaDisplay
            karmaPoints={userKarma.karmaPoints}
            karmaBreakdown={userKarma.karmaBreakdown}
            userId={user.id}
            compact={false}
            showBreakdown={true}
            showEncouragement={true}
          />
        </div>
      )}

      {/* Ritual Stats Widget */}
      <div className='border-b border-gray-200 py-2 dark:border-gray-700'>
        <RitualStatsWidget
          stats={ritualStats}
          loading={ritualStatsLoading}
          onSettingsClick={openSettingsModal}
        />
      </div>

      {/* Rituals Banner */}
      {todayRitual && !ritualCompleted && (
        <RitualsBanner
          ritual={todayRitual}
          completed={ritualCompleted}
          onDismiss={() => setTodayRitual(null)}
          onComplete={() => {
            // Navigate to rituals page or open completion flow
            window.location.href = '/rituals';
          }}
          onViewAll={() => {
            window.location.href = '/rituals';
          }}
        />
      )}

      <div className='py-2'>
        <ImpactMomentInput onSuccess={handleMomentCreated} />
      </div>

      <section>
        {loading ? (
          <Loading className='mt-5' />
        ) : moments.length === 0 && featuredStories.length === 0 ? (
          <StatsEmpty
            title='Welcome to the Ritual Feed!'
            description="Be the first to share a ritual participation! Share how you completed a ritual today - whether it's your breathing practice, morning meditation, or any other ritual you participated in."
            imageData={{
              src: '/assets/no-buzz.png',
              alt: 'No ritual participations yet'
            }}
          />
        ) : (
          <AnimatePresence mode='popLayout'>
            {(() => {
              // Interleave stories with moments: show 1 story after every 3-4 moments
              const feedItems: Array<{
                type: 'moment' | 'story';
                data: ImpactMomentWithUser | RealStory;
                index: number;
              }> = [];
              let storyIndex = 0;

              moments.forEach((moment, momentIndex) => {
                // Add moment
                feedItems.push({
                  type: 'moment',
                  data: moment,
                  index: momentIndex
                });

                // Add a story after every 3 moments (at positions 3, 7, 11, etc.)
                if (
                  (momentIndex + 1) % 4 === 0 &&
                  storyIndex < featuredStories.length
                ) {
                  feedItems.push({
                    type: 'story',
                    data: featuredStories[storyIndex],
                    index: storyIndex
                  });
                  storyIndex++;
                }
              });

              // Add remaining stories at the end if any
              while (storyIndex < featuredStories.length) {
                feedItems.push({
                  type: 'story',
                  data: featuredStories[storyIndex],
                  index: storyIndex
                });
                storyIndex++;
              }

              return feedItems.map((item, idx) => {
                if (item.type === 'story') {
                  return (
                    <StoryFeedCard
                      key={`story-${item.index}`}
                      story={item.data as RealStory}
                      index={item.index}
                    />
                  );
                } else {
                  const moment = item.data as ImpactMomentWithUser;
                  return (
                    <ImpactMomentCard
                      key={moment.id || `moment-${idx}`}
                      moment={moment}
                      onRipple={handleRipple}
                    />
                  );
                }
              });
            })()}
          </AnimatePresence>
        )}
      </section>

      {/* Join Moment Modal */}
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

      {/* Ritual Settings Modal */}
      <RitualSettings
        open={settingsModalOpen}
        closeModal={closeSettingsModal}
      />
    </MainContainer>
  );
}

HomeFeed.getLayout = (page: ReactElement): ReactNode => (
  <CommonLayout>
    {page}
  </CommonLayout>
);
