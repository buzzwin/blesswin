import { AnimatePresence } from 'framer-motion';
import { query, orderBy, getDocs, doc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { impactMomentsCollection } from '@lib/firebase/collections';
import { usersCollection } from '@lib/firebase/collections';
import { ProtectedLayout } from '@components/layout/common-layout';
import { MainLayout } from '@components/layout/main-layout';
import { MainContainer } from '@components/home/main-container';
import { MainHeader } from '@components/home/main-header';
import { ImpactMomentInput } from '@components/impact/impact-moment-input';
import { ImpactMomentCard } from '@components/impact/impact-moment-card';
import { SEO } from '@components/common/seo';
import { Loading } from '@components/ui/loading';
import { StatsEmpty } from '@components/tweet/stats-empty';
import { Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getDoc } from 'firebase/firestore';
import { useAuth } from '@lib/context/auth-context';
import { toast } from 'react-hot-toast';
import type { ImpactMomentWithUser, RippleType } from '@lib/types/impact-moment';
import type { ReactElement, ReactNode } from 'react';

export default function HomeFeed(): JSX.Element {
  const { user } = useAuth();
  const [moments, setMoments] = useState<ImpactMomentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMoments = async (): Promise<void> => {
    try {
      setLoading(true);
      const snapshot = await getDocs(
        query(impactMomentsCollection, orderBy('createdAt', 'desc'))
      );

      const momentsWithUsers = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
          const momentData = { id: docSnapshot.id, ...docSnapshot.data() };
          
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
  }, []);

  const handleRipple = async (momentId: string, rippleType: RippleType): Promise<void> => {
    if (!user?.id) {
      toast.error('Please sign in to ripple impact moments');
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
      }

      // Refresh moments to show updated ripple counts
      await fetchMoments();
    } catch (error) {
      console.error('Error updating ripple:', error);
      toast.error('Failed to update ripple');
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
      <div className='border-b border-light-border px-4 py-3 dark:border-dark-border'>
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

      <div className='px-4 py-4'>
        <ImpactMomentInput onSuccess={handleMomentCreated} />
      </div>
      
      <section>
        {loading ? (
          <Loading className='mt-5' />
        ) : moments.length === 0 ? (
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
            {moments.map((moment) => (
              <ImpactMomentCard
                key={moment.id}
                moment={moment}
                onRipple={handleRipple}
              />
            ))}
          </AnimatePresence>
        )}
      </section>
    </MainContainer>
  );
}

HomeFeed.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout>
    <MainLayout>{page}</MainLayout>
  </ProtectedLayout>
);

