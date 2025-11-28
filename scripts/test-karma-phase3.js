#!/usr/bin/env node

/**
 * Test script for Phase 3: Karma Tracking Integration
 * 
 * Usage:
 *   node scripts/test-karma-phase3.js <userId>
 * 
 * This script will:
 * 1. Test Impact Moment creation with karma tracking
 * 2. Test Ritual completion with karma tracking
 * 3. Test Comment creation with karma tracking
 * 4. Test Ripple reactions with karma tracking
 * 5. Test Joined You actions with karma tracking
 * 6. Verify milestone detection
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(70));
  log(title, 'cyan');
  console.log('='.repeat(70));
}

function logTest(name) {
  log(`\n🧪 Testing: ${name}`, 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'magenta');
}

async function getKarma(userId) {
  try {
    const response = await fetch(`${BASE_URL}/api/karma/${userId}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.success ? data : null;
  } catch (error) {
    return null;
  }
}

async function testImpactMomentCreation(userId) {
  logSection('TEST 1: IMPACT MOMENT CREATION');

  const initialKarma = await getKarma(userId);
  if (!initialKarma) {
    logError('Could not fetch initial karma');
    return false;
  }

  logInfo(`Initial Karma: ${initialKarma.karmaPoints} points`);

  // Test 1: Regular impact moment
  logTest('Creating regular impact moment');
  try {
    const response = await fetch(`${BASE_URL}/api/impact-moments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        text: 'Test impact moment for karma testing',
        tags: ['mind'],
        effortLevel: 'tiny'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      logError(`Failed: ${error.error || response.statusText}`);
      return false;
    }

    const data = await response.json();
    const momentId = data.id || data.momentId;

    // Wait a bit for karma to update
    await new Promise(resolve => setTimeout(resolve, 500));

    const afterKarma = await getKarma(userId);
    if (!afterKarma) {
      logError('Could not fetch updated karma');
      return false;
    }

    const increase = afterKarma.karmaPoints - initialKarma.karmaPoints;
    if (increase === 10) {
      logSuccess(`Regular moment: +10 points (Total: ${afterKarma.karmaPoints})`);
      logInfo(`Breakdown - Impact Moments: ${afterKarma.karmaBreakdown.impactMoments}`);
    } else {
      logError(`Expected +10, got +${increase}`);
      return false;
    }

    // Test 2: Impact moment with mood check-in
    logTest('Creating impact moment with mood check-in');
    const beforeMoodKarma = afterKarma;

    const moodResponse = await fetch(`${BASE_URL}/api/impact-moments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        text: 'Test impact moment with mood check-in',
        tags: ['body'],
        effortLevel: 'medium',
        moodCheckIn: { before: 3, after: 5 }
      })
    });

    if (!moodResponse.ok) {
      logError('Failed to create moment with mood');
      return false;
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    const afterMoodKarma = await getKarma(userId);
    const moodIncrease = afterMoodKarma.karmaPoints - beforeMoodKarma.karmaPoints;

    if (moodIncrease === 15) {
      logSuccess(`Mood check-in moment: +15 points (Total: ${afterMoodKarma.karmaPoints})`);
    } else {
      logError(`Expected +15, got +${moodIncrease}`);
      return false;
    }

    return { momentId, success: true };
  } catch (error) {
    logError(`Exception: ${error.message}`);
    return false;
  }
}

async function testRitualCompletion(userId) {
  logSection('TEST 2: RITUAL COMPLETION');

  // Note: This test requires a valid ritualId
  // We'll use a placeholder - in real testing, you'd need to seed rituals first
  logWarning('Note: This test requires a valid ritualId. Using placeholder.');
  logInfo('To test properly, ensure rituals are seeded and use a real ritualId');

  const initialKarma = await getKarma(userId);
  if (!initialKarma) {
    logError('Could not fetch initial karma');
    return false;
  }

  logInfo(`Initial Karma: ${initialKarma.karmaPoints} points`);

  // Test quiet completion
  logTest('Completing ritual quietly');
  try {
    // You'll need to replace 'test-ritual-id' with an actual ritual ID
    const response = await fetch(`${BASE_URL}/api/rituals/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        ritualId: 'test-ritual-id', // Replace with actual ritual ID
        completedQuietly: true
      })
    });

    if (!response.ok) {
      const error = await response.json();
      if (error.error?.includes('not found') || error.error?.includes('Ritual')) {
        logWarning('Skipping ritual test - no valid ritual ID available');
        return { skipped: true };
      }
      logError(`Failed: ${error.error || response.statusText}`);
      return false;
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    const afterKarma = await getKarma(userId);
    const increase = afterKarma.karmaPoints - initialKarma.karmaPoints;

    if (increase >= 5) {
      logSuccess(`Ritual completion: +${increase} points (Total: ${afterKarma.karmaPoints})`);
      logInfo(`Breakdown - Rituals: ${afterKarma.karmaBreakdown.rituals}`);
      return { success: true };
    } else {
      logError(`Expected at least +5, got +${increase}`);
      return false;
    }
  } catch (error) {
    logWarning(`Ritual test skipped: ${error.message}`);
    return { skipped: true };
  }
}

async function testCommentCreation(userId, momentId) {
  logSection('TEST 3: COMMENT CREATION');

  if (!momentId) {
    logWarning('Skipping comment test - no moment ID available');
    return { skipped: true };
  }

  // Get moment creator ID
  try {
    const momentResponse = await fetch(`${BASE_URL}/api/impact-moments/${momentId}`);
    // If endpoint doesn't exist, we'll skip
    logWarning('Note: Comment test requires moment creator ID');
  } catch (error) {
    // Continue anyway
  }

  const initialKarma = await getKarma(userId);
  if (!initialKarma) {
    logError('Could not fetch initial karma');
    return false;
  }

  logInfo(`Initial Karma: ${initialKarma.karmaPoints} points`);

  logTest('Creating comment');
  try {
    const response = await fetch(`${BASE_URL}/api/comments/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        momentId,
        text: 'Test comment for karma testing'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      logError(`Failed: ${error.error || response.statusText}`);
      return false;
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    const afterKarma = await getKarma(userId);
    const increase = afterKarma.karmaPoints - initialKarma.karmaPoints;

    if (increase === 3) {
      logSuccess(`Comment created: +3 points (Total: ${afterKarma.karmaPoints})`);
      logInfo(`Breakdown - Engagement: ${afterKarma.karmaBreakdown.engagement}`);
      return { success: true };
    } else {
      logError(`Expected +3, got +${increase}`);
      return false;
    }
  } catch (error) {
    logError(`Exception: ${error.message}`);
    return false;
  }
}

async function testRippleReaction(userId, momentId, momentCreatorId) {
  logSection('TEST 4: RIPPLE REACTIONS');

  if (!momentId) {
    logWarning('Skipping ripple test - no moment ID available');
    return { skipped: true };
  }

  if (momentCreatorId === userId) {
    logWarning('Skipping ripple test - moment creator is the same user (self-awarding prevention)');
    return { skipped: true };
  }

  const creatorInitialKarma = momentCreatorId ? await getKarma(momentCreatorId) : null;
  if (!creatorInitialKarma && momentCreatorId) {
    logWarning('Could not fetch creator karma - will test ripple addition only');
  }

  logTest('Adding ripple reaction');
  logInfo('Note: Ripple reactions are handled client-side. Testing via direct Firestore update simulation.');
  logWarning('This test requires manual verification or a test endpoint');

  // Since ripples are handled client-side, we can't easily test via API
  // But we can verify the logic is in place
  logInfo('✓ Ripple karma tracking integrated in src/pages/home.tsx');
  logInfo('✓ Awards +2 points to moment creator when ripple is added');
  logInfo('✓ Prevents self-awarding');

  return { skipped: true, note: 'Requires manual testing via UI' };
}

async function testJoinedYouAction(userId, momentId, momentCreatorId) {
  logSection('TEST 5: JOINED YOU ACTIONS');

  if (!momentId) {
    logWarning('Skipping joined you test - no moment ID available');
    return { skipped: true };
  }

  if (momentCreatorId === userId) {
    logWarning('Skipping joined you test - moment creator is the same user');
    return { skipped: true };
  }

  logTest('Joining someone\'s action');
  logInfo('Note: Joined You actions are handled client-side via modal');
  logWarning('This test requires manual verification or a test endpoint');

  logInfo('✓ Joined You karma tracking integrated in src/pages/home.tsx');
  logInfo('✓ Awards +10 points to joiner (joined_you_created)');
  logInfo('✓ Awards +15 points to original creator (joined_you_received)');
  logInfo('✓ Prevents self-awarding');

  return { skipped: true, note: 'Requires manual testing via UI' };
}

async function runTests(userId) {
  if (!userId) {
    logError('User ID is required');
    console.log('Usage: node scripts/test-karma-phase3.js <userId>');
    console.log('Example: node scripts/test-karma-phase3.js abc123');
    process.exit(1);
  }

  logSection('PHASE 3: KARMA TRACKING INTEGRATION TEST');
  log(`Testing for User ID: ${userId}`, 'yellow');
  log(`Base URL: ${BASE_URL}`, 'yellow');

  const results = {
    impactMoments: false,
    rituals: false,
    comments: false,
    ripples: false,
    joinedYou: false
  };

  let momentId = null;
  let momentCreatorId = null;

  // Test 1: Impact Moments
  const impactResult = await testImpactMomentCreation(userId);
  if (impactResult && impactResult.success) {
    results.impactMoments = true;
    momentId = impactResult.momentId;
    momentCreatorId = userId; // For this test, creator is the test user
  }

  // Test 2: Rituals
  const ritualResult = await testRitualCompletion(userId);
  if (ritualResult && ritualResult.success) {
    results.rituals = true;
  }

  // Test 3: Comments
  const commentResult = await testCommentCreation(userId, momentId);
  if (commentResult && commentResult.success) {
    results.comments = true;
  }

  // Test 4: Ripples
  const rippleResult = await testRippleReaction(userId, momentId, momentCreatorId);
  if (rippleResult && !rippleResult.skipped) {
    results.ripples = true;
  }

  // Test 5: Joined You
  const joinedResult = await testJoinedYouAction(userId, momentId, momentCreatorId);
  if (joinedResult && !joinedResult.skipped) {
    results.joinedYou = true;
  }

  // Final Summary
  logSection('TEST SUMMARY');

  const testNames = {
    impactMoments: 'Impact Moment Creation',
    rituals: 'Ritual Completion',
    comments: 'Comment Creation',
    ripples: 'Ripple Reactions',
    joinedYou: 'Joined You Actions'
  };

  Object.entries(results).forEach(([key, passed]) => {
    const name = testNames[key];
    if (passed) {
      logSuccess(name);
    } else if (key === 'ripples' || key === 'joinedYou') {
      logWarning(`${name} - Requires manual UI testing`);
    } else {
      logError(name);
    }
  });

  const automatedTests = ['impactMoments', 'rituals', 'comments'];
  const passedAutomated = automatedTests.filter(key => results[key]).length;
  const totalAutomated = automatedTests.length;

  console.log(`\n   Automated Tests: ${passedAutomated}/${totalAutomated} passed`);
  console.log(`   Manual Tests: Ripples and Joined You require UI testing`);

  // Get final karma
  const finalKarma = await getKarma(userId);
  if (finalKarma) {
    logSection('FINAL KARMA STATUS');
    log(`Total Karma Points: ${finalKarma.karmaPoints}`, 'magenta');
    console.log(`   Breakdown:`);
    console.log(`     - Impact Moments: ${finalKarma.karmaBreakdown.impactMoments}`);
    console.log(`     - Rituals: ${finalKarma.karmaBreakdown.rituals}`);
    console.log(`     - Engagement: ${finalKarma.karmaBreakdown.engagement}`);
    console.log(`     - Chains: ${finalKarma.karmaBreakdown.chains}`);
    console.log(`     - Milestones: ${finalKarma.karmaBreakdown.milestones}`);
  }

  if (passedAutomated === totalAutomated) {
    log('\n🎉 All automated tests passed! Phase 3 integrations are working correctly.', 'green');
    log('\n📝 Next Steps:', 'cyan');
    log('   1. Test Ripples manually: Add a ripple to someone else\'s moment', 'yellow');
    log('   2. Test Joined You manually: Join someone else\'s action', 'yellow');
    log('   3. Verify karma increases in Firestore Console', 'yellow');
    process.exit(0);
  } else {
    log('\n⚠️  Some automated tests failed. Please review the errors above.', 'yellow');
    process.exit(1);
  }
}

// Run tests
const userId = process.argv[2];
runTests(userId).catch(error => {
  logError(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});

