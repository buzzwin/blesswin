#!/usr/bin/env node

/**
 * Firebase Functions Email Testing Script
 * Tests all three email functions one by one
 * 
 * Usage: node test-firebase-emails.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
try {
  const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:');
  console.error('   Make sure serviceAccountKey.json exists in project root');
  console.error('   Download it from: Firebase Console → Project Settings → Service Accounts');
  process.exit(1);
}

const db = admin.firestore();

async function testJoinedActionEmail() {
  console.log('\n📧 TEST 1: Joined Action Email (notifyJoinedAction)\n');
  console.log('This function triggers when someone joins an impact moment.\n');

  try {
    // Get a test user
    const usersSnapshot = await db.collection('users').limit(1).get();
    if (usersSnapshot.empty) {
      console.log('⚠️  No users found. Creating a test user...');
      // You'll need to create a user first
      console.log('   Please create a user account first, then run this test again.');
      return;
    }

    const testUser = usersSnapshot.docs[0].data();
    const userId = usersSnapshot.docs[0].id;
    console.log('✅ Found test user:', testUser.name || testUser.username);

    // Create a test impact moment
    console.log('\nCreating test impact moment...');
    const testMomentRef = await db.collection('impact_moments').add({
      createdBy: userId,
      text: 'Test action: I\'m planting a tree today! 🌱',
      tags: ['nature', 'community'],
      effortLevel: 'medium',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      joinedFromMomentId: null
    });
    console.log('✅ Created test moment:', testMomentRef.id);

    // Create a joined moment (this will trigger the function)
    console.log('\nCreating joined moment (this triggers the email)...');
    const joinedMomentRef = await db.collection('impact_moments').add({
      createdBy: userId, // Using same user for testing
      text: 'I joined this action! Let\'s plant trees together 🌳',
      tags: ['nature'],
      effortLevel: 'medium',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      joinedFromMomentId: testMomentRef.id
    });
    console.log('✅ Created joined moment:', joinedMomentRef.id);
    console.log('\n📬 Check Firebase Functions logs:');
    console.log('   firebase functions:log --only notifyJoinedAction');
    console.log('\n📧 Check email inbox for:', testUser.email || 'user email');
    console.log('   Subject: "🌱 [Name] joined your action on Buzzwin"');

    // Clean up test data (optional)
    console.log('\n🧹 Cleaning up test data...');
    await testMomentRef.delete();
    await joinedMomentRef.delete();
    console.log('✅ Test data cleaned up');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testRitualReminderEmail() {
  console.log('\n\n📧 TEST 2: Ritual Reminder Email (sendRitualReminders)\n');
  console.log('This function sends daily ritual reminders.\n');

  try {
    // Get a user with ritual state
    const userStatesSnapshot = await db.collection('user_ritual_states')
      .where('enabled', '==', true)
      .limit(1)
      .get();

    if (userStatesSnapshot.empty) {
      console.log('⚠️  No users with enabled rituals found.');
      console.log('   Please enable rituals for a user first, then run this test.');
      return;
    }

    const userState = userStatesSnapshot.docs[0].data();
    const userId = userState.userId;
    console.log('✅ Found user with enabled rituals:', userId);

    // Get user email
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      console.log('⚠️  User not found');
      return;
    }

    const user = userDoc.data();
    console.log('📧 User email:', user.email || 'Not set in user doc');

    console.log('\n💡 To test this function:');
    console.log('   1. Go to Firebase Console');
    console.log('   2. Functions → sendRitualReminders');
    console.log('   3. Click "Test function"');
    console.log('   4. Click "Test" button');
    console.log('\n   Or wait for scheduled time (8 AM UTC daily)');
    console.log('\n📬 Check Firebase Functions logs:');
    console.log('   firebase functions:log --only sendRitualReminders');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testWeeklySummaryEmail() {
  console.log('\n\n📧 TEST 3: Weekly Summary Email (sendWeeklySummaries)\n');
  console.log('This function sends weekly progress summaries.\n');

  try {
    // Get a user with activity
    const userStatesSnapshot = await db.collection('user_ritual_states')
      .limit(1)
      .get();

    if (userStatesSnapshot.empty) {
      console.log('⚠️  No users found.');
      return;
    }

    const userState = userStatesSnapshot.docs[0].data();
    const userId = userState.userId;
    console.log('✅ Found user:', userId);

    // Get user email
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      console.log('⚠️  User not found');
      return;
    }

    const user = userDoc.data();
    console.log('📧 User email:', user.email || 'Not set in user doc');

    console.log('\n💡 To test this function:');
    console.log('   1. Go to Firebase Console');
    console.log('   2. Functions → sendWeeklySummaries');
    console.log('   3. Click "Test function"');
    console.log('   4. Click "Test" button');
    console.log('\n   Or wait for scheduled time (Sunday 6 PM UTC)');
    console.log('\n📬 Check Firebase Functions logs:');
    console.log('   firebase functions:log --only sendWeeklySummaries');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function main() {
  console.log('🧪 Firebase Functions Email Testing\n');
  console.log('='.repeat(50));
  
  await testJoinedActionEmail();
  await testRitualReminderEmail();
  await testWeeklySummaryEmail();

  console.log('\n' + '='.repeat(50));
  console.log('\n✅ Testing guide complete!');
  console.log('\n📝 Next steps:');
  console.log('   1. Test each function using Firebase Console');
  console.log('   2. Check Firebase Functions logs for errors');
  console.log('   3. Check email inbox for each test');
  console.log('\n📚 See EMAIL_TESTING_GUIDE.md for detailed instructions\n');
}

main().catch(console.error);

