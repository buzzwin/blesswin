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
    const customRituals: RitualDefinition[] = customRitualsSnapshot.docs.map(doc => ({
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

    // Combine custom rituals with Firestore rituals for joined check
    // Custom rituals where user is in joinedByUsers should appear in joined rituals
    const allRitualsForJoinedCheck = [...allFirestoreRituals, ...customRituals];

    // Get user-created rituals from main collection (by createdBy or sourceUserId)
    const userCreatedFromMain: RitualDefinition[] = allFirestoreRituals.filter((ritual): ritual is RitualDefinition => {
      const ritualData = ritual as any;
      return ritualData.createdBy === userId || ritualData.sourceUserId === userId;
    });

    // Combine custom rituals and user-created rituals from main collection
    // Deduplicate by ID and sourceRitualId to avoid showing the same ritual twice
    const createdRitualsMap = new Map<string, RitualDefinition>();
    
    // Add custom rituals first
    customRituals.forEach(ritual => {
      if (ritual.id) {
        createdRitualsMap.set(ritual.id, ritual);
      }
    });
    
    // Add user-created rituals from main collection (skip if already in custom)
    userCreatedFromMain.forEach(ritual => {
      const ritualData = ritual as any;
      const sourceId = ritualData.sourceRitualId;
      
      // Only add if not already in custom rituals (by ID or sourceRitualId)
      if (ritual.id && !createdRitualsMap.has(ritual.id)) {
        // Check if any custom ritual has this as sourceRitualId
        const isDuplicate = customRituals.some(cr => {
          const crData = cr as any;
          return cr.id === sourceId || crData.sourceRitualId === ritual.id;
        });
        
        if (!isDuplicate) {
          createdRitualsMap.set(ritual.id, ritual);
        }
      }
    });
    
    const createdRituals: RitualDefinition[] = Array.from(createdRitualsMap.values());

    console.log('[MY-RITUALS] Debug:', {
      userId,
      customRitualsCount: customRituals.length,
      userCreatedFromMainCount: userCreatedFromMain.length,
      totalCreatedCount: createdRituals.length,
      allFirestoreRitualsCount: allFirestoreRituals.length,
      customRitualIds: customRituals.map(r => r.id),
      mainCollectionRitualIds: userCreatedFromMain.map(r => r.id),
      finalCreatedRitualIds: createdRituals.map(r => r.id),
      allRitualScopes: allFirestoreRituals.map(r => ({ 
        id: r.id, 
        scope: r.scope, 
        createdBy: (r as any).createdBy,
        sourceUserId: (r as any).sourceUserId 
      }))
    });

    // Get user's own ritual IDs (both public and private) to exclude from available
    // Include both custom ritual IDs and main collection ritual IDs
    const userOwnRitualIds = new Set(createdRituals.map(r => r.id).filter((id): id is string => Boolean(id)));
    
    // Also track by sourceRitualId for rituals that were copied to main collection
    const userOwnSourceIds = new Set(
      userCreatedFromMain
        .map((r): string | undefined => {
          const rData = r as any;
          return rData.sourceRitualId as string | undefined;
        })
        .filter((id): id is string => Boolean(id))
    );

    // Separate joined vs available rituals
    const joinedRituals: RitualDefinition[] = [];
    const availableRituals: RitualDefinition[] = [];
    const joinedRitualIds = new Set<string>();

    console.log('[MY-RITUALS] Checking joined status:', {
      totalRitualsToCheck: allRitualsForJoinedCheck.length,
      customRitualsCount: customRituals.length,
      customRitualsWithJoinedBy: customRituals.map(r => ({
        id: r.id,
        title: r.title,
        joinedByUsers: r.joinedByUsers
      }))
    });

    // Check all rituals (both Firestore and custom) for joined status
    allRitualsForJoinedCheck.forEach(ritual => {
      const ritualData = ritual as any;
      const joinedByUsers = ritual.joinedByUsers || [];
      const isJoined = joinedByUsers.includes(userId);
      
      // Check if user owns this ritual (only exclude if explicitly owned)
      const isUserOwned = 
        ritualData.sourceUserId === userId || 
        ritualData.createdBy === userId ||
        userOwnRitualIds.has(ritual.id || '') ||
        userOwnSourceIds.has(ritualData.sourceRitualId);

      // Check if this is a custom ritual created by the user
      // Creator is automatically considered as joined
      // A ritual is a custom ritual if it's in the customRituals array
      const isCustomRitual = customRituals.some(cr => cr.id === ritual.id);
      const isCustomRitualCreatedByUser = isCustomRitual && 
        (ritualData.createdBy === userId || (customRituals.find(cr => cr.id === ritual.id) as any)?.createdBy === userId);

      // Handle joined rituals (regardless of scope)
      // Include custom rituals where user is in joinedByUsers OR user is the creator
      if (isJoined || isCustomRitualCreatedByUser) {
        console.log('[MY-RITUALS] Found joined ritual:', {
          id: ritual.id,
          title: ritual.title,
          isCustom: customRituals.some(cr => cr.id === ritual.id),
          isJoined: isJoined,
          isCustomRitualCreatedByUser: isCustomRitualCreatedByUser,
          joinedByUsers: joinedByUsers,
          createdBy: ritualData.createdBy
        });
        joinedRituals.push(ritual);
        if (ritual.id) {
          joinedRitualIds.add(ritual.id);
        }
        // Also track by title for hardcoded rituals
        if (ritual.title) {
          joinedRitualIds.add(ritual.title.toLowerCase());
        }
        return; // Don't add to available if already joined
      }

      // For available rituals, only check Firestore rituals (not custom rituals)
      // Custom rituals are private to the user
      const isFromCustomRituals = customRituals.some(cr => cr.id === ritual.id);
      if (isFromCustomRituals) {
        return; // Skip custom rituals for available list
      }

      // For available rituals, include public and global rituals
      // Exclude only if user explicitly owns them
      const isPublic = ritual.scope === 'public' || ritual.scope === 'global';
      
      if (isPublic && !isUserOwned) {
        // Add to available if it's public/global and user hasn't joined and doesn't own it
        availableRituals.push(ritual);
      }
    });

    console.log('[MY-RITUALS] Joined rituals result:', {
      joinedCount: joinedRituals.length,
      joinedIds: joinedRituals.map(r => r.id),
      joinedTitles: joinedRituals.map(r => r.title)
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

