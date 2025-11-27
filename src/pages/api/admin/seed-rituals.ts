import type { NextApiRequest, NextApiResponse } from 'next';
import { getDocs, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ritualsCollection } from '@lib/firebase/collections';
import { getAllRitualDefinitions } from '@lib/data/ritual-definitions';
import type { RitualDefinition } from '@lib/types/ritual';

interface SeedRitualsResponse {
  success: boolean;
  added: number;
  skipped: number;
  total: number;
  error?: string;
}

/**
 * Admin endpoint to seed rituals collection
 * Note: This uses client SDK, so it requires admin authentication
 * For production, use the Node.js script with Firebase Admin SDK
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SeedRitualsResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({
      success: false,
      added: 0,
      skipped: 0,
      total: 0,
      error: 'Method not allowed'
    });
    return;
  }

  try {
    // Get all ritual definitions
    const ritualDefinitions = getAllRitualDefinitions();

    // Check existing rituals
    const existingSnapshot = await getDocs(ritualsCollection);
    const existingTitles = new Set(
      existingSnapshot.docs.map(doc => doc.data().title)
    );

    let added = 0;
    let skipped = 0;

    // Add new rituals (using batches would be better for large sets)
    for (const ritual of ritualDefinitions) {
      if (existingTitles.has(ritual.title)) {
        skipped++;
        continue;
      }

      // Create new document
      const docRef = doc(ritualsCollection);
      await setDoc(docRef, {
        ...ritual,
        createdAt: serverTimestamp(),
        usageCount: 0,
        completionRate: 0
      } as Omit<RitualDefinition, 'id'>);

      added++;
    }

    // Get final count
    const finalSnapshot = await getDocs(ritualsCollection);
    const total = finalSnapshot.size;

    res.status(200).json({
      success: true,
      added,
      skipped,
      total
    });
  } catch (error) {
    console.error('Error seeding rituals:', error);
    res.status(500).json({
      success: false,
      added: 0,
      skipped: 0,
      total: 0,
      error: error instanceof Error ? error.message : 'Failed to seed rituals'
    });
  }
}

