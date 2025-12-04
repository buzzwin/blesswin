import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import type { RitualDefinition } from '@lib/types/ritual';
import type { ImpactMoment } from '@lib/types/impact-moment';

const impactMomentsCollection = collection(db, 'impact_moments');

/**
 * Calculate ripple count for an impact moment
 * Ripples = number of users who joined this action
 */
export function calculateMomentRipples(moment: ImpactMoment): number {
  return moment.joinedByUsers?.length || 0;
}

/**
 * Calculate ripple count for a ritual
 * Ripples = users who joined ritual + sum of all ripples from moments created from this ritual
 */
export async function calculateRitualRipples(ritual: RitualDefinition): Promise<number> {
  // Start with users who joined the ritual
  const joinedUsersCount = ritual.joinedByUsers?.length || 0;
  
  // Sum ripples from all impact moments created from this ritual
  let momentRipplesSum = 0;
  
  if (ritual.id) {
    try {
      // Query all impact moments created from this ritual
      const momentsQuery = query(
        impactMomentsCollection,
        where('ritualId', '==', ritual.id)
      );
      const momentsSnapshot = await getDocs(momentsQuery);
      
      momentsSnapshot.forEach((doc) => {
        const momentData = doc.data() as ImpactMoment;
        const momentRipples = calculateMomentRipples(momentData);
        momentRipplesSum += momentRipples;
      });
    } catch (error) {
      console.error('Error calculating ritual ripples:', error);
      // Return joined users count even if moment query fails
    }
  }
  
  return joinedUsersCount + momentRipplesSum;
}

/**
 * Get all impact moments created from a ritual
 */
export async function getRitualMoments(ritualId: string): Promise<ImpactMoment[]> {
  try {
    const momentsQuery = query(
      impactMomentsCollection,
      where('ritualId', '==', ritualId)
    );
    const momentsSnapshot = await getDocs(momentsQuery);
    
    return momentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    } as ImpactMoment));
  } catch (error) {
    console.error('Error fetching ritual moments:', error);
    return [];
  }
}

