import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import type { RitualDefinition } from '@lib/types/ritual';
import type { ImpactMoment } from '@lib/types/impact-moment';

const impactMomentsCollection = collection(db, 'impact_moments');

/**
 * Calculate ripple count for an impact moment
 * NOTE: Ripples only refer to reactions (inspired, grateful, sent_love), NOT users who joined.
 * Use moment.joinedByUsers.length for joined user count.
 * Returns sum of reactions to this moment.
 */
export function calculateMomentRipples(moment: ImpactMoment): number {
  return (moment.ripples?.inspired?.length || 0) +
         (moment.ripples?.grateful?.length || 0) +
         (moment.ripples?.sent_love?.length || 0);
}

/**
 * Calculate ripple count for a ritual
 * NOTE: Ripples only refer to reactions to impact moments (inspired, grateful, sent_love).
 * This function does NOT count users who joined the ritual - use joinedByUsers.length for that.
 * Returns sum of all ripples from moments created from this ritual.
 */
export async function calculateRitualRipples(ritual: RitualDefinition): Promise<number> {
  // Sum ripples (reactions) from all impact moments created from this ritual
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
        // Count reactions (inspired, grateful, sent_love) - NOT joined users
        const momentRipples = (momentData.ripples?.inspired?.length || 0) +
                              (momentData.ripples?.grateful?.length || 0) +
                              (momentData.ripples?.sent_love?.length || 0);
        momentRipplesSum += momentRipples;
      });
    } catch (error) {
      console.error('Error calculating ritual ripples:', error);
    }
  }
  
  return momentRipplesSum;
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

