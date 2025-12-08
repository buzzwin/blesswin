/**
 * UserImpactMoments Component
 * Lists user's impact moments
 */

import { useState, useEffect } from 'react';
import { query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { impactMomentsCollection, usersCollection } from '@lib/firebase/collections';
import { ImpactMomentCard } from '@components/impact/impact-moment-card';
import { Loading } from '@components/ui/loading';
import { StatsEmpty } from '@components/tweet/stats-empty';
import type { ImpactMomentWithUser, RippleType } from '@lib/types/impact-moment';

interface UserImpactMomentsProps {
  userId: string;
  onRipple?: (momentId: string, rippleType: RippleType) => void;
}

export function UserImpactMoments({
  userId,
  onRipple
}: UserImpactMomentsProps): JSX.Element {
  const [moments, setMoments] = useState<ImpactMomentWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserMoments = async (): Promise<void> => {
      if (!userId) return;

      try {
        setLoading(true);
        const snapshot = await getDocs(
          query(
            impactMomentsCollection,
            where('createdBy', '==', userId),
            orderBy('createdAt', 'desc')
          )
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
        console.error('Error fetching user ritual participations:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchUserMoments();
  }, [userId]);

  if (loading) {
    return <Loading className='mt-5' />;
  }

  if (moments.length === 0) {
    return (
      <StatsEmpty
        title='No ritual participations yet'
        description='When you share your ritual participations, they will show up here.'
      />
    );
  }

  return (
    <div className='space-y-0'>
      {moments.map((moment) => (
        <ImpactMomentCard
          key={moment.id}
          moment={moment}
          onRipple={onRipple}
        />
      ))}
    </div>
  );
}

