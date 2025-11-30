# Email Functions Testing Guide

## 🧪 Testing Email Notifications

This guide covers how to test all three email notification functions.

## Prerequisites

1. **Verify Functions are Deployed:**
   ```bash
   firebase functions:list
   ```
   You should see:
   - `notifyJoinedAction`
   - `sendRitualReminders`
   - `sendWeeklySummaries`

2. **Verify Secrets are Set:**
   ```bash
   firebase functions:secrets:access EMAIL_API
   firebase functions:secrets:access EMAIL_API_PASSWORD
   firebase functions:secrets:access TARGET_EMAIL
   ```

3. **Check User Email Preferences:**
   - Go to `/settings` page
   - Ensure email preferences are enabled for the features you want to test
   - Or check in Firestore: `user_ritual_states/{userId}/emailPreferences`

---

## 📧 Test 1: Joined Action Email (`notifyJoinedAction`)

### What it does:
Sends an email to the original creator when someone joins their impact moment.

### How to Test:

#### Option A: Real User Flow (Recommended)
1. **Create an Impact Moment:**
   - Log in as User A
   - Go to `/home`
   - Create an impact moment (e.g., "I'm planting a tree today")
   - Note the moment ID from the URL or Firestore

2. **Join the Action:**
   - Log in as User B (different account)
   - Find User A's impact moment in the feed
   - Click "Joined You" ripple option
   - Fill out the join form and submit

3. **Check Email:**
   - Check User A's email inbox (`link2sources@gmail.com`)
   - Should receive email: "🌱 [User B] joined your action on Buzzwin"

#### Option B: Manual Firestore Trigger
1. **Create a test impact moment in Firestore:**
   ```bash
   # In Firebase Console → Firestore
   # Create document: impact_moments/{testMomentId}
   {
     "createdBy": "originalCreatorUserId",
     "text": "Test action",
     "joinedFromMomentId": null,
     "createdAt": Timestamp.now()
   }
   ```

2. **Create a joined moment:**
   ```bash
   # Create document: impact_moments/{joinedMomentId}
   {
     "createdBy": "joinerUserId",
     "text": "I joined this action",
     "joinedFromMomentId": "testMomentId",
     "createdAt": Timestamp.now()
   }
   ```

3. **Function will trigger automatically** when the joined moment is created

### Verify in Logs:
```bash
firebase functions:log --only notifyJoinedAction
```

Look for:
- "Sending joined action email to [email]"
- "Email sent successfully"

---

## 📧 Test 2: Daily Ritual Reminders (`sendRitualReminders`)

### What it does:
Sends daily email reminders for rituals at scheduled times (8 AM UTC by default).

### How to Test:

#### Option A: Wait for Scheduled Time
1. **Set up a user with rituals:**
   - Log in and go to `/rituals`
   - Complete onboarding if needed
   - Ensure you have at least one ritual enabled
   - Set email preferences: Ritual Reminders = ON
   - Set notification time preferences

2. **Wait for scheduled time:**
   - Function runs daily at 8 AM UTC
   - Check your email at that time

#### Option B: Manual Trigger in Firebase Console (Recommended for Testing)
1. **Go to Firebase Console:**
   - Navigate to: Functions → `sendRitualReminders`
   - Click "Test function"

2. **Trigger manually:**
   - Click "Test" button
   - Function will run immediately
   - Check logs for results

3. **Check Email:**
   - Should receive email: "✨ [Ritual Title] - Your Daily Ritual"
   - Includes ritual description, tags, and streak info

#### Option C: Use Firebase CLI
```bash
# Trigger the function manually
firebase functions:shell

# In the shell:
sendRitualReminders()
```

### Verify in Logs:
```bash
firebase functions:log --only sendRitualReminders
```

Look for:
- "Checking users for ritual reminders"
- "Sending reminder email to [email]"
- "Ritual reminders sent: X"

### Test Different Scenarios:
- ✅ User with enabled rituals → Should receive email
- ✅ User with quiet hours → Should skip if in quiet hours
- ✅ User with email preferences OFF → Should skip
- ✅ User with no rituals → Should skip

---

## 📧 Test 3: Weekly Progress Summary (`sendWeeklySummaries`)

### What it does:
Sends weekly progress summary emails every Sunday at 6 PM UTC.

### How to Test:

#### Option A: Wait for Scheduled Time
1. **Set up user activity:**
   - Log in and create some impact moments
   - Complete some rituals
   - Generate karma points
   - Set email preferences: Weekly Summary = ON

2. **Wait for Sunday 6 PM UTC:**
   - Function runs weekly on Sundays
   - Check your email at that time

#### Option B: Manual Trigger in Firebase Console (Recommended for Testing)
1. **Go to Firebase Console:**
   - Navigate to: Functions → `sendWeeklySummaries`
   - Click "Test function"

2. **Trigger manually:**
   - Click "Test" button
   - Function will run immediately
   - Check logs for results

3. **Check Email:**
   - Should receive email: "📊 Your Week on Buzzwin"
   - Includes stats: rituals completed, impact moments, karma points, streaks

#### Option C: Use Firebase CLI
```bash
# Trigger the function manually
firebase functions:shell

# In the shell:
sendWeeklySummaries()
```

### Verify in Logs:
```bash
firebase functions:log --only sendWeeklySummaries
```

