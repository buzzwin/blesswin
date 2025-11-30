# Firebase Functions Email Testing Guide

## 🧪 Testing All Email Functions

Now that direct email sending works, let's test each Firebase Function one by one.

---

## 📧 Test 1: Joined Action Email (`notifyJoinedAction`)

### What it does:
Sends email when someone joins an impact moment.

### Method 1: Real User Flow (Recommended)

1. **Create an Impact Moment:**
   - Log in as User A
   - Go to `/home`
   - Create an impact moment: "I'm planting a tree today 🌱"
   - Note the moment ID from the URL or Firestore

2. **Join the Action:**
   - Log in as User B (different account)
   - Find User A's moment in the feed
   - Click "Joined You" ripple option
   - Fill out the form and submit

3. **Check Email:**
   - Check User A's email inbox (`link2sources@gmail.com`)
   - Should receive: "🌱 [User B] joined your action on Buzzwin"

### Method 2: Manual Firestore Trigger

1. **Go to Firebase Console:**
   - Navigate to Firestore Database
   - Find an existing impact moment (or create one)

2. **Create a Joined Moment:**
   - Click "Add document" in `impact_moments` collection
   - Set fields:
     ```
     createdBy: [userId of person joining]
     text: "I joined this action!"
     joinedFromMomentId: [original moment ID]
     tags: ["nature"]
     effortLevel: "medium"
     createdAt: [server timestamp]
     ```

3. **Function triggers automatically** when document is created

### Verify:
```bash
# Check logs
firebase functions:log --only notifyJoinedAction

# Look for:
# - "Checking if this is a joined action..."
# - "Sending joined action email to [email]"
# - "Email sent successfully"
```

---

## 📧 Test 2: Ritual Reminder Email (`sendRitualReminders`)

### What it does:
Sends daily ritual reminder emails at 8 AM UTC.

### Method 1: Manual Trigger in Firebase Console (Recommended)

1. **Go to Firebase Console:**
   - Navigate to Functions
   - Find `sendRitualReminders`
   - Click on it

2. **Test Function:**
   - Click "Test function" tab
   - Click "Test" button
   - Function runs immediately

3. **Check Email:**
   - Should receive: "✨ [Ritual Title] - Your Daily Ritual"
   - Includes ritual details, tags, and streak info

### Method 2: Wait for Scheduled Time

- Function runs daily at 8 AM UTC
- Check email at that time

### Prerequisites:
- User must have rituals enabled
- User must have email preferences enabled (ritualReminders = true)
- User must have at least one ritual assigned

### Verify:
```bash
# Check logs
firebase functions:log --only sendRitualReminders

# Look for:
# - "Checking users for ritual reminders"
# - "Sending reminder email to [email]"
# - "Ritual reminders sent: X"
```

---

## 📧 Test 3: Weekly Summary Email (`sendWeeklySummaries`)

### What it does:
Sends weekly progress summary emails every Sunday at 6 PM UTC.

### Method 1: Manual Trigger in Firebase Console (Recommended)

1. **Go to Firebase Console:**
   - Navigate to Functions
   - Find `sendWeeklySummaries`
   - Click on it

2. **Test Function:**
   - Click "Test function" tab
   - Click "Test" button
   - Function runs immediately

3. **Check Email:**
   - Should receive: "📊 Your Week on Buzzwin"
   - Includes stats: rituals, moments, karma, streaks

### Method 2: Wait for Scheduled Time

- Function runs every Sunday at 6 PM UTC
- Check email at that time

### Prerequisites:
- User must have some activity (rituals, moments, karma)
- User must have email preferences enabled (weeklySummary = true)

### Verify:
```bash
# Check logs
firebase functions:log --only sendWeeklySummaries

# Look for:
# - "Sending weekly summary to [email]"
# - "Weekly summaries sent: X"
```

---

## 🔍 Checking Function Logs

### View All Logs:
```bash
firebase functions:log
```

