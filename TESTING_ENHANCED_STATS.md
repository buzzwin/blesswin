# Testing Enhanced Stats for Daily Rituals

This guide helps you test and verify the enhanced stats functionality for Daily Rituals.

## 🧪 Test Endpoint

A dedicated test endpoint has been created at `/api/rituals/test-stats` that provides detailed breakdown of all stats calculations.

### Usage

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Access the test endpoint:**
   ```
   GET /api/rituals/test-stats?userId=YOUR_USER_ID
   ```

3. **Expected Response:**
   ```json
   {
     "success": true,
     "stats": {
       "currentStreak": 5,
       "longestStreak": 10,
       "totalCompleted": 25,
       "completedThisWeek": 7,
       "completedThisMonth": 20,
       "completedDays": 15,
       "mostActiveTags": [
         { "tag": "mind", "count": 10 },
         { "tag": "body", "count": 8 }
       ],
       "sharedCount": 12,
       "quietCount": 13,
       "averageCompletionsPerDay": 1.67,
       "completionRate": 60.0,
       "bestDay": "Monday",
       "streakMilestones": [
         { "milestone": 7, "achieved": false },
         { "milestone": 14, "achieved": false },
         { "milestone": 30, "achieved": false }
       ],
       "completionMilestones": [
         { "milestone": 10, "achieved": true },
         { "milestone": 25, "achieved": true },
         { "milestone": 50, "achieved": false }
       ],
       "recentStreaks": [
         { "startDate": "2024-01-01", "endDate": "2024-01-05", "length": 5 }
       ],
       "completionTrend": "increasing",
       "lastCompletedDate": "2024-01-15"
     },
     "calculations": {
       "currentStreak": 5,
       "longestStreak": 10,
       "recentStreaks": [...],
       "completionTrend": "increasing",
       "bestDay": "Monday"
     },
     "breakdown": {
       "totalCompletions": 25,
       "uniqueDates": 15,
       "dateRange": {
         "first": "2024-01-01",
         "last": "2024-01-15",
         "days": 15
       },
       "completionsByDate": [...],
       "sharedVsQuiet": {
         "shared": 12,
         "quiet": 13
       }
     }
   }
   ```

## 📊 Enhanced Stats Display

The `/rituals` page now displays enhanced stats including:

### Basic Metrics
- Current Streak
- Longest Streak
- Completed This Week
- Completed This Month
- Total Completed

### Detailed Insights
- **Average Completions Per Day**: Shows average number of completions per day
- **Completion Rate**: Percentage of days with at least one completion
- **Best Day**: Day of week with most completions
- **Trend**: Whether completions are increasing 📈, decreasing 📉, or stable ➡️

### Milestones
- **Streak Milestones**: 7, 14, 30, 60, 100 days (shows achieved ✓)
- **Completion Milestones**: 10, 25, 50, 100, 250, 500 completions (shows achieved ✓)

### Most Active Categories
- Shows top 3 tags/categories with completion counts

## 🧪 Testing Scenarios

### Scenario 1: New User (No Completions)
1. Create a new user account
2. Navigate to `/rituals`
3. Check that all stats show 0 or empty
4. Complete a ritual
5. Verify stats update correctly

### Scenario 2: Active User (Multiple Completions)
1. Complete rituals for several days
2. Mix shared and quiet completions
3. Check `/api/rituals/test-stats?userId=YOUR_USER_ID`
4. Verify:
   - Streak calculation is correct
   - Completion rate is accurate
   - Best day is identified
   - Milestones are tracked
   - Trend is calculated

### Scenario 3: Streak Testing
1. Complete rituals on consecutive days
2. Verify streak increases
3. Skip a day
4. Verify streak resets
5. Check longest streak is preserved

### Scenario 4: Milestone Testing
1. Complete rituals until you reach milestones
2. Verify milestones show as achieved
3. Check milestone tracking persists

## 🔍 Verification Checklist

- [ ] Current streak calculates correctly
- [ ] Longest streak tracks properly
- [ ] Average completions per day is accurate
- [ ] Completion rate percentage is correct
- [ ] Best day of week is identified
- [ ] Completion trend (increasing/decreasing/stable) works
- [ ] Streak milestones track correctly
- [ ] Completion milestones track correctly
- [ ] Recent streaks history is accurate
- [ ] Most active tags are counted correctly
- [ ] Shared vs quiet counts are accurate
- [ ] Stats update after completing rituals
- [ ] UI displays all enhanced metrics correctly

## 🐛 Debugging

If stats don't appear correct:

1. **Check the test endpoint:**
   ```
   /api/rituals/test-stats?userId=YOUR_USER_ID
   ```
   This shows detailed breakdown of all calculations.

2. **Check browser console:**
   - Look for any errors when fetching stats
   - Verify API responses contain expected data

3. **Check Firestore:**
   - Verify completions are being saved correctly
   - Check `ritual_completions` subcollection
   - Verify `ritual_state` document exists

4. **Verify ritual definitions:**
   - Ensure rituals collection has data
   - Check that ritual IDs match completion records

## 📝 Notes

- Stats are calculated in real-time from completion data
- Milestones are checked on each stats fetch
- Trends compare last week vs previous week
- Best day is calculated from all completions
- Recent streaks show last 5 streaks

## 🚀 Next Steps

After verifying enhanced stats work correctly, you can:
- Proceed to Phase 8: Seed Data
- Add more visualization components
- Create achievement badges based on milestones
- Add notifications for milestone achievements