Look for:
- "Sending weekly summary to [email]"
- "Weekly summaries sent: X"

### Test Different Scenarios:
- ✅ User with activity → Should receive summary
- ✅ User with email preferences OFF → Should skip
- ✅ User with no activity → Should skip or show zeros

---

## 🔍 Monitoring & Debugging

### View All Function Logs:
```bash
# All functions
firebase functions:log

# Specific function
firebase functions:log --only notifyJoinedAction
firebase functions:log --only sendRitualReminders
firebase functions:log --only sendWeeklySummaries

# Last 50 lines
firebase functions:log --limit 50

# Follow logs in real-time
firebase functions:log --follow
```

### Check Function Status:
```bash
firebase functions:list
```

### View Function Details:
```bash
firebase functions:describe notifyJoinedAction
firebase functions:describe sendRitualReminders
firebase functions:describe sendWeeklySummaries
```

### Common Issues & Solutions:

#### ❌ "Email not sending"
1. **Check secrets:**
   ```bash
   firebase functions:secrets:access EMAIL_API
   firebase functions:secrets:access EMAIL_API_PASSWORD
   ```

2. **Check logs for errors:**
   ```bash
   firebase functions:log --only notifyJoinedAction
   ```

3. **Verify Gmail App Password:**
   - Ensure it's correct (16 characters, no spaces)
   - Check if 2-Step Verification is enabled

#### ❌ "User not receiving emails"
1. **Check email preferences:**
   - Go to `/settings`
   - Verify toggle is ON
   - Or check Firestore: `user_ritual_states/{userId}/emailPreferences`

2. **Check spam folder:**
   - Emails might be filtered

3. **Verify user email in Firestore:**
   - Check `users/{userId}/email` or `users/{userId}/emailAddress`

#### ❌ "Function not triggering"
1. **Check function is deployed:**
   ```bash
   firebase functions:list
   ```

2. **Check function status:**
   - Go to Firebase Console → Functions
   - Verify function is active (green status)

3. **Check triggers:**
   - `notifyJoinedAction`: Triggers on `impact_moments` document create
   - `sendRitualReminders`: Scheduled (daily 8 AM UTC)
   - `sendWeeklySummaries`: Scheduled (Sunday 6 PM UTC)

---

## 🧪 Quick Test Checklist

### Joined Action Email:
- [ ] Create impact moment as User A
- [ ] Join action as User B
- [ ] Check User A's email inbox
- [ ] Verify email content and links work
- [ ] Check logs for success

### Ritual Reminders:
- [ ] Set up user with rituals
- [ ] Enable email preferences
- [ ] Trigger function manually or wait for schedule
- [ ] Check email inbox
- [ ] Verify ritual details in email
- [ ] Check logs for success

### Weekly Summary:
- [ ] Create activity (moments, rituals, karma)
- [ ] Enable email preferences
- [ ] Trigger function manually or wait for Sunday
- [ ] Check email inbox
- [ ] Verify stats in email
- [ ] Check logs for success

---

## 📊 Testing in Firebase Console

### Manual Function Testing:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `blesswin-49a85`
3. Navigate to **Functions**
4. Click on the function you want to test
5. Click **"Test function"** tab
6. Click **"Test"** button
7. View results and logs

### View Function Logs in Console:
1. Go to **Functions** → **Logs**
2. Filter by function name
3. View real-time logs
4. Check for errors or success messages

---

## 🎯 Expected Email Content

### Joined Action Email:
- **Subject:** "🌱 [Joiner Name] joined your action on Buzzwin"
- **Content:** Joiner name, action preview, join count, link to chain page
- **CTA:** "See Who Joined" button → `/impact/{momentId}/chain`

### Ritual Reminder Email:
- **Subject:** "✨ [Ritual Title] - Your Daily Ritual"
- **Content:** Ritual title, description, tags, current streak
- **CTA:** "Complete Ritual" button → `/rituals`

### Weekly Summary Email:
- **Subject:** "📊 Your Week on Buzzwin - X Rituals, Y Moments"
- **Content:** Stats grid (rituals, moments, karma, streak), highlights
- **CTA:** "Continue Your Journey" button → `/home`

---

## 🔐 Security Notes

- **Never commit secrets to git** (they're in Firebase Secrets)
- **Test with real email addresses** you control
- **Check spam folders** if emails don't arrive
- **Monitor function costs** in Firebase Console
- **Set up alerts** for function errors

---

## 📝 Next Steps

After testing:
1. ✅ Verify all three functions work
2. ✅ Check email formatting and links
3. ✅ Test edge cases (no activity, disabled preferences)
4. ✅ Monitor logs for any errors
5. ✅ Set up error alerts in Firebase Console

---

## 🆘 Troubleshooting Commands

```bash
# Check function status
firebase functions:list

# View recent logs
firebase functions:log --limit 20

# Check specific function logs
firebase functions:log --only notifyJoinedAction

# Verify secrets
firebase functions:secrets:access EMAIL_API

# Redeploy if needed
npm run deploy:email-functions
```

---

## 📚 Related Documentation

- `EMAIL_DEPLOYMENT_COMPLETE.md` - Deployment guide
- `FIREBASE_EMAIL_SETUP.md` - Setup instructions
- `EMAIL_FEATURES_IMPLEMENTATION.md` - Feature documentation

