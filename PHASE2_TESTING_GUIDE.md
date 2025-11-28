# Phase 2: Karma Calculation System - Testing Guide

## 🚀 Quick Start

### Prerequisites
1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Have a valid user ID ready**
   - You can get this from Firebase Console or from your logged-in session
   - Or use your own user ID if you're logged in

### Running the Tests

**Option 1: Using npm script**
```bash
npm run test:karma YOUR_USER_ID
```

**Option 2: Direct execution**
```bash
node scripts/test-karma-phase2.js YOUR_USER_ID
```

**Option 3: Custom base URL**
```bash
BASE_URL=http://localhost:3000 node scripts/test-karma-phase2.js YOUR_USER_ID
```

---

## 📋 Test Coverage

The test script covers:

### 1. **Get User Karma** (`GET /api/karma/[userId]`)
- ✅ Retrieves user's current karma points
- ✅ Retrieves karma breakdown by category
- ✅ Handles user not found errors

### 2. **Award Karma** (`POST /api/karma/award`)
Tests all 13 karma action types:
- ✅ `impact_moment_created` (10 points → impactMoments)
- ✅ `impact_moment_with_mood` (15 points → impactMoments)
- ✅ `impact_moment_from_ritual` (12 points → impactMoments)
- ✅ `ritual_completed_quiet` (5 points → rituals)
- ✅ `ritual_completed_shared` (10 points → rituals)
- ✅ `comment_created` (3 points → engagement)
- ✅ `ripple_received` (2 points → engagement)
- ✅ `joined_you_received` (15 points → chains)
- ✅ `joined_you_created` (10 points → chains)
- ✅ `streak_milestone_7` (25 points → milestones)
- ✅ `streak_milestone_30` (100 points → milestones)
- ✅ `impact_milestone_100` (50 points → milestones)
- ✅ `impact_milestone_500` (250 points → milestones)

### 3. **Error Handling**
- ✅ Invalid userId
- ✅ Invalid action
- ✅ Missing action
- ✅ Non-existent user

### 4. **Multiple Actions**
- ✅ Awarding karma for multiple different actions
- ✅ Verifying total karma increase is correct
- ✅ Verifying category breakdowns are correct

---

## 📊 Expected Output

### Successful Test Run

```
============================================================
PHASE 2: KARMA CALCULATION SYSTEM TEST
============================================================
Testing for User ID: abc123
Base URL: http://localhost

============================================================
TEST 1: GET USER KARMA
============================================================

🧪 Testing: GET /api/karma/[userId]
✅ Karma retrieved successfully
   Total Karma Points: 0
   Breakdown:
     - Impact Moments: 0
     - Rituals: 0
     - Engagement: 0
     - Chains: 0
     - Milestones: 0

============================================================
TEST 2: AWARD KARMA - ALL ACTION TYPES
============================================================

🧪 Testing: POST /api/karma/award - impact_moment_created
✅ Karma awarded correctly: +10 points
   Total: 0 → 10 (+10)
   impactMoments: 0 → 10 (+10)

[... more tests ...]

   Award Tests: 13 passed, 0 failed

============================================================
ERROR HANDLING TESTS
============================================================

[... error tests ...]

============================================================
TEST SUMMARY
============================================================
✅ Get User Karma
✅ Award Karma
✅ Error Handling
✅ Multiple Actions

   Total: 4/4 test suites passed

🎉 All tests passed! Phase 2 is working correctly.
```

---

## 🧪 Manual Testing

### Test via Browser/Postman

**1. Get User Karma:**
```
GET http://localhost/api/karma/YOUR_USER_ID
```

**2. Award Karma:**
```
POST http://localhost/api/karma/award
Content-Type: application/json

{
  "userId": "YOUR_USER_ID",
  "action": "impact_moment_created"
}
```

### Test via cURL

**Get Karma:**
```bash
curl http://localhost/api/karma/YOUR_USER_ID
```

**Award Karma:**
```bash
curl -X POST http://localhost/api/karma/award \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID",
    "action": "ritual_completed_shared"
  }'
```

---

## 🔍 Troubleshooting

### Common Issues

**1. "User not found" error**
- Verify the user ID exists in Firestore
- Check that the user document has karma fields initialized
- Try creating a new user or initializing karma manually

**2. "Invalid karma action" error**
- Verify the action name matches exactly (case-sensitive)
- Check the list of valid actions in `src/lib/types/karma.ts`

**3. API endpoint not found**
- Ensure the dev server is running (`npm run dev`)
- Check that the API routes exist in `src/pages/api/karma/`
- Verify the base URL is correct (default: `http://localhost`)

**4. Karma not updating**
- Check Firestore rules allow karma updates
- Verify the user document exists
- Check browser console for errors
- Verify `lastKarmaUpdate` timestamp is being set

**5. Category breakdown incorrect**
- Verify the action maps to the correct category
- Check `getKarmaCategory()` function in `src/lib/types/karma.ts`
- Ensure category names match exactly (case-sensitive)

---

## 📈 Verifying Results

### Check Firestore Console

1. Go to Firebase Console → Firestore Database
2. Navigate to `users/{userId}`
3. Verify:
   - `karmaPoints` field exists and has correct value
   - `karmaBreakdown` object exists with all categories
   - `lastKarmaUpdate` timestamp is recent

### Check via API

```bash
# Get current karma
curl http://localhost/api/karma/YOUR_USER_ID

# Award karma
curl -X POST http://localhost/api/karma/award \
  -H "Content-Type: application/json" \
  -d '{"userId": "YOUR_USER_ID", "action": "impact_moment_created"}'

# Get updated karma (should show +10 points)
curl http://localhost/api/karma/YOUR_USER_ID
```

---

## ✅ Success Criteria

Phase 2 is considered successful when:

- ✅ All 13 karma action types award correct points
- ✅ Karma breakdown categories are updated correctly
- ✅ Total karma points increase correctly
- ✅ Error handling works for invalid inputs
- ✅ API endpoints return correct responses
- ✅ Firestore updates are persisted correctly
- ✅ `lastKarmaUpdate` timestamp is set on each update

---

## 🎯 Next Steps

After Phase 2 testing is complete:

1. **Phase 3: Integrate Karma Tracking**
   - Integrate karma awards into Impact Moments creation
   - Integrate karma awards into Ritual completion
   - Add karma tracking for comments and ripples
   - Implement milestone detection

2. **Phase 4: User Profile Updates**
   - Display karma points on user profiles
   - Create karma breakdown visualization
   - Add karma leaderboard (optional)

---

**Happy Testing! 🚀**

