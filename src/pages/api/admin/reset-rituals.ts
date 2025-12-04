import type { NextApiRequest, NextApiResponse } from 'next';
import { getDocs, doc, setDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '@lib/firebase/app';
import { adminDb } from '@lib/firebase/admin';
import { ritualsCollection } from '@lib/firebase/collections';
import { getAllRitualDefinitions } from '@lib/data/ritual-definitions';
import type { RitualDefinition } from '@lib/types/ritual';

interface ResetRitualsResponse {
  success: boolean;
  deleted: number;
  added: number;
  total: number;
  error?: string;
}

/**
 * Admin endpoint to reset rituals collection
 * Deletes all existing rituals and seeds fresh ones
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResetRitualsResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({
      success: false,
      deleted: 0,
      added: 0,
      total: 0,
      error: 'Method not allowed'
    });
    return;
  }

  try {
    console.log('🔄 Starting ritual reset...');

    // Step 1: Delete all existing rituals
    console.log('🗑️  Deleting existing rituals...');
    let deletedCount = 0;
    const batchSize = 500; // Firestore limit is 500 operations per batch

    if (adminDb) {
      // Use Admin SDK for deletion (bypasses security rules)
      const existingSnapshot = await adminDb.collection('rituals').get();
      const existingDocs = existingSnapshot.docs;
      for (let i = 0; i < existingDocs.length; i += batchSize) {
        const batch = adminDb.batch();
        const chunk = existingDocs.slice(i, i + batchSize);

        chunk.forEach((docSnapshot) => {
          batch.delete(docSnapshot.ref);
        });

        await batch.commit();
        deletedCount += chunk.length;
        console.log(`   Deleted batch: ${chunk.length} rituals (${deletedCount}/${existingDocs.length})`);
      }
    } else {
      // Fallback: Use client SDK (may fail due to permissions)
      console.log('⚠️  Admin SDK not available, using client SDK (may have permission issues)');
      const existingSnapshot = await getDocs(ritualsCollection);
      const existingDocs = existingSnapshot.docs;
      for (let i = 0; i < existingDocs.length; i += batchSize) {
        const batch = writeBatch(db);
        const chunk = existingDocs.slice(i, i + batchSize);

        chunk.forEach((docSnapshot) => {
          batch.delete(docSnapshot.ref);
        });

        await batch.commit();
        deletedCount += chunk.length;
        console.log(`   Deleted batch: ${chunk.length} rituals (${deletedCount}/${existingDocs.length})`);
      }
    }

    console.log(`✅ Deleted ${deletedCount} existing rituals`);

    // Step 2: Seed fresh rituals
    console.log('🌱 Seeding fresh rituals...');
    const ritualDefinitions = getAllRitualDefinitions();
    let addedCount = 0;

    // Add rituals in batches
    for (let i = 0; i < ritualDefinitions.length; i += batchSize) {
      const batch = writeBatch(db);
      const chunk = ritualDefinitions.slice(i, i + batchSize);

      chunk.forEach((ritual) => {
        const docRef = doc(ritualsCollection);
        batch.set(docRef, {
          ...ritual,
          createdAt: serverTimestamp(),
          usageCount: 0,
          completionRate: 0,
          joinedByUsers: [],
          rippleCount: 0
        });
      });

      await batch.commit();
      addedCount += chunk.length;
      console.log(`   Added batch: ${chunk.length} rituals (${addedCount}/${ritualDefinitions.length})`);
    }

    console.log(`✅ Added ${addedCount} fresh rituals`);

    // Step 3: Verify final count
    const finalSnapshot = await getDocs(ritualsCollection);
    const total = finalSnapshot.size;

    console.log(`✅ Reset complete! Total rituals: ${total}`);

    res.status(200).json({
      success: true,
      deleted: deletedCount,
      added: addedCount,
      total
    });
  } catch (error) {
    console.error('❌ Error resetting rituals:', error);
    res.status(500).json({
      success: false,
      deleted: 0,
      added: 0,
      total: 0,
      error: error instanceof Error ? error.message : 'Failed to reset rituals'
    });
  }
}

