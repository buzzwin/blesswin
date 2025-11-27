#!/usr/bin/env node

/**
 * Script to seed Firestore with ritual definitions from TypeScript file
 * 
 * This version reads from the compiled JavaScript or uses a JSON export
 * 
 * Usage:
 * 1. Set your Firebase Admin credentials:
 *    - Create a service account key from Firebase Console
 *    - Save it as firebase-admin-key.json in the project root
 *    - Or set GOOGLE_APPLICATION_CREDENTIALS environment variable
 * 
 * 2. Run: node scripts/seed-rituals-from-file.js
 * 
 * This will populate the 'rituals' collection with all ritual definitions
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin
try {
  const keyPath = path.join(__dirname, '../firebase-admin-key.json');
  if (fs.existsSync(keyPath)) {
    const serviceAccount = require(keyPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    admin.initializeApp();
  }
} catch (error) {
  console.error('Error initializing Firebase Admin:', error.message);
  console.error('\nPlease ensure you have:');
  console.error('1. Created a service account key from Firebase Console');
  console.error('2. Saved it as firebase-admin-key.json in the project root');
  console.error('3. Or set GOOGLE_APPLICATION_CREDENTIALS environment variable');
  process.exit(1);
}

const db = admin.firestore();

// Try to load ritual definitions from JSON file (if exported)
// Otherwise, we'll use the inline definitions
let ritualDefinitions = [];

const jsonPath = path.join(__dirname, '../src/lib/data/ritual-definitions.json');
if (fs.existsSync(jsonPath)) {
  console.log('📄 Loading ritual definitions from JSON file...');
  ritualDefinitions = require(jsonPath);
} else {
  // Fallback: use the same definitions as seed-rituals.js
  console.log('📝 Using inline ritual definitions...');
  ritualDefinitions = require('./ritual-definitions-data.js').ritualDefinitions;
}

async function seedRituals() {
  console.log('🌱 Starting ritual seeding...\n');

  const ritualsRef = db.collection('rituals');
  
  // Check if rituals already exist
  const existingSnapshot = await ritualsRef.get();
  const existingCount = existingSnapshot.size;

  if (existingCount > 0) {
    console.log(`⚠️  Found ${existingCount} existing rituals in collection.`);
    console.log('   This script will add new rituals but won\'t delete existing ones.\n');
  }

  let added = 0;
  let skipped = 0;
  let updated = 0;

  // Use batches for efficient writes (max 500 per batch)
  const batchSize = 500;
  const batches = [];

  for (let i = 0; i < ritualDefinitions.length; i += batchSize) {
    const batch = db.batch();
    const chunk = ritualDefinitions.slice(i, i + batchSize);

    for (const ritual of chunk) {
      // Check if ritual with same title already exists
      const existing = existingSnapshot.docs.find(
        doc => doc.data().title === ritual.title
      );

      if (existing) {
        // Optionally update existing ritual (uncomment if needed)
        // batch.update(existing.ref, {
        //   ...ritual,
        //   updatedAt: admin.firestore.FieldValue.serverTimestamp()
        // });
        // updated++;
        console.log(`⏭️  Skipping "${ritual.title}" (already exists)`);
        skipped++;
        continue;
      }

      // Create new ritual document
      const docRef = ritualsRef.doc();
      batch.set(docRef, {
        ...ritual,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        usageCount: 0,
        completionRate: 0
      });

      console.log(`✅ Added "${ritual.title}"`);
      added++;
    }

    if (batch._delegate._mutations.length > 0) {
      batches.push(batch);
    }
  }

  // Commit all batches
  if (batches.length > 0) {
    console.log(`\n💾 Committing ${batches.length} batch(es)...`);
    for (const batch of batches) {
      await batch.commit();
    }
    console.log(`✨ Successfully seeded ${added} rituals!`);
  } else {
    console.log('\n✨ All rituals already exist. Nothing to seed.');
  }

  if (skipped > 0) {
    console.log(`⏭️  Skipped ${skipped} existing rituals.`);
  }
  if (updated > 0) {
    console.log(`🔄 Updated ${updated} existing rituals.`);
  }

  // Verify
  const finalSnapshot = await ritualsRef.get();
  console.log(`\n📊 Total rituals in collection: ${finalSnapshot.size}`);
  
  // Show breakdown by scope
  const globalCount = finalSnapshot.docs.filter(d => d.data().scope === 'global').length;
  const personalizedCount = finalSnapshot.docs.filter(d => d.data().scope === 'personalized').length;
  console.log(`   - Global: ${globalCount}`);
  console.log(`   - Personalized: ${personalizedCount}`);

  // Show breakdown by tag
  const tagCounts = {};
  finalSnapshot.docs.forEach(doc => {
    const tags = doc.data().tags || [];
    tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  console.log('\n🏷️  Breakdown by tag:');
  Object.entries(tagCounts).forEach(([tag, count]) => {
    console.log(`   - ${tag}: ${count}`);
  });

  console.log('\n🎉 Seeding complete!');
}

// Run seeding
seedRituals()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error seeding rituals:', error);
    process.exit(1);
  });

