# Testing Enhanced Stats - Quick Guide

## 🚀 Quick Start

### Option 1: Using the Test Script

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **In another terminal, run the test script:**
   ```bash
   npm run test:stats YOUR_USER_ID
   ```
   
   Or directly:
   ```bash
   node scripts/test-enhanced-stats.js YOUR_USER_ID
   ```

3. **The script will:**
   - Fetch stats from the test endpoint
   - Display all enhanced metrics
   - Verify calculations
   - Show breakdown and patterns

### Option 2: Manual Browser Testing

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Test the API endpoint directly:**
   - Open: `http://localhost:3000/api/rituals/test-stats?userId=YOUR_USER_ID`
   - View the JSON response with all stats

3. **Test the UI:**
   - Navigate to: `http://localhost:3000/rituals`
   - Complete some rituals (use "Complete Quietly" or "Complete & Share")
   - Check the "Your Progress" section for enhanced stats
   - Open browser console (F12) to see debug logs

## 📋 Testing Checklist

### Basic Functionality
- [ ] Stats API returns data without errors
- [ ] Current streak displays correctly
- [ ] Longest streak displays correctly
- [ ] Total completions count is accurate

### Enhanced Metrics
- [ ] Average completions per day appears
- [ ] Completion rate percentage displays
- [ ] Best day of week shows (if completions exist)
- [ ] Completion trend shows (increasing/decreasing/stable)

### Milestones
- [ ] Streak milestones display (7, 14, 30, 60, 100 days)
- [ ] Completion milestones display (10, 25, 50, 100, 250, 500)
- [ ] Achieved milestones show checkmark ✓
- [ ] Unachieved milestones show correctly

### Visual Display
- [ ] Enhanced stats section appears on `/rituals` page
- [ ] Milestone badges display correctly
- [ ] Most active categories show (if ritual data available)
- [ ] Trend indicators display (📈/📉/➡️)

## 🧪 Test Scenarios

### Scenario 1: New User
1. Create a new account or use a user with no completions
2. Navigate to `/rituals`
3. **Expected:** All stats show 0 or empty
4. Complete one ritual
5. **Expected:** Stats update, streak = 1

### Scenario 2: Build a Streak
1. Complete rituals on 3 consecutive days
2. **Expected:** Current streak = 3
3. Skip a day
4. **Expected:** Current streak = 0, but longest streak = 3
5. Complete again
6. **Expected:** Current streak = 1

### Scenario 3: Test Milestones
1. Complete rituals until you reach 10 total
2. **Expected:** 10 completion milestone shows as achieved ✓
3. Build a 7-day streak
4. **Expected:** 7-day streak milestone shows as achieved ✓

### Scenario 4: Test Trend Detection
1. Complete 2 rituals this week, 5 last week
2. **Expected:** Trend = decreasing 📉
3. Complete 5 rituals this week, 2 last week
3. **Expected:** Trend = increasing 📈
4. Complete similar amounts
4. **Expected:** Trend = stable ➡️

## 🔍 Debugging Tips

### If stats don't appear:
1. Check browser console for errors
2. Verify user is logged in
3. Check network tab for API call failures
4. Verify user has completed at least one ritual

### If calculations seem wrong:
1. Use the test endpoint: `/api/rituals/test-stats?userId=YOUR_USER_ID`
2. Check the `breakdown` section for raw data
3. Verify completion dates are correct in Firestore
4. Check that ritual definitions exist in Firestore

### If milestones don't update:
1. Milestones are calculated on each stats fetch
2. Refresh the page to recalculate
3. Check that completion count/streak meets milestone threshold

## 📊 Expected Response Format

The test endpoint returns:
```json
{
  "success": true,
  "stats": {
    "currentStreak": 5,
    "longestStreak": 10,
    "totalCompleted": 25,
    "averageCompletionsPerDay": 1.67,
    "completionRate": 60.0,
    "bestDay": "Monday",
    "completionTrend": "increasing",
    "streakMilestones": [...],
    "completionMilestones": [...],
    "recentStreaks": [...],
    "mostActiveTags": [...]
  },
  "calculations": {...},
  "breakdown": {...}
}
```

## ✅ Success Criteria

The enhanced stats are working correctly if:
- ✅ All metrics display without errors
- ✅ Calculations match expected values
- ✅ Milestones update when thresholds are reached
- ✅ Trend detection works correctly
- ✅ Best day is identified accurately
- ✅ Stats update after completing rituals
- ✅ UI displays all enhanced metrics

## 🐛 Common Issues

**Issue:** Stats show 0 or empty
- **Solution:** Complete at least one ritual first

**Issue:** Milestones don't show as achieved
- **Solution:** Verify you've reached the milestone threshold (e.g., 10 completions for 10 milestone)

**Issue:** Best day shows undefined
- **Solution:** Need at least a few completions for pattern detection

**Issue:** Tag counts are empty
- **Solution:** Ritual definitions need to be in Firestore for tag counting

## 📝 Next Steps After Testing

Once you've verified enhanced stats work:
1. Proceed to Phase 8: Seed Data
2. Add more visualization components
3. Create achievement badges
4. Add milestone notifications

