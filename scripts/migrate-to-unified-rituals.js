/**
 * Migration script to convert existing rituals and automations to unified model
 * 
 * Run with: node scripts/migrate-to-unified-rituals.js
 * 
 * This script:
 * 1. Converts all RitualDefinition documents to UnifiedRitual format
 * 2. Converts all Automation documents to UnifiedRitual format
 * 3. Migrates automations from users/{userId}/automations to rituals collection
 * 4. Updates automations_registry to point to rituals collection
 */

const admin = require('firebase-admin');
const serviceAccount = require('../functions/service-account-key.json'); // Adjust path as needed

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function migrateRituals() {
  console.log('🔄 Starting ritual migration...');
  
  const ritualsSnapshot = await db.collection('rituals').get();
  let migrated = 0;
  let skipped = 0;

  for (const doc of ritualsSnapshot.docs) {
    const data = doc.data();
    
    // Skip if already migrated (has unified fields)
    if (data.triggers !== undefined || data.isCompletable !== undefined) {
      console.log(`⏭️  Skipping ${doc.id} - already migrated`);
      skipped++;
      continue;
    }

    // Convert to unified format
    const unified = {
      ...data,
      // Add unified fields
      triggers: undefined, // Manual ritual
      actions: undefined,
      isCompletable: true, // Rituals are always completable
      isJoinable: data.scope === 'public' || data.scope === 'global',
      isActive: true,
      _legacyType: 'ritual'
    };

    await doc.ref.update(unified);
    migrated++;
    console.log(`✅ Migrated ritual: ${doc.id} - ${data.title}`);
  }

  console.log(`\n📊 Rituals: ${migrated} migrated, ${skipped} skipped\n`);
  return { migrated, skipped };
}

async function migrateUserCustomRituals() {
  console.log('🔄 Starting user custom rituals migration...');
  
  const usersSnapshot = await db.collection('users').get();
  let totalMigrated = 0;
  let totalSkipped = 0;

  for (const userDoc of usersSnapshot.docs) {
    const customRitualsSnapshot = await userDoc.ref.collection('custom_rituals').get();
    
    for (const doc of customRitualsSnapshot.docs) {
      const data = doc.data();
      
      // Skip if already migrated
      if (data.triggers !== undefined || data.isCompletable !== undefined) {
        totalSkipped++;
        continue;
      }

      const unified = {
        ...data,
        triggers: undefined,
        actions: undefined,
        isCompletable: true,
        isJoinable: data.scope === 'public' || data.scope === 'global',
        isActive: true,
        _legacyType: 'ritual'
      };

      await doc.ref.update(unified);
      totalMigrated++;
      console.log(`✅ Migrated custom ritual: ${userDoc.id}/${doc.id} - ${data.title}`);
    }
  }

  console.log(`\n📊 Custom Rituals: ${totalMigrated} migrated, ${totalSkipped} skipped\n`);
  return { migrated: totalMigrated, skipped: totalSkipped };
}

async function migrateAutomations() {
  console.log('🔄 Starting automations migration...');
  
  const usersSnapshot = await db.collection('users').get();
  let totalMigrated = 0;
  let totalMoved = 0;

  for (const userDoc of usersSnapshot.docs) {
    const automationsSnapshot = await userDoc.ref.collection('automations').get();
    
    for (const doc of automationsSnapshot.docs) {
      const data = doc.data();
      
      // Map category to tags
      const categoryToTags = {
        wellness: ['mind', 'body'],
        productivity: ['mind'],
        relationships: ['relationships'],
        health: ['body'],
        finance: ['mind'],
        learning: ['mind'],
        other: ['mind']
      };

      const tags = categoryToTags[data.category || 'other'] || ['mind'];
      const hasRitualAction = data.actions?.some(a => a.type === 'ritual') || false;

      // Create unified ritual
      const unified = {
        userId: data.userId,
        title: data.title,
        description: data.description,
        tags,
        effortLevel: 'tiny',
        suggestedTimeOfDay: 'anytime',
        durationEstimate: '5 minutes',
        prefillTemplate: `Completed automation: ${data.title}`,
        triggers: data.triggers || [],
        actions: data.actions || [],
        category: data.category,
        isPublic: data.isPublic || false,
        isJoinable: data.isPublic || false,
        isCompletable: hasRitualAction,
        isActive: data.isActive !== false,
        scope: data.isPublic ? 'public' : 'personalized',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        joinedByUsers: [],
        usageCount: data.sharedCount || 0,
        completionRate: 0,
        _legacyType: 'automation',
        conversationHistory: data.conversationHistory
      };

      // If public, also create in main rituals collection
      if (data.isPublic) {
        const ritualsRef = db.collection('rituals').doc();
        await ritualsRef.set({
          ...unified,
          id: ritualsRef.id,
          createdBy: data.userId,
          sourceUserId: data.userId,
          sourceRitualId: doc.id // Link back to original
        });
        totalMoved++;
        console.log(`✅ Moved public automation to rituals: ${ritualsRef.id} - ${data.title}`);
      }

      // Update original automation document
      await doc.ref.update({
        ...unified,
        _migrated: true,
        _migratedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      totalMigrated++;
      console.log(`✅ Migrated automation: ${userDoc.id}/${doc.id} - ${data.title}`);
    }
  }

  console.log(`\n📊 Automations: ${totalMigrated} migrated, ${totalMoved} moved to rituals collection\n`);
  return { migrated: totalMigrated, moved: totalMoved };
}

async function migrateAutomationsRegistry() {
  console.log('🔄 Starting automations registry migration...');
  
  const registrySnapshot = await db.collection('automations_registry').get();
  let updated = 0;

  for (const doc of registrySnapshot.docs) {
    const data = doc.data();
    
    // Update registry entry to point to rituals collection if automation was moved
    if (data.automationId && data.userId) {
      // Check if automation exists in rituals collection (for public ones)
      const ritualsQuery = await db.collection('rituals')
        .where('sourceRitualId', '==', data.automationId)
        .where('sourceUserId', '==', data.userId)
        .limit(1)
        .get();

      if (!ritualsQuery.empty) {
        const ritualDoc = ritualsQuery.docs[0];
        await doc.ref.update({
          ritualId: ritualDoc.id, // New reference
          _migrated: true,
          _migratedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        updated++;
        console.log(`✅ Updated registry entry: ${doc.id} -> ritual ${ritualDoc.id}`);
      }
    }
  }

  console.log(`\n📊 Registry: ${updated} entries updated\n`);
  return { updated };
}

async function main() {
  console.log('🚀 Starting unified rituals migration...\n');

  try {
    const ritualsResult = await migrateRituals();
    const customRitualsResult = await migrateUserCustomRituals();
    const automationsResult = await migrateAutomations();
    const registryResult = await migrateAutomationsRegistry();

    console.log('\n✨ Migration complete!');
    console.log(`\n📈 Summary:`);
    console.log(`   Rituals migrated: ${ritualsResult.migrated}`);
    console.log(`   Custom rituals migrated: ${customRitualsResult.migrated}`);
    console.log(`   Automations migrated: ${automationsResult.migrated}`);
    console.log(`   Public automations moved: ${automationsResult.moved}`);
    console.log(`   Registry entries updated: ${registryResult.updated}`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
if (require.main === module) {
  main().then(() => process.exit(0));
}

module.exports = { migrateRituals, migrateUserCustomRituals, migrateAutomations, migrateAutomationsRegistry };
