import type { NextApiRequest, NextApiResponse } from 'next';
import { getDocs, collection } from 'firebase/firestore';
import { adminDb } from '@lib/firebase/admin';
import { ritualsCollection, usersCollection } from '@lib/firebase/collections';

interface DeleteAllRitualsResponse {
  success: boolean;
  deleted: number;
  deletedCustomRituals: number;
  usersAffected: number;
  error?: string;
}

/**
 * Admin endpoint to delete all rituals from Firestore
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DeleteAllRitualsResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({
      success: false,
      deleted: 0,
      deletedCustomRituals: 0,
      usersAffected: 0,
      error: 'Method not allowed'
    });
    return;
  }

  try {
    console.log('🗑️  Starting deletion of all rituals...');

    let deletedCount = 0;
    let deletedCustomRituals = 0;
    let usersAffected = 0;

    if (adminDb) {
      // Use Admin SDK for deletion (bypasses security rules)
      console.log('Using Admin SDK for deletion...');
      
      // Step 1: Delete all rituals from main collection
      const existingSnapshot = await adminDb.collection('rituals').get();
      const existingDocs = existingSnapshot.docs;
      
      if (existingDocs.length > 0) {
        const batchSize = 500;
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
      }

      // Step 2: Delete all custom_rituals from all users
      console.log('🗑️  Deleting user custom rituals...');
      const usersSnapshot = await adminDb.collection('users').get();
      const batchSize = 500;
      
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const customRitualsRef = adminDb.collection(`users/${userId}/custom_rituals`);
        const customRitualsSnapshot = await customRitualsRef.get();
        
        if (customRitualsSnapshot.docs.length > 0) {
          usersAffected++;
          
          // Delete in batches
          for (let i = 0; i < customRitualsSnapshot.docs.length; i += batchSize) {
            const batch = adminDb.batch();
            const chunk = customRitualsSnapshot.docs.slice(i, i + batchSize);

            chunk.forEach((docSnapshot) => {
              batch.delete(docSnapshot.ref);
            });

            await batch.commit();
            deletedCustomRituals += chunk.length;
          }
          
          console.log(`   Deleted ${customRitualsSnapshot.docs.length} custom rituals for user ${userId}`);
        }
      }
    } else {
      // Fallback: Use client SDK (may fail due to permissions)
      console.log('⚠️  Admin SDK not available, using client SDK (may have permission issues)');
      const { db } = await import('@lib/firebase/app');
      const { writeBatch } = await import('firebase/firestore');
      
      // Delete main rituals collection
      const existingSnapshot = await getDocs(ritualsCollection);
      const existingDocs = existingSnapshot.docs;
      
      if (existingDocs.length > 0) {
        const batchSize = 500;
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

      // Try to delete custom rituals (may fail due to permissions)
      console.log('🗑️  Attempting to delete user custom rituals (may require Admin SDK)...');
      const usersSnapshot = await getDocs(usersCollection);
      
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const customRitualsRef = collection(db, `users/${userId}/custom_rituals`);
        const customRitualsSnapshot = await getDocs(customRitualsRef);
        
        if (customRitualsSnapshot.docs.length > 0) {
          usersAffected++;
          
          const batchSize = 500;
          for (let i = 0; i < customRitualsSnapshot.docs.length; i += batchSize) {
            const batch = writeBatch(db);
            const chunk = customRitualsSnapshot.docs.slice(i, i + batchSize);

            chunk.forEach((docSnapshot) => {
              batch.delete(docSnapshot.ref);
            });

            await batch.commit();
            deletedCustomRituals += chunk.length;
          }
        }
      }
    }

    console.log('✅ Successfully deleted:');
    console.log(`   - ${deletedCount} rituals from main collection`);
    console.log(`   - ${deletedCustomRituals} custom rituals from ${usersAffected} users`);

    res.status(200).json({
      success: true,
      deleted: deletedCount,
      deletedCustomRituals,
      usersAffected
    });
  } catch (error) {
    console.error('❌ Error deleting rituals:', error);
    res.status(500).json({
      success: false,
      deleted: 0,
      deletedCustomRituals: 0,
      usersAffected: 0,
      error: error instanceof Error ? error.message : 'Failed to delete rituals'
    });
  }
}