### View Specific Function:
```bash
# Joined Action
firebase functions:log --only notifyJoinedAction

# Ritual Reminders
firebase functions:log --only sendRitualReminders

# Weekly Summary
firebase functions:log --only sendWeeklySummaries
```

### View Recent Logs:
```bash
# Last 50 lines
firebase functions:log | tail -50

# Follow logs in real-time
firebase functions:log --follow
```

---

## 🧪 Quick Test Checklist

### ✅ Test 1: Joined Action
- [ ] Create impact moment as User A
- [ ] Join action as User B
- [ ] Check User A's email inbox
- [ ] Verify email content
- [ ] Check logs for success

### ✅ Test 2: Ritual Reminder
- [ ] Ensure user has rituals enabled
- [ ] Enable email preferences
- [ ] Trigger function manually in Console
- [ ] Check email inbox
- [ ] Verify ritual details in email
- [ ] Check logs for success

### ✅ Test 3: Weekly Summary
- [ ] Ensure user has activity (rituals, moments)
- [ ] Enable email preferences
- [ ] Trigger function manually in Console
- [ ] Check email inbox
- [ ] Verify stats in email
- [ ] Check logs for success

---

## 🐛 Troubleshooting

### Function Not Triggering

**For `notifyJoinedAction`:**
- Check Firestore document has `joinedFromMomentId` field
- Verify document is created (not updated)
- Check function is deployed: `firebase functions:list`

**For Scheduled Functions:**
- Check function is deployed
- Verify Cloud Scheduler is enabled
- Check function logs for errors

### Email Not Sending

1. **Check Secrets:**
   ```bash
   firebase functions:secrets:access EMAIL_API
   firebase functions:secrets:access EMAIL_API_PASSWORD
   ```

2. **Check User Email Preferences:**
   - Go to Firestore: `user_ritual_states/{userId}`
   - Check `emailPreferences.ritualReminders` or `emailPreferences.weeklySummary`
   - Should be `true` or `undefined` (defaults to true)

3. **Check Function Logs:**
   ```bash
   firebase functions:log --only [function-name]
   ```
   Look for error messages

### "User email not found" Error

**For `notifyJoinedAction`:**
- Function tries to get email from Firebase Auth
- If not found, it logs a warning and skips email
- Solution: Ensure user has email in Firebase Auth

**For `sendRitualReminders` and `sendWeeklySummaries`:**
- Functions get email from Firestore `users/{userId}` document
- If not found, they skip that user
- Solution: Ensure user document has email field

---

## 📊 Expected Email Content

### Joined Action Email:
- **Subject:** "🌱 [Joiner Name] joined your action on Buzzwin"
- **Content:** Joiner name, action preview, join count
- **CTA:** "See Who Joined" → `/impact/{momentId}/chain`

### Ritual Reminder Email:
- **Subject:** "✨ [Ritual Title] - Your Daily Ritual"
- **Content:** Ritual title, description, tags, current streak
- **CTA:** "Complete Ritual" → `/rituals`

### Weekly Summary Email:
- **Subject:** "📊 Your Week on Buzzwin - X Rituals, Y Moments"
- **Content:** Stats grid (rituals, moments, karma, streak)
- **CTA:** "Continue Your Journey" → `/home`

---

## 🎯 Testing Order

1. **Test Joined Action** (easiest - just create and join)
2. **Test Ritual Reminder** (requires rituals setup)
3. **Test Weekly Summary** (requires activity data)

---

## 📝 Notes

- All functions check email preferences before sending
- Functions skip users with preferences disabled
- Functions log detailed information for debugging
- Check spam folder if emails don't arrive
- Emails may take 1-2 minutes to arrive

---

## 🆘 Need Help?

If a function isn't working:
1. Check Firebase Functions logs
2. Verify secrets are set correctly
3. Check user email preferences
4. Verify function is deployed
5. Check user has email address set

