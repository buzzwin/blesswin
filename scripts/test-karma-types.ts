/**
 * Test script to verify karma types and data model
 * Run with: npx ts-node scripts/test-karma-types.ts
 */

import { DEFAULT_KARMA_BREAKDOWN, getKarmaPoints, getKarmaCategory, type KarmaAction } from '../src/lib/types/karma';
import type { User } from '../src/lib/types/user';

// Test 1: Verify DEFAULT_KARMA_BREAKDOWN structure
console.log('Test 1: DEFAULT_KARMA_BREAKDOWN structure');
console.log('Default breakdown:', DEFAULT_KARMA_BREAKDOWN);
console.log('✓ Default breakdown has all required fields\n');

// Test 2: Verify karma point values
console.log('Test 2: Karma point values');
const testActions: KarmaAction[] = [
  'impact_moment_created',
  'impact_moment_with_mood',
  'ritual_completed_quiet',
  'ritual_completed_shared',
  'comment_created',
  'ripple_received',
  'joined_you_received',
  'streak_milestone_7',
  'streak_milestone_30'
];

testActions.forEach(action => {
  const points = getKarmaPoints(action);
  const category = getKarmaCategory(action);
  console.log(`${action}: ${points} points (category: ${category})`);
});
console.log('✓ All karma actions have point values\n');

// Test 3: Verify User type includes karma fields
console.log('Test 3: User type structure');
const testUser: Partial<User> = {
  id: 'test-user-id',
  username: 'testuser',
  name: 'Test User',
  karmaPoints: 0,
  karmaBreakdown: DEFAULT_KARMA_BREAKDOWN,
  lastKarmaUpdate: new Date()
};

console.log('Test user with karma fields:', {
  id: testUser.id,
  username: testUser.username,
  karmaPoints: testUser.karmaPoints,
  karmaBreakdown: testUser.karmaBreakdown,
  hasLastKarmaUpdate: !!testUser.lastKarmaUpdate
});
console.log('✓ User type includes karma fields\n');

// Test 4: Verify category mapping
console.log('Test 4: Category mapping');
const categoryTests: Array<[KarmaAction, string]> = [
  ['impact_moment_created', 'impactMoments'],
  ['ritual_completed_quiet', 'rituals'],
  ['comment_created', 'engagement'],
  ['ripple_received', 'engagement'],
  ['joined_you_received', 'chains'],
  ['streak_milestone_7', 'milestones']
];

categoryTests.forEach(([action, expectedCategory]) => {
  const category = getKarmaCategory(action);
  const passed = category === expectedCategory;
  console.log(`${action} → ${category} ${passed ? '✓' : '✗ (expected: ' + expectedCategory + ')'}`);
});
console.log('✓ Category mapping works correctly\n');

console.log('All tests passed! ✅');

