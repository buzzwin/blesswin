# Phase 3: Karma Tracking Integration - Testing Guide

## 🚀 Quick Start

### Prerequisites
1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Have a valid user ID ready**
   - You can get this from Firebase Console or from your logged-in session

3. **Optional: Seed rituals** (for ritual completion testing)
   ```bash
   npm run seed:rituals
   ```

### Running the Tests

**Option 1: Using npm script**
```bash
npm run test:karma-integration YOUR_USER_ID
```

**Option 2: Direct execution**
```bash
node scripts/test-karma-phase3.js YOUR_USER_ID
```

**Option 3: Custom base URL**
```bash
BASE_URL=http://localhost:3000 node scripts/test-karma-phase3.js YOUR_USER_ID
```

---

## 📋 Test Coverage

### Automated Tests

#### 1. **Impact Moment Creation**
- ✅ Regular impact moment (+10 points)
- ✅ Impact moment with mood check-in (+15 points)
- ✅ Verifies karma breakdown updates correctly

#### 2. **Ritual Completion**
- ⚠️ Requires valid ritual ID
- ✅ Quiet completion (+5 points)
- ✅ Shared completion (+10 points)
- ✅ Streak milestone detection (+25 for 7-day, +100 for 30-day)

#### 3. **Comment Creation**
- ✅ Comment creation (+3 points to commenter)
- ✅ Engagement reward (+2 points to moment creator)
- ✅ Verifies both users get karma

### Manual Tests (Require UI)

#### 4. **Ripple Reactions**
- 📱 Test via UI: Add ripple to someone else's moment
- ✅ Should award +2 points to moment creator
- ✅ Should prevent self-awarding

#### 5. **Joined You Actions**
- 📱 Test via UI: Join someone else's action
- ✅ Should award +10 points to joiner
- ✅ Should award +15 points to original creator
- ✅ Should prevent self-awarding

---

## 🧪 Manual Testing Steps

### Test Ripple Reactions

1. **Create a test moment:**
   - Go to `/home`
   - Create an impact moment
   - Note the moment ID

2. **Add a ripple (as different user or same user):**
   - Click ripple button on the moment
   - Select a ripple type (inspired, grateful, sent_love)
   - Verify toast message appears

3. **Check karma:**
   ```bash
   curl http://localhost/api/karma/MOMENT_CREATOR_ID
   ```
   - Should show +2 points increase in engagement category

### Test Joined You Actions

1. **Create a test moment:**
   - Go to `/home`
   - Create an impact moment
   - Note the moment ID and creator ID

2. **Join the action:**
   - Click "Joined You" ripple button
   - Fill out the join modal
   - Submit

3. **Check karma for both users:**
   ```bash
   # Check joiner karma
   curl http://localhost/api/karma/JOINER_ID
   
   # Check creator karma
   curl http://localhost/api/karma/CREATOR_ID
   ```
   - Joiner should have +10 points in chains category
   - Creator should have +15 points in chains category

---

## 📊 Expected Test Output

### Successful Test Run

```
======================================================================
PHASE 3: KARMA TRACKING INTEGRATION TEST
======================================================================
Testing for User ID: abc123
Base URL: http://localhost

======================================================================
TEST 1: IMPACT MOMENT CREATION
======================================================================

🧪 Testing: Creating regular impact moment
✅ Regular moment: +10 points (Total: 10)
ℹ️  Breakdown - Impact Moments: 10

🧪 Testing: Creating impact moment with mood check-in
✅ Mood check-in moment: +15 points (Total: 25)

======================================================================
TEST 2: RITUAL COMPLETION
======================================================================

⚠️  Note: This test requires a valid ritualId. Using placeholder.
⚠️  Skipping ritual test - no valid ritual ID available

======================================================================
TEST 3: COMMENT CREATION
======================================================================

🧪 Testing: Creating comment
✅ Comment created: +3 points (Total: 28)
ℹ️  Breakdown - Engagement: 3

======================================================================
TEST SUMMARY
======================================================================
✅ Impact Moment Creation
⚠️  Ritual Completion - Requires manual UI testing
✅ Comment Creation
⚠️  Ripple Reactions - Requires manual UI testing
⚠️  Joined You Actions - Requires manual UI testing

   Automated Tests: 2/3 passed
   Manual Tests: Ripples and Joined You require UI testing

======================================================================
FINAL KARMA STATUS
======================================================================
Total Karma Points: 28
   Breakdown:
     - Impact Moments: 25
     - Rituals: 0
     - Engagement: 3
     - Chains: 0
     - Milestones: 0

🎉 All automated tests passed! Phase 3 integrations are working correctly.
```

