#!/usr/bin/env node

/**
 * Test script for Enhanced Stats
 * 
 * Usage:
 *   node scripts/test-enhanced-stats.js <userId>
 * 
 * This script will:
 * 1. Fetch stats from the test endpoint
 * 2. Display all enhanced metrics
 * 3. Verify calculations are correct
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testEnhancedStats(userId) {
  if (!userId) {
    console.error('❌ Error: User ID is required');
    console.log('Usage: node scripts/test-enhanced-stats.js <userId>');
    process.exit(1);
  }

  console.log('🧪 Testing Enhanced Stats for User:', userId);
  console.log('📡 Fetching from:', `${BASE_URL}/api/rituals/test-stats?userId=${userId}\n`);

  try {
    const response = await fetch(`${BASE_URL}/api/rituals/test-stats?userId=${userId}`);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('❌ API Error:', error);
      process.exit(1);
    }

    const data = await response.json();

    if (!data.success) {
      console.error('❌ Request failed:', data.error);
      process.exit(1);
    }

    console.log('✅ Stats fetched successfully!\n');
    console.log('='.repeat(60));
    console.log('📊 ENHANCED STATS SUMMARY');
    console.log('='.repeat(60));

    const { stats, calculations, breakdown } = data;

    // Basic Stats
    console.log('\n🔥 STREAKS:');
    console.log(`   Current Streak: ${stats.currentStreak} days`);
    console.log(`   Longest Streak: ${stats.longestStreak} days`);
    if (calculations.recentStreaks && calculations.recentStreaks.length > 0) {
      console.log(`   Recent Streaks: ${calculations.recentStreaks.length} streaks found`);
      calculations.recentStreaks.forEach((streak, idx) => {
        console.log(`     ${idx + 1}. ${streak.length} days (${streak.startDate} to ${streak.endDate})`);
      });
    }

    // Completion Stats
    console.log('\n📈 COMPLETIONS:');
    console.log(`   Total Completed: ${stats.totalCompleted}`);
    console.log(`   This Week: ${stats.completedThisWeek}`);
    console.log(`   This Month: ${stats.completedThisMonth}`);
    console.log(`   Unique Days: ${stats.completedDays}`);
    if (stats.averageCompletionsPerDay !== undefined) {
      console.log(`   Avg per Day: ${stats.averageCompletionsPerDay.toFixed(2)}`);
    }
    if (stats.completionRate !== undefined) {
      console.log(`   Completion Rate: ${stats.completionRate.toFixed(1)}%`);
    }

    // Pattern Analysis
    console.log('\n🎯 PATTERNS:');
    if (stats.bestDay) {
      console.log(`   Best Day: ${stats.bestDay}`);
    }
    if (stats.completionTrend) {
      const trendEmoji = {
        increasing: '📈',
        decreasing: '📉',
        stable: '➡️'
      };
      console.log(`   Trend: ${trendEmoji[stats.completionTrend] || ''} ${stats.completionTrend}`);
    }
    if (stats.lastCompletedDate) {
      console.log(`   Last Completed: ${stats.lastCompletedDate}`);
    }

    // Milestones
    console.log('\n🏆 STREAK MILESTONES:');
    if (stats.streakMilestones && stats.streakMilestones.length > 0) {
      stats.streakMilestones.forEach(m => {
        const status = m.achieved ? '✅' : '⏳';
        console.log(`   ${status} ${m.milestone} days ${m.achieved ? '(Achieved!)' : '(Not yet)'}`);
      });
    }

    console.log('\n🎖️ COMPLETION MILESTONES:');
    if (stats.completionMilestones && stats.completionMilestones.length > 0) {
      stats.completionMilestones.forEach(m => {
        const status = m.achieved ? '✅' : '⏳';
        console.log(`   ${status} ${m.milestone} completions ${m.achieved ? '(Achieved!)' : '(Not yet)'}`);
      });
    }

    // Tags
    console.log('\n🏷️ MOST ACTIVE CATEGORIES:');
    if (stats.mostActiveTags && stats.mostActiveTags.length > 0) {
      stats.mostActiveTags.forEach(({ tag, count }) => {
        console.log(`   ${tag}: ${count} completions`);
      });
    } else {
      console.log('   No tag data available (ritual definitions may be missing)');
    }

    // Breakdown
    console.log('\n📋 BREAKDOWN:');
    console.log(`   Total Completions: ${breakdown.totalCompletions}`);
    console.log(`   Unique Dates: ${breakdown.uniqueDates}`);
    if (breakdown.dateRange.first && breakdown.dateRange.last) {
      console.log(`   Date Range: ${breakdown.dateRange.first} to ${breakdown.dateRange.last} (${breakdown.dateRange.days} days)`);
    }
    console.log(`   Shared: ${breakdown.sharedVsQuiet.shared}`);
    console.log(`   Quiet: ${breakdown.sharedVsQuiet.quiet}`);

    if (breakdown.completionsByDate && breakdown.completionsByDate.length > 0) {
      console.log('\n📅 RECENT COMPLETIONS BY DATE:');
      breakdown.completionsByDate.forEach(({ date, count }) => {
        console.log(`   ${date}: ${count} completion(s)`);
      });
    }

    // Verification
    console.log('\n' + '='.repeat(60));
    console.log('✅ VERIFICATION');
    console.log('='.repeat(60));

    const verifications = [];

    // Verify streak calculation
    if (calculations.currentStreak === stats.currentStreak) {
      verifications.push('✅ Current streak matches calculation');
    } else {
      verifications.push(`❌ Current streak mismatch: ${calculations.currentStreak} vs ${stats.currentStreak}`);
    }

    if (calculations.longestStreak === stats.longestStreak) {
      verifications.push('✅ Longest streak matches calculation');
    } else {
      verifications.push(`❌ Longest streak mismatch: ${calculations.longestStreak} vs ${stats.longestStreak}`);
    }

    // Verify completion rate
    if (breakdown.uniqueDates > 0 && breakdown.dateRange.days > 0) {
      const expectedRate = (breakdown.uniqueDates / breakdown.dateRange.days) * 100;
      if (Math.abs(stats.completionRate - expectedRate) < 1) {
        verifications.push('✅ Completion rate is accurate');
      } else {
        verifications.push(`⚠️ Completion rate may be off: ${stats.completionRate}% vs expected ${expectedRate.toFixed(1)}%`);
      }
    }

    // Verify totals
    if (breakdown.totalCompletions === stats.totalCompleted) {
      verifications.push('✅ Total completions match');
    } else {
      verifications.push(`❌ Total completions mismatch: ${breakdown.totalCompletions} vs ${stats.totalCompleted}`);
    }

    verifications.forEach(v => console.log(`   ${v}`));

    console.log('\n' + '='.repeat(60));
    console.log('✨ Test Complete!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error testing stats:', error.message);
    console.error('\nMake sure:');
    console.error('1. Development server is running (npm run dev)');
    console.error('2. User ID is correct');
    console.error('3. User has some ritual completions');
    process.exit(1);
  }
}

// Get userId from command line
const userId = process.argv[2];

// Run test
testEnhancedStats(userId).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

