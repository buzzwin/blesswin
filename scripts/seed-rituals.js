#!/usr/bin/env node

/**
 * Script to seed Firestore with ritual definitions
 * 
 * Usage:
 * 1. Set your Firebase Admin credentials:
 *    - Create a service account key from Firebase Console
 *    - Save it as firebase-admin-key.json in the project root
 *    - Or set GOOGLE_APPLICATION_CREDENTIALS environment variable
 * 
 * 2. Run: node scripts/seed-rituals.js
 * 
 * This will populate the 'rituals' collection with all ritual definitions
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin
try {
  // Try to use service account key file
  const keyPath = path.join(__dirname, '../firebase-admin-key.json');
  if (fs.existsSync(keyPath)) {
    const serviceAccount = require(keyPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    // Fall back to default credentials (from environment)
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

// Import ritual definitions from data file
const { ritualDefinitions } = require('./ritual-definitions-data.js');

async function seedRituals() {
  console.log('🌱 Starting ritual seeding...\n');

  const ritualsRef = db.collection('rituals');
  const batch = db.batch();

  // Check if rituals already exist
  const existingSnapshot = await ritualsRef.get();
  const existingCount = existingSnapshot.size;

  if (existingCount > 0) {
    console.log(`⚠️  Found ${existingCount} existing rituals in collection.`);
    console.log('   This script will add new rituals but won\'t delete existing ones.\n');
  }

  let added = 0;
  let skipped = 0;

  for (const ritual of ritualDefinitions) {
    // Check if ritual with same title already exists
    const existing = existingSnapshot.docs.find(
      doc => doc.data().title === ritual.title
    );

    if (existing) {
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

  if (added > 0) {
    await batch.commit();
    console.log(`\n✨ Successfully seeded ${added} rituals!`);
  } else {
    console.log('\n✨ All rituals already exist. Nothing to seed.');
  }

  if (skipped > 0) {
    console.log(`⏭️  Skipped ${skipped} existing rituals.`);
  }

  // Verify
  const finalSnapshot = await ritualsRef.get();
  console.log(`\n📊 Total rituals in collection: ${finalSnapshot.size}`);
  
  // Show breakdown by scope
  const globalCount = finalSnapshot.docs.filter(d => d.data().scope === 'global').length;
  const personalizedCount = finalSnapshot.docs.filter(d => d.data().scope === 'personalized').length;
  console.log(`   - Global: ${globalCount}`);
  console.log(`   - Personalized: ${personalizedCount}`);

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