---

## 🔍 Verification Checklist

### Impact Moments
- [ ] Regular moment awards +10 points
- [ ] Mood check-in moment awards +15 points
- [ ] Ritual-based moment awards +12 points
- [ ] Karma breakdown updates correctly
- [ ] Impact moment milestones detected (100, 500)

### Rituals
- [ ] Quiet completion awards +5 points
- [ ] Shared completion awards +10 points
- [ ] 7-day streak awards +25 points
- [ ] 30-day streak awards +100 points
- [ ] Karma breakdown updates correctly

### Comments
- [ ] Commenter gets +3 points
- [ ] Moment creator gets +2 points
- [ ] Both karma breakdowns update correctly
- [ ] Self-commenting doesn't award double karma

### Ripples (Manual)
- [ ] Adding ripple awards +2 to creator
- [ ] Removing ripple doesn't award karma
- [ ] Self-rippling doesn't award karma
- [ ] All ripple types work (inspired, grateful, sent_love)

### Joined You (Manual)
- [ ] Joiner gets +10 points
- [ ] Original creator gets +15 points
- [ ] Self-joining doesn't award karma
- [ ] Chain is created correctly

---

## 🐛 Troubleshooting

### Common Issues

**1. "User not found" error**
- Verify the user ID exists in Firestore
- Check that the user document has karma fields initialized

**2. "Impact moment not found" error**
- Ensure the moment ID is correct
- Check that the moment exists in Firestore

**3. Karma not updating**
- Check Firestore rules allow karma updates
- Verify API endpoints are working
- Check browser console for errors
- Verify `lastKarmaUpdate` timestamp is being set

**4. Ritual test fails**
- Ensure rituals are seeded: `npm run seed:rituals`
- Use a valid ritual ID from Firestore
- Check that ritual completion API is working

**5. Comment test fails**
- Ensure moment ID is valid
- Check that comment API endpoint exists
- Verify Firestore rules allow comment creation

---

## 📈 Verifying Results

### Check Firestore Console

1. Go to Firebase Console → Firestore Database
2. Navigate to `users/{userId}`
3. Verify:
   - `karmaPoints` field has increased
   - `karmaBreakdown` object shows correct category increases
   - `lastKarmaUpdate` timestamp is recent

### Check via API

```bash
# Get user karma
curl http://localhost/api/karma/YOUR_USER_ID

# Expected response:
{
  "success": true,
  "karmaPoints": 28,
  "karmaBreakdown": {
    "impactMoments": 25,
    "rituals": 0,
    "engagement": 3,
    "chains": 0,
    "milestones": 0
  }
}
```

---

## ✅ Success Criteria

Phase 3 is considered successful when:

- ✅ Impact moments award correct karma
- ✅ Ritual completions award correct karma
- ✅ Comments award karma to both users
- ✅ Ripples award karma to moment creator (manual test)
- ✅ Joined You awards karma to both users (manual test)
- ✅ Milestones are detected and awarded
- ✅ Self-awarding is prevented
- ✅ Karma breakdown categories are correct
- ✅ Errors don't break main functionality

---

## 🎯 Next Steps

After Phase 3 testing is complete:

1. **Phase 4: User Profile Updates**
   - Display karma points on user profiles
   - Create karma breakdown visualization
   - Add karma badge component

2. **Manual Testing**
   - Test ripple reactions via UI
   - Test joined you actions via UI
   - Verify all karma awards in Firestore

---

**Happy Testing! 🚀**

