import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { query, orderBy, getDocs, doc, updateDoc, arrayUnion, arrayRemove, increment, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { impactMomentsCollection } from '@lib/firebase/collections';
import { usersCollection } from '@lib/firebase/collections';
import { ProtectedLayout } from '@components/layout/common-layout';
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
import type { ImpactMomentWithUser, RippleType, ImpactTag, EffortLevel } from '@lib/types/impact-moment';
import type { RitualDefinition, RitualStats } from '@lib/types/ritual';
import type { RealStory } from '@lib/types/real-story';
import type { ReactElement, ReactNode } from 'react';

export default function HomeFeed(): JSX.Element {
  const router = useRouter();
  const { user } = useAuth();
  const [moments, setMoments] = useState<ImpactMomentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { open: joinModalOpen, openModal: openJoinModal, closeModal: closeJoinModal } = useModal();
  const { open: settingsModalOpen, openModal: openSettingsModal, closeModal: closeSettingsModal } = useModal();
  const [selectedMomentForJoin, setSelectedMomentForJoin] = useState<ImpactMomentWithUser | null>(null);
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

      const momentsWithUsers = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
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
              momentData.joinedByUsers = joinedSnapshot.docs.map(d => d.data().createdBy);
            } catch (error) {
              console.error('Error fetching joined users:', error);
              momentData.joinedByUsers = [];
            }
          }
          
          // Fetch user data
          const userDoc = await getDoc(doc(usersCollection, momentData.createdBy));
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
    void fetchFeaturedStories();
  }, []);

  // Fetch featured stories for feed
  const fetchFeaturedStories = async (): Promise<void> => {
    try {
      setStoriesLoading(true);
      const response = await fetch('/api/real-stories');
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
  useEffect(() => {
    if (!user?.id) return;
    void fetchUserKarma();
  }, [user?.id]);

  // Fetch today's ritual for banner
  useEffect(() => {
    if (!user?.id) return;

    const fetchTodayRitual = async (): Promise<void> => {
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
        console.error('Error fetching today\'s ritual:', error);
      }
    };

    void fetchTodayRitual();
  }, [user?.id]);

  // Fetch ritual stats
  useEffect(() => {
    if (!user?.id) return;

    const fetchRitualStats = async (): Promise<void> => {
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

    void fetchRitualStats();
  }, [user?.id]);

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

  const handleRipple = async (momentId: string, rippleType: RippleType): Promise<void> => {
    if (!user?.id) {
      toast.error('Please sign in to ripple impact moments');
      return;
    }

    // Special handling for "Joined You" - open modal instead
    if (rippleType === 'joined_you') {
      const moment = moments.find(m => m.id === momentId);
      if (moment) {
        // Don't allow users to join their own actions
        if (moment.createdBy === user.id) {
          toast.error('You cannot join your own action');
          return;
        }

        try {
          // Check if user already joined this moment
          const existingJoined = await getDocs(
            query(
              impactMomentsCollection,
              where('joinedFromMomentId', '==', momentId),
              where('createdBy', '==', user.id)
            )
          );

          if (!existingJoined.empty) {
            const existing = existingJoined.docs[0].data();
            const originalTextPreview = moment.text.substring(0, 50);
            if (existing.text && existing.text.includes(originalTextPreview)) {
              const confirmed = confirm('You already joined this action. Want to share a new version?');
              if (!confirmed) return;
            }
          }

          setSelectedMomentForJoin(moment);
          openJoinModal();
        } catch (error) {
          console.error('Error checking existing joins:', error);
          // Still allow joining even if check fails
          setSelectedMomentForJoin(moment);
          openJoinModal();
        }
      }
      return;
    }

    // Regular ripple handling for other types
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

      // Check if user has rippled in any other category
      let wasRippledElsewhere = false;
      const allRippleTypes: RippleType[] = ['inspired', 'grateful', 'joined_you', 'sent_love'];
      for (const type of allRippleTypes) {
        if (type !== rippleType && momentData.ripples[type]?.includes(user.id)) {
          wasRippledElsewhere = true;
          // Remove from other category
          await updateDoc(momentRef, {
            [`ripples.${type}`]: arrayRemove(user.id)
          });
        }
      }

      if (hasRippled) {
        // Remove ripple
        await updateDoc(momentRef, {
          [`ripples.${rippleKey}`]: arrayRemove(user.id),
          rippleCount: momentData.rippleCount > 0 ? momentData.rippleCount - 1 : 0
        });
        toast.success(`Removed ${rippleType} ripple`);
      } else {
        // Add ripple
        await updateDoc(momentRef, {
          [`ripples.${rippleKey}`]: arrayUnion(user.id),
          rippleCount: momentData.rippleCount + (wasRippledElsewhere ? 0 : 1)
        });
        toast.success(`Added ${rippleType} ripple! ✨`);

        // Award karma to moment creator for receiving ripple (if not themselves)
        const momentCreatorId = momentData.createdBy;
        if (momentCreatorId && momentCreatorId !== user.id) {
          try {
            await fetch('/api/karma/award', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: momentCreatorId,
                action: 'ripple_received'
              })
            });
          } catch (karmaError) {
            console.error('Error awarding karma for ripple:', karmaError);
            // Don't fail the ripple if karma fails
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
      const joinedMomentRef = await addDoc(impactMomentsCollection, joinedMoment as any);

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

      // Redirect to chain page to see the join
      closeJoinModal();
      setSelectedMomentForJoin(null);
      
      if (momentId) {
        void router.push(`/impact/${momentId}/chain`);
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
      <div className='border-b border-light-border py-3 dark:border-dark-border'>
        <div className='flex items-start gap-3'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30'>
            <Sparkles className='h-5 w-5 text-purple-600 dark:text-purple-400' />
          </div>
          <div className='flex-1'>
            <h3 className='mb-1 text-sm font-semibold text-gray-900 dark:text-white'>
              Amplify Stories of Good
            </h3>
            <p className='text-xs text-gray-600 dark:text-gray-400'>
              Share meditation insights, yoga practices, acts of kindness, and community impact stories. 
              Together we're building a more hopeful world.
            </p>
          </div>
        </div>
      </div>

      {/* Karma Display */}
      {userKarma && user?.id && (
        <div className='border-b border-gray-200 py-4 dark:border-gray-700'>
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
      <div className='border-b border-gray-200 py-4 dark:border-gray-700'>
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

      <div className='py-4'>
        <ImpactMomentInput onSuccess={handleMomentCreated} />
      </div>
      
      <section>
        {loading ? (
          <Loading className='mt-5' />
        ) : moments.length === 0 && featuredStories.length === 0 ? (
          <StatsEmpty
            title='Welcome to the Impact Feed!'
            description="Be the first to share an Impact Moment! Share a small good deed you did today - whether it's cooking a healthy meal, picking up trash, or calling an old friend."
            imageData={{ 
              src: '/assets/no-buzz.png', 
              alt: 'No impact moments yet'
            }}
          />
        ) : (
          <AnimatePresence mode='popLayout'>
            {(() => {
              // Interleave stories with moments: show 1 story after every 3-4 moments
              const feedItems: Array<{ type: 'moment' | 'story'; data: ImpactMomentWithUser | RealStory; index: number }> = [];
              let storyIndex = 0;
              
              moments.forEach((moment, momentIndex) => {
                // Add moment
                feedItems.push({ type: 'moment', data: moment, index: momentIndex });
                
                // Add a story after every 3 moments (at positions 3, 7, 11, etc.)
                if ((momentIndex + 1) % 4 === 0 && storyIndex < featuredStories.length) {
                  feedItems.push({ type: 'story', data: featuredStories[storyIndex], index: storyIndex });
                  storyIndex++;
                }
              });
              
              // Add remaining stories at the end if any
              while (storyIndex < featuredStories.length) {
                feedItems.push({ type: 'story', data: featuredStories[storyIndex], index: storyIndex });
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
  <ProtectedLayout>
    <MainLayout>{page}</MainLayout>
  </ProtectedLayout>
);

