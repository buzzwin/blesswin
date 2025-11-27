/**
 * Script to delete all Firestore data
 * 
 * Usage:
 * 1. Set your Firebase Admin credentials:
 *    - Create a service account key from Firebase Console
 *    - Save it as firebase-admin-key.json in the project root
 *    - Or set GOOGLE_APPLICATION_CREDENTIALS environment variable
 * 
 * 2. Run: node scripts/delete-firestore-data.js
 * 
 * WARNING: This will delete ALL data from Firestore!
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
try {
  // Try to use service account key file
  const serviceAccount = require(path.join(__dirname, '../firebase-admin-key.json'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  // Fall back to default credentials (from environment)
  admin.initializeApp();
}

const db = admin.firestore();

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

async function deleteCollection(collectionName) {
  const collectionRef = db.collection(collectionName);
  const snapshot = await collectionRef.get();
  
  if (snapshot.empty) {
    console.log(`Collection ${collectionName} is already empty.`);
    return { deleted: 0, errors: [] };
  }

  const batch = db.batch();
  let batchCount = 0;
  let totalDeleted = 0;
  const errors = [];

  snapshot.forEach((doc) => {
    batch.delete(doc.ref);
    batchCount++;
    
    // Firestore batches are limited to 500 operations
    if (batchCount === 500) {
      batch.commit()
        .then(() => {
          totalDeleted += batchCount;
          console.log(`Deleted batch of ${batchCount} from ${collectionName}`);
        })
        .catch((error) => {
          errors.push(`Error deleting batch: ${error.message}`);
          console.error(`Error deleting batch from ${collectionName}:`, error);
        });
      batchCount = 0;
    }
  });

  // Commit remaining batch
  if (batchCount > 0) {
    try {
      await batch.commit();
      totalDeleted += batchCount;
      console.log(`Deleted final batch of ${batchCount} from ${collectionName}`);
    } catch (error) {
      errors.push(`Error deleting final batch: ${error.message}`);
      console.error(`Error deleting final batch from ${collectionName}:`, error);
    }
  }

  return { deleted: totalDeleted, errors };
}

async function deleteUserSubcollections() {
  const usersSnapshot = await db.collection('users').get();
  const userSubcollections = ['bookmarks', 'stats', 'reviews'];
  
  let totalDeleted = 0;
  const errors = [];

  for (const userDoc of usersSnapshot.docs) {
    for (const subcollectionName of userSubcollections) {
      const subcollectionRef = userDoc.ref.collection(subcollectionName);
      const subSnapshot = await subcollectionRef.get();
      
      if (subSnapshot.empty) continue;

      const batch = db.batch();
      let batchCount = 0;
      
      subSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
        batchCount++;
        
        if (batchCount === 500) {
          batch.commit()
            .then(() => {
              totalDeleted += batchCount;
            })
            .catch((error) => {
              errors.push(`Error deleting ${subcollectionName} for user ${userDoc.id}: ${error.message}`);
            });
          batchCount = 0;
        }
      });
      
      if (batchCount > 0) {
        try {
          await batch.commit();
          totalDeleted += batchCount;
        } catch (error) {
          errors.push(`Error deleting ${subcollectionName} for user ${userDoc.id}: ${error.message}`);
        }
      }
    }
  }

  return { deleted: totalDeleted, errors };
}

async function main() {
  console.log('🚨 WARNING: This will delete ALL data from Firestore!');
  console.log('Collections to delete:', collections.join(', '));
  console.log('User subcollections: bookmarks, stats, reviews');
  console.log('\nStarting deletion in 3 seconds...');
  
  await new Promise(resolve => setTimeout(resolve, 3000));

  const results = {};

  // Delete main collections
  for (const collectionName of collections) {
    console.log(`\nDeleting collection: ${collectionName}`);
    results[collectionName] = await deleteCollection(collectionName);
    console.log(`✓ Deleted ${results[collectionName].deleted} documents from ${collectionName}`);
    if (results[collectionName].errors.length > 0) {
      console.error(`✗ Errors:`, results[collectionName].errors);
    }
  }

  // Delete user subcollections
  console.log('\nDeleting user subcollections...');
  results['user_subcollections'] = await deleteUserSubcollections();
  console.log(`✓ Deleted ${results['user_subcollections'].deleted} documents from user subcollections`);
  if (results['user_subcollections'].errors.length > 0) {
    console.error(`✗ Errors:`, results['user_subcollections'].errors);
  }

  // Summary
  const totalDeleted = Object.values(results).reduce(
    (sum, result) => sum + result.deleted,
    0
  );

  console.log('\n' + '='.repeat(50));
  console.log('DELETION COMPLETE');
  console.log('='.repeat(50));
  console.log(`Total documents deleted: ${totalDeleted}`);
  console.log('\nResults:', JSON.stringify(results, null, 2));
  console.log('\nNote: Users collection was NOT deleted.');
  console.log('To delete users, modify this script.');
}

main()
  .then(() => {
    console.log('\nScript completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nScript failed:', error);
    process.exit(1);
  });

