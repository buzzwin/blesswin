import type { NextApiRequest, NextApiResponse } from 'next';
import { getDocs, query, where, collection } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { ritualsCollection } from '@lib/firebase/collections';
import type { RitualDefinition } from '@lib/types/ritual';
import { getAllRitualDefinitions } from '@lib/data/ritual-definitions';

interface MyRitualsResponse {
  createdRituals: RitualDefinition[];
  joinedRituals: RitualDefinition[];
  availableRituals: RitualDefinition[];
  error?: string;
}

// User custom rituals collection
const userCustomRitualsCollection = (userId: string) =>
  collection(db, 'users', userId, 'custom_rituals');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MyRitualsResponse>
): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({
      createdRituals: [],
      joinedRituals: [],
      availableRituals: [],
      error: 'Method not allowed'
    });
    return;
  }

  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      res.status(400).json({
        createdRituals: [],
        joinedRituals: [],
        availableRituals: [],
        error: 'User ID is required'
      });
      return;
    }

    // Fetch rituals created by the user (custom rituals)
    const customRitualsSnapshot = await getDocs(userCustomRitualsCollection(userId));
    const createdRituals: RitualDefinition[] = customRitualsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as RitualDefinition));

    // Fetch all rituals from Firestore
    const allRitualsSnapshot = await getDocs(ritualsCollection);
    const allFirestoreRituals: RitualDefinition[] = allRitualsSnapshot.docs.map(doc => {
      const data = doc.data();
      // Remove any id field from document data to ensure we use the Firestore document ID
      const { id: _, ...dataWithoutId } = data;
      return {
        id: doc.id, // Use Firestore document ID, not any id field in the document
        ...dataWithoutId
      } as RitualDefinition;
    });

    // Separate joined vs available rituals
    const joinedRituals: RitualDefinition[] = [];
    const availableRituals: RitualDefinition[] = [];
    const joinedRitualIds = new Set<string>();

    allFirestoreRituals.forEach(ritual => {
      const joinedByUsers = ritual.joinedByUsers || [];
      if (joinedByUsers.includes(userId)) {
        joinedRituals.push(ritual);
        if (ritual.id) {
          joinedRitualIds.add(ritual.id);
        }
        // Also track by title for hardcoded rituals
        if (ritual.title) {
          joinedRitualIds.add(ritual.title.toLowerCase());
        }
      } else {
        availableRituals.push(ritual);
      }
    });

    // Only show rituals from Firestore - no hardcoded fallback
    // (Removed hardcoded ritual definitions to only show Firestore rituals)

    res.status(200).json({
      createdRituals,
      joinedRituals,
      availableRituals
    });
  } catch (error) {
    console.error('Error fetching my rituals:', error);
    res.status(500).json({
      createdRituals: [],
      joinedRituals: [],
      availableRituals: [],
      error: error instanceof Error ? error.message : 'Failed to fetch rituals'
    });
  }
}

