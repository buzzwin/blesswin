#!/usr/bin/env node

/**
 * Test script for Phase 2: Karma Calculation System
 * 
 * Usage:
 *   node scripts/test-karma-phase2.js <userId>
 * 
 * This script will:
 * 1. Test GET /api/karma/[userId] - Get user karma
 * 2. Test POST /api/karma/award - Award karma for various actions
 * 3. Verify karma breakdown calculations
 * 4. Test error handling
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
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

// Test actions and their expected points
const testActions = [
  { action: 'impact_moment_created', points: 10, category: 'impactMoments' },
  { action: 'impact_moment_with_mood', points: 15, category: 'impactMoments' },
  { action: 'impact_moment_from_ritual', points: 12, category: 'impactMoments' },
  { action: 'ritual_completed_quiet', points: 5, category: 'rituals' },
  { action: 'ritual_completed_shared', points: 10, category: 'rituals' },
  { action: 'comment_created', points: 3, category: 'engagement' },
  { action: 'ripple_received', points: 2, category: 'engagement' },
  { action: 'joined_you_received', points: 15, category: 'chains' },
  { action: 'joined_you_created', points: 10, category: 'chains' },
  { action: 'streak_milestone_7', points: 25, category: 'milestones' },
  { action: 'streak_milestone_30', points: 100, category: 'milestones' },
  { action: 'impact_milestone_100', points: 50, category: 'milestones' },
  { action: 'impact_milestone_500', points: 250, category: 'milestones' }
];

async function testGetUserKarma(userId) {
  logTest('GET /api/karma/[userId]');
  
  try {
    const response = await fetch(`${BASE_URL}/api/karma/${userId}`);
    
    if (!response.ok) {
      const error = await response.json();
      logError(`API Error: ${error.error || response.statusText}`);
      return null;
    }

    const data = await response.json();
    
    if (!data.success) {
      logError(`Request failed: ${data.error}`);
      return null;
    }

    logSuccess('Karma retrieved successfully');
    console.log(`   Total Karma Points: ${data.karmaPoints || 0}`);
    console.log(`   Breakdown:`);
    console.log(`     - Impact Moments: ${data.karmaBreakdown?.impactMoments || 0}`);
    console.log(`     - Rituals: ${data.karmaBreakdown?.rituals || 0}`);
    console.log(`     - Engagement: ${data.karmaBreakdown?.engagement || 0}`);
    console.log(`     - Chains: ${data.karmaBreakdown?.chains || 0}`);
    console.log(`     - Milestones: ${data.karmaBreakdown?.milestones || 0}`);
    
    return data;
  } catch (error) {
    logError(`Failed to get user karma: ${error.message}`);
    return null;
  }
}

async function testAwardKarma(userId, action, expectedPoints, expectedCategory) {
  logTest(`POST /api/karma/award - ${action}`);
  
  try {
    // Get karma before
    const beforeResponse = await fetch(`${BASE_URL}/api/karma/${userId}`);
    const beforeData = beforeResponse.ok ? await beforeResponse.json() : null;
    const beforePoints = beforeData?.karmaPoints || 0;
    const beforeCategory = beforeData?.karmaBreakdown?.[expectedCategory] || 0;

    // Award karma
    const response = await fetch(`${BASE_URL}/api/karma/award`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        action
      })
    });

    if (!response.ok) {
      const error = await response.json();
      logError(`API Error: ${error.error || response.statusText}`);
      return false;
    }

    const data = await response.json();

    if (!data.success) {
      logError(`Request failed: ${data.error}`);
      return false;
    }

    // Verify points increased correctly
    const afterPoints = data.karmaPoints;
    const afterCategory = data.karmaBreakdown?.[expectedCategory] || 0;
    const pointsIncrease = afterPoints - beforePoints;
    const categoryIncrease = afterCategory - beforeCategory;

    if (pointsIncrease === expectedPoints && categoryIncrease === expectedPoints) {
      logSuccess(`Karma awarded correctly: +${expectedPoints} points`);
      console.log(`   Total: ${beforePoints} → ${afterPoints} (+${pointsIncrease})`);
      console.log(`   ${expectedCategory}: ${beforeCategory} → ${afterCategory} (+${categoryIncrease})`);
      return true;
    } else {
      logError(`Karma calculation mismatch!`);
      console.log(`   Expected: +${expectedPoints}, Got: +${pointsIncrease}`);
      console.log(`   Category Expected: +${expectedPoints}, Got: +${categoryIncrease}`);
      return false;
    }
  } catch (error) {
    logError(`Failed to award karma: ${error.message}`);
    return false;
  }
}

async function testErrorHandling(userId) {
  logSection('ERROR HANDLING TESTS');
  
  const errorTests = [
    {
      name: 'Invalid userId',
      body: { userId: '', action: 'impact_moment_created' },
      expectedError: 'User ID is required'
    },
    {
      name: 'Invalid action',
      body: { userId, action: 'invalid_action' },
      expectedError: 'Invalid karma action'
    },
    {
      name: 'Missing action',
      body: { userId },
      expectedError: 'Karma action is required'
    },
    {
      name: 'Non-existent user',
      body: { userId: 'non-existent-user-id-12345', action: 'impact_moment_created' },
      expectedError: 'not found'
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of errorTests) {
    logTest(`Error Test: ${test.name}`);
    
    try {
      const response = await fetch(`${BASE_URL}/api/karma/award`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.body)
      });

      const data = await response.json();

      if (!data.success && data.error && data.error.includes(test.expectedError)) {
        logSuccess(`Correctly handled: ${test.name}`);
        passed++;
      } else {
        logError(`Failed: ${test.name}`);
        console.log(`   Expected error containing: "${test.expectedError}"`);
        console.log(`   Got: ${data.error || 'No error message'}`);
        failed++;
      }
    } catch (error) {
      logError(`Exception: ${test.name} - ${error.message}`);
      failed++;
    }
  }

  console.log(`\n   Error Tests: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

async function testMultipleActions(userId) {
  logSection('MULTIPLE ACTION TEST');
  
  logTest('Awarding karma for multiple different actions');
  
  const actionsToTest = [
    { action: 'impact_moment_created', points: 10 },
    { action: 'ritual_completed_quiet', points: 5 },
    { action: 'comment_created', points: 3 },
    { action: 'ripple_received', points: 2 }
  ];

  // Get initial karma
  const initialResponse = await fetch(`${BASE_URL}/api/karma/${userId}`);
  const initialData = initialResponse.ok ? await initialResponse.json() : null;
  const initialPoints = initialData?.karmaPoints || 0;

  let totalExpected = 0;
  let allPassed = true;

  for (const { action, points } of actionsToTest) {
    totalExpected += points;
    const passed = await testAwardKarma(userId, action, points, getCategoryForAction(action));
    if (!passed) {
      allPassed = false;
    }
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Verify total increase
  const finalResponse = await fetch(`${BASE_URL}/api/karma/${userId}`);
  const finalData = finalResponse.ok ? await finalResponse.json() : null;
  const finalPoints = finalData?.karmaPoints || 0;
  const actualIncrease = finalPoints - initialPoints;

  if (actualIncrease === totalExpected) {
    logSuccess(`Total karma increase correct: +${totalExpected} points`);
    console.log(`   Initial: ${initialPoints}, Final: ${finalPoints}, Increase: +${actualIncrease}`);
  } else {
    logError(`Total karma increase mismatch!`);
    console.log(`   Expected: +${totalExpected}, Got: +${actualIncrease}`);
    allPassed = false;
  }

  return allPassed;
}

function getCategoryForAction(action) {
  if (action.startsWith('impact_moment')) return 'impactMoments';
  if (action.startsWith('ritual_completed')) return 'rituals';
  if (action === 'comment_created' || action === 'ripple_received') return 'engagement';
  if (action.startsWith('joined_you')) return 'chains';
  if (action.includes('milestone')) return 'milestones';
  return 'impactMoments';
}

async function runTests(userId) {
  if (!userId) {
    logError('User ID is required');
    console.log('Usage: node scripts/test-karma-phase2.js <userId>');
    console.log('Example: node scripts/test-karma-phase2.js abc123');
    process.exit(1);
  }

  logSection('PHASE 2: KARMA CALCULATION SYSTEM TEST');
  log(`Testing for User ID: ${userId}`, 'yellow');
  log(`Base URL: ${BASE_URL}`, 'yellow');

  const results = {
    getUserKarma: false,
    awardKarma: false,
    errorHandling: false,
    multipleActions: false
  };

  // Test 1: Get User Karma
  logSection('TEST 1: GET USER KARMA');
  const karmaData = await testGetUserKarma(userId);
  results.getUserKarma = karmaData !== null;

  // Test 2: Award Karma for each action type
  logSection('TEST 2: AWARD KARMA - ALL ACTION TYPES');
  let awardTestsPassed = 0;
  let awardTestsFailed = 0;

  for (const { action, points, category } of testActions) {
    const passed = await testAwardKarma(userId, action, points, category);
    if (passed) {
      awardTestsPassed++;
    } else {
      awardTestsFailed++;
    }
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n   Award Tests: ${awardTestsPassed} passed, ${awardTestsFailed} failed`);
  results.awardKarma = awardTestsFailed === 0;

  // Test 3: Error Handling
  results.errorHandling = await testErrorHandling(userId);

  // Test 4: Multiple Actions
  results.multipleActions = await testMultipleActions(userId);

  // Final Summary
  logSection('TEST SUMMARY');
  
  const allTests = [
    { name: 'Get User Karma', passed: results.getUserKarma },
    { name: 'Award Karma', passed: results.awardKarma },
    { name: 'Error Handling', passed: results.errorHandling },
    { name: 'Multiple Actions', passed: results.multipleActions }
  ];

  allTests.forEach(test => {
    if (test.passed) {
      logSuccess(test.name);
    } else {
      logError(test.name);
    }
  });

  const totalPassed = allTests.filter(t => t.passed).length;
  const totalTests = allTests.length;

  console.log(`\n   Total: ${totalPassed}/${totalTests} test suites passed`);

  if (totalPassed === totalTests) {
    log('\n🎉 All tests passed! Phase 2 is working correctly.', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  Some tests failed. Please review the errors above.', 'yellow');
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

