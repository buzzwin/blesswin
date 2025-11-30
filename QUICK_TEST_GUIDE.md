# Quick Test Guide - Firebase Functions Emails

## ✅ Test Email Works!

The direct email test passed, so your email configuration is correct. Now let's test each Firebase Function.

---

## 🧪 Test 1: Joined Action Email (Easiest)

### Quick Test via UI:

1. **Log in as User A**
2. **Create an Impact Moment:**
   - Go to `/home`
   - Write: "I'm planting a tree today 🌱"
   - Post it
   - Copy the moment ID from URL (e.g., `/impact/[id]`)

3. **Log in as User B** (or use a different browser/incognito)
4. **Join the Action:**
   - Find User A's moment
   - Click "Joined You" ripple
   - Fill form and submit

5. **Check Email:**
   - Check User A's inbox (`link2sources@gmail.com`)
   - Look for: "🌱 [User B] joined your action"

### Check Logs:
```bash
firebase functions:log --only notifyJoinedAction | tail -20
```

**Expected:** Email sent successfully message

---

## 🧪 Test 2: Ritual Reminder Email

### Quick Test via Firebase Console:

1. **Go to:** [Firebase Console](https://console.firebase.google.com/)
2. **Navigate to:** Functions → `sendRitualReminders`
3. **Click:** "Test function" tab
4. **Click:** "Test" button
5. **Check Email:** Should receive ritual reminder

### Prerequisites:
- User must have rituals enabled
- User must have email preferences ON (check `/settings`)

### Check Logs:
```bash
firebase functions:log --only sendRitualReminders | tail -20
```

---

## 🧪 Test 3: Weekly Summary Email

### Quick Test via Firebase Console:

1. **Go to:** [Firebase Console](https://console.firebase.google.com/)
2. **Navigate to:** Functions → `sendWeeklySummaries`
3. **Click:** "Test function" tab
4. **Click:** "Test" button
5. **Check Email:** Should receive weekly summary

### Prerequisites:
- User must have some activity (rituals completed, moments created)
- User must have email preferences ON

### Check Logs:
```bash
firebase functions:log --only sendWeeklySummaries | tail -20
```

---

## 🔍 Quick Debugging

### If emails don't arrive:

1. **Check Function Logs:**
   ```bash
   firebase functions:log --only [function-name]
   ```

2. **Check Email Preferences:**
   - Go to `/settings`
   - Ensure toggles are ON
   - Or check Firestore: `user_ritual_states/{userId}/emailPreferences`

3. **Check User Email:**
   - For `notifyJoinedAction`: Email comes from Firebase Auth
   - For others: Email comes from Firestore `users/{userId}` document

4. **Check Spam Folder:**
   - Gmail may filter new senders

---

## 📊 Expected Results

### ✅ Success Indicators:

1. **Function Logs Show:**
   - "Email sent successfully"
   - No error messages

2. **Email Arrives:**
   - Within 1-2 minutes
   - Correct subject line
   - Proper content

3. **No Errors:**
   - Function executes without errors
   - User receives email

---

## 🎯 Testing Order

**Start with Test 1 (Joined Action)** - it's the easiest and doesn't require scheduled functions.

Then test Test 2 and Test 3 via Firebase Console manual triggers.

---

## 💡 Pro Tips

- **Use Real User Accounts:** Test with actual logged-in users
- **Check Both Inboxes:** Creator and joiner emails
- **Watch Logs:** Keep `firebase functions:log` open in another terminal
- **Test One at a Time:** Don't test all functions simultaneously
- **Check Spam:** Always check spam folder first

---

## 🆘 Still Not Working?

1. Verify secrets are set:
   ```bash
   firebase functions:secrets:access EMAIL_API
   firebase functions:secrets:access EMAIL_API_PASSWORD
   ```

2. Check function is deployed:
   ```bash
   firebase functions:list
   ```

3. Check function logs for specific errors:
   ```bash
   firebase functions:log --only notifyJoinedAction | grep -i error
   ```

4. Verify user has email in Firebase Auth or Firestore

