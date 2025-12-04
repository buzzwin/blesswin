import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, setDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { adminDb } from '@lib/firebase/admin';
import { ritualsCollection } from '@lib/firebase/collections';
import { getAllRitualDefinitions } from '@lib/data/ritual-definitions';
import type { RitualDefinition } from '@lib/types/ritual';

interface SeedTwoRitualsResponse {
  success: boolean;
  added: number;
  rituals: Array<{ id: string; title: string }>;
  error?: string;
}

/**
 * Admin endpoint to seed Firestore with exactly 2 new rituals
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SeedTwoRitualsResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({
      success: false,
      added: 0,
      rituals: [],
      error: 'Method not allowed'
    });
    return;
  }

  try {
    console.log('🌱 Seeding 2 rituals...');

    // Get all ritual definitions
    const allRituals = getAllRitualDefinitions();
    
    // Check existing rituals to avoid duplicates
    const existingSnapshot = await getDocs(ritualsCollection);
    const existingTitles = new Set(
      existingSnapshot.docs.map(doc => doc.data().title.toLowerCase())
    );

    // Filter out rituals that already exist
    const availableRituals = allRituals.filter(
      ritual => !existingTitles.has(ritual.title.toLowerCase())
    );

    if (availableRituals.length === 0) {
      return res.status(200).json({
        success: true,
        added: 0,
        rituals: [],
        error: 'All rituals already exist in Firestore'
      });
    }

    // Select 2 rituals (prefer one global and one personalized if available)
    const globalRituals = availableRituals.filter(r => r.scope === 'global');
    const personalizedRituals = availableRituals.filter(r => r.scope === 'personalized');
    
    const selectedRituals: typeof allRituals = [];
    
    // Add one global ritual if available
    if (globalRituals.length > 0) {
      selectedRituals.push(globalRituals[0]);
    }
    
    // Add one personalized ritual if available, or another global if no personalized
    if (personalizedRituals.length > 0 && selectedRituals.length < 2) {
      selectedRituals.push(personalizedRituals[0]);
    } else if (globalRituals.length > 1 && selectedRituals.length < 2) {
      selectedRituals.push(globalRituals[1]);
    } else if (availableRituals.length > selectedRituals.length) {
      // Fallback: just take any 2 available
      const remaining = availableRituals.filter(r => !selectedRituals.includes(r));
      selectedRituals.push(...remaining.slice(0, 2 - selectedRituals.length));
    }

    const addedRituals: Array<{ id: string; title: string }> = [];

    // Add rituals to Firestore
    if (adminDb) {
      // Use Admin SDK
      const FieldValue = (await import('firebase-admin/firestore')).FieldValue;
      for (const ritual of selectedRituals.slice(0, 2)) {
        const docRef = adminDb.collection('rituals').doc();
        await docRef.set({
          ...ritual,
          createdAt: FieldValue.serverTimestamp(),
          usageCount: 0,
          completionRate: 0,
          joinedByUsers: [],
          rippleCount: 0
        });
        
        addedRituals.push({ id: docRef.id, title: ritual.title });
        console.log(`✅ Added: "${ritual.title}" (${ritual.scope})`);
      }
    } else {
      // Use client SDK
      for (const ritual of selectedRituals.slice(0, 2)) {
        const docRef = doc(ritualsCollection);
        await setDoc(docRef, {
          ...ritual,
          createdAt: serverTimestamp(),
          usageCount: 0,
          completionRate: 0,
          joinedByUsers: [],
          rippleCount: 0
        } as Omit<RitualDefinition, 'id'>);
        
        addedRituals.push({ id: docRef.id, title: ritual.title });
        console.log(`✅ Added: "${ritual.title}" (${ritual.scope})`);
      }
    }

    console.log(`✅ Successfully seeded ${addedRituals.length} rituals`);

    res.status(200).json({
      success: true,
      added: addedRituals.length,
      rituals: addedRituals
    });
  } catch (error) {
    console.error('❌ Error seeding rituals:', error);
    res.status(500).json({
      success: false,
      added: 0,
      rituals: [],
      error: error instanceof Error ? error.message : 'Failed to seed rituals'
    });
  }
}

