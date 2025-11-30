# Test All Firebase Functions Emails - Step by Step

## ✅ Prerequisites

- ✅ Direct email test passed (you confirmed this!)
- ✅ All 3 functions are deployed:
  - `notifyJoinedAction` ✅
  - `sendRitualReminders` ✅
  - `sendWeeklySummaries` ✅

---

## 🧪 TEST 1: Joined Action Email (`notifyJoinedAction`)

### What it does:
Sends email when someone joins an impact moment.

### How to Test:

#### Step 1: Create an Impact Moment
1. **Log in** to your app (as User A)
2. Go to `/home`
3. Create an impact moment: "I'm planting a tree today 🌱"
4. **Note the moment ID** from the URL (e.g., `/impact/abc123`)

#### Step 2: Join the Action
1. **Log in as a different user** (User B) - or use incognito/another browser
2. Find User A's moment in the feed
3. Click the **"Joined You"** ripple option
4. Fill out the form and submit

#### Step 3: Check Email
- **Check User A's inbox** (`link2sources@gmail.com`)
- **Subject:** "🌱 [User B] joined your action on Buzzwin"
- **Should arrive within 1-2 minutes**

#### Step 4: Check Logs
```bash
firebase functions:log --only notifyJoinedAction | tail -30
```

**Look for:**
- ✅ "Checking if this is a joined action..."
- ✅ "Joined action email sent to [email]"
- ✅ No error messages

---

## 🧪 TEST 2: Ritual Reminder Email (`sendRitualReminders`)

### What it does:
Sends daily ritual reminder emails at 8 AM UTC.

### How to Test:

#### Method 1: Manual Trigger (Recommended)

1. **Go to Firebase Console:**
   - Navigate to: https://console.firebase.google.com/
   - Select your project: `blesswin-49a85`
   - Go to: **Functions** → `sendRitualReminders`

2. **Test Function:**
   - Click **"Test function"** tab
   - Click **"Test"** button
   - Function runs immediately

3. **Check Email:**
   - Should receive: "✨ [Ritual Title] - Your Daily Ritual"
   - Includes ritual details, tags, and streak info

#### Prerequisites:
- ✅ User must have rituals enabled (`/rituals` page)
- ✅ User must have email preferences ON (`/settings` → Email Notifications)
- ✅ User must have at least one ritual assigned

#### Check Logs:
```bash
firebase functions:log --only sendRitualReminders | tail -30
```

**Look for:**
- ✅ "Starting ritual reminder job..."
- ✅ "Ritual reminder sent to [email]"
- ✅ "Ritual reminders sent: X"

---

## 🧪 TEST 3: Weekly Summary Email (`sendWeeklySummaries`)

### What it does:
Sends weekly progress summary emails every Sunday at 6 PM UTC.

### How to Test:

#### Method 1: Manual Trigger (Recommended)

1. **Go to Firebase Console:**
   - Navigate to: https://console.firebase.google.com/
   - Select your project: `blesswin-49a85`
   - Go to: **Functions** → `sendWeeklySummaries`

2. **Test Function:**
   - Click **"Test function"** tab
   - Click **"Test"** button
   - Function runs immediately

3. **Check Email:**
   - Should receive: "📊 Your Week on Buzzwin"
   - Includes stats: rituals, moments, karma, streaks

#### Prerequisites:
- ✅ User must have some activity:
  - Completed rituals
  - Created impact moments
  - Earned karma points
- ✅ User must have email preferences ON (`/settings` → Email Notifications)

#### Check Logs:
```bash
firebase functions:log --only sendWeeklySummaries | tail -30
```

**Look for:**
- ✅ "Starting weekly summary email job..."
- ✅ "Weekly summary sent to [email]"
- ✅ "Weekly summary job completed. Sent: X"

---

## 🔍 Important Notes

### Email Source:
All functions get email from **Firebase Auth**, not Firestore. Make sure:
- User is logged in with email/password or email-linked account
- Email is verified in Firebase Auth

### Email Preferences:
Functions check `user_ritual_states/{userId}/emailPreferences`:
- `joinedAction` - for joined action emails
- `ritualReminders` - for ritual reminders
- `weeklySummary` - for weekly summaries

**Default:** All enabled if not set (undefined = enabled)

### If Email Doesn't Arrive:

1. **Check Spam Folder** - Gmail filters new senders
2. **Check Function Logs** - Look for errors
3. **Verify Email in Firebase Auth:**
   ```bash
   # In Firebase Console → Authentication → Users
   # Check user has email address
   ```
4. **Check Email Preferences:**
   - Go to `/settings`
   - Ensure toggles are ON
   - Or check Firestore: `user_ritual_states/{userId}`

---

## 📊 Testing Checklist

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

### "No email found for user"
- **Fix:** Ensure user has email in Firebase Auth
- **Check:** Firebase Console → Authentication → Users

### "User has disabled [type] emails"
- **Fix:** Go to `/settings` and enable email preferences
- **Or:** Set `emailPreferences.[type] = true` in Firestore

### Function not triggering
- **For `notifyJoinedAction`:** Check document has `joinedFromMomentId` field
- **For scheduled functions:** Use manual trigger in Console

### Email sent but not received
- Check spam folder
- Wait 1-2 minutes
- Verify email address is correct
- Check function logs for errors

---

## 🎯 Quick Commands

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

### Follow Logs in Real-Time:
```bash
firebase functions:log --follow
```

---

## 📝 Expected Email Content

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

## ✅ Success Indicators

When everything works:
1. ✅ Function logs show "Email sent successfully"
2. ✅ Email arrives in inbox within 1-2 minutes
3. ✅ Email has correct subject and content
4. ✅ No errors in function logs

---

## 🚀 Start Testing!

**Recommended order:**
1. **Test 1** (Joined Action) - Easiest, just create and join
2. **Test 2** (Ritual Reminder) - Requires rituals setup
3. **Test 3** (Weekly Summary) - Requires activity data

Good luck! 🎉

