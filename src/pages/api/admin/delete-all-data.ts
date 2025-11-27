import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '@lib/firebase/admin';

/**
 * DANGER: This endpoint deletes ALL data from Firestore
 * Use with extreme caution!
 * 
 * To use this endpoint:
 * 1. Make a POST request to /api/admin/delete-all-data
 * 2. Include a secret token in the Authorization header or as a query parameter
 * 3. Set SECRET_DELETE_TOKEN in your environment variables
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Check for secret token
  const secretToken = process.env.SECRET_DELETE_TOKEN || 'delete-all-data-secret';
  const providedToken = req.headers.authorization?.replace('Bearer ', '') || req.query.token as string;

  if (providedToken !== secretToken) {
    res.status(401).json({ error: 'Unauthorized. Invalid token.' });
    return;
  }

  try {
    if (!adminDb) {
      throw new Error('Admin database not initialized. Please set up Firebase Admin credentials.');
    }

    const collections = [
      'tweets',
      'reviews',
      'watchlists',
      'visits',
      'ai_recommendations',
      'ratings',
      'recommendations',
      'user_recommendations',
      'dismissed_recommendations',
      'user_analyses',
      'user_preferences',
      'disclaimer_acceptance'
    ];

    const deletionResults: Record<string, { deleted: number; errors: string[] }> = {};

    // Delete all documents from each collection
    for (const collectionName of collections) {
      try {
        const collectionRef = adminDb.collection(collectionName);
        const snapshot = await collectionRef.get();
        
        const batch = adminDb.batch();
        let batchCount = 0;
        let deletedCount = 0;
        const errors: string[] = [];

        snapshot.forEach((doc) => {
          batch.delete(doc.ref);
          batchCount++;
          
          // Firestore batches are limited to 500 operations
          if (batchCount === 500) {
            batch.commit().catch((error) => {
              errors.push(`Error deleting batch: ${error.message}`);
            });
            deletedCount += batchCount;
            batchCount = 0;
          }
        });

        // Commit remaining batch
        if (batchCount > 0) {
          await batch.commit();
          deletedCount += batchCount;
        }

        deletionResults[collectionName] = { deleted: deletedCount, errors };
      } catch (error) {
        deletionResults[collectionName] = {
          deleted: 0,
          errors: [error instanceof Error ? error.message : 'Unknown error']
        };
      }
    }

    // Delete user subcollections (bookmarks, stats, reviews)
    try {
      const usersSnapshot = await adminDb.collection('users').get();
      const userSubcollections = ['bookmarks', 'stats', 'reviews'];
      
      for (const userDoc of usersSnapshot.docs) {
        for (const subcollectionName of userSubcollections) {
          const subcollectionRef = userDoc.ref.collection(subcollectionName);
          const subSnapshot = await subcollectionRef.get();
          
          const batch = adminDb.batch();
          let batchCount = 0;
          
          subSnapshot.forEach((doc) => {
            batch.delete(doc.ref);
            batchCount++;
            
            if (batchCount === 500) {
              batch.commit().catch((error) => {
                console.error('Error committing batch:', error);
              });
              batchCount = 0;
            }
          });
          
          if (batchCount > 0) {
            await batch.commit();
          }
        }
      }
    } catch (error) {
      deletionResults['user_subcollections'] = {
        deleted: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }

    // Note: We're NOT deleting the 'users' collection itself
    // as that would delete user authentication data
    // If you want to delete users too, uncomment the following:
    /*
    try {
      const usersSnapshot = await adminDb.collection('users').get();
      const batch = adminDb.batch();
      let batchCount = 0;
      
      usersSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
        batchCount++;
        
        if (batchCount === 500) {
          batch.commit().catch(() => {});
          batchCount = 0;
        }
      });
      
      if (batchCount > 0) {
        await batch.commit();
      }
      
      deletionResults['users'] = { deleted: batchCount, errors: [] };
    } catch (error) {
      deletionResults['users'] = {
        deleted: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
    */

    const totalDeleted = Object.values(deletionResults).reduce(
      (sum, result) => sum + result.deleted,
      0
    );

    res.status(200).json({
      success: true,
      message: 'Data deletion completed',
      totalDeleted,
      results: deletionResults,
      note: 'Users collection was NOT deleted. To delete users, modify the code.'
    });
  } catch (error) {
    console.error('Error deleting Firestore data:', error);
    res.status(500).json({
      error: 'Failed to delete data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

