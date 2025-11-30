# Email Features Implementation - Priority 1

## Overview
This document outlines the implementation of Priority 1 email features using nodemailer and Firebase Cloud Functions.

## ✅ Completed Features

### 1. "Someone Joined Your Action" Notifications
**Status:** ✅ Implemented

**Location:**
- Cloud Function: `functions/src/functions/joined-action-notification.ts`
- Email Template: `functions/src/emails/joined-action.ts`

**How it works:**
- Triggers when a new Impact Moment is created with `joinedFromMomentId`
- Fetches the original moment creator's email from Firebase Auth
- Checks email preferences from `user_ritual_states` collection
- Sends beautifully formatted HTML email with:
  - Joiner's name and username
  - Original action preview
  - Join count
  - Link to chain page

**Email Preferences:**
- Controlled by `emailPreferences.joinedAction` in `user_ritual_states`
- Defaults to `true` (enabled) if not set
- Can be disabled in Ritual Settings UI

### 2. Daily Ritual Reminder Emails
**Status:** ✅ Implemented

**Location:**
- Cloud Function: `functions/src/functions/ritual-reminder.ts`
- Email Template: `functions/src/emails/ritual-reminder.ts`

**How it works:**
- Scheduled function runs daily at 8 AM UTC
- Checks all users with `enabled: true` in `user_ritual_states`
- Respects user's `morningTime` and `eveningTime` preferences
- Respects quiet hours settings
- Checks `emailPreferences.ritualReminders` preference
- Sends email with:
  - Today's ritual title and description
  - Ritual tags
  - Current streak (if > 0)
  - Link to rituals page

**Email Preferences:**
- Controlled by `emailPreferences.ritualReminders` in `user_ritual_states`
- Defaults to `true` (enabled) if not set
- Can be disabled in Ritual Settings UI

### 3. Weekly Progress Summary
**Status:** ✅ Implemented

**Location:**
- Cloud Function: `functions/src/functions/weekly-summary.ts`
- Email Template: `functions/src/emails/weekly-summary.ts`

**How it works:**
- Scheduled function runs every Sunday at 6 PM UTC
- Calculates weekly stats:
  - Rituals completed
  - Impact moments created
  - Karma points earned
  - Actions joined
  - People who joined user's actions
- Only sends if user has activity
- Checks `emailPreferences.weeklySummary` preference

**Email Preferences:**
- Controlled by `emailPreferences.weeklySummary` in `user_ritual_states`
- Defaults to `true` (enabled) if not set
- Can be disabled in Ritual Settings UI

## 🎨 UI Components

### Email Preferences Settings
**Location:** `src/components/rituals/ritual-settings.tsx`

**Features:**
- Toggle switches for each email type:
  - ✅ Someone Joined Your Action
  - ✅ Daily Ritual Reminders
  - ✅ Weekly Progress Summary
- Integrated into existing Ritual Settings modal
- Saves preferences to `user_ritual_states.emailPreferences`

## 📧 Email Infrastructure

### Email Client Setup
**Location:** `functions/src/lib/email.ts`

**Features:**
- Nodemailer configured with Gmail
- Reusable email client singleton
- Beautiful HTML email templates with:
  - Gradient header (purple to pink)
  - Responsive design
  - CTA buttons
  - Footer with unsubscribe link

### Email Template Helper
**Function:** `getEmailTemplate(content, ctaText?, ctaUrl?)`

**Features:**
- Consistent branding
- Mobile-responsive
- Includes unsubscribe link
- Customizable CTA button

## 🔧 Configuration

### Environment Variables (Firebase Functions)
Required in Firebase Functions config:
- `EMAIL_API` - Gmail address
- `EMAIL_API_PASSWORD` - Gmail app password
- `TARGET_EMAIL` - (Legacy, for old tweet notifications)

### Data Structure

**User Ritual State:**
```typescript
{
  emailPreferences?: {
    joinedAction?: boolean;      // Default: true
    ritualReminders?: boolean;   // Default: true
    weeklySummary?: boolean;     // Default: true
  }
}
```

## 🚀 Deployment Steps

1. **Set Environment Variables:**
   ```bash
   firebase functions:config:set email_api="your-email@gmail.com"
   firebase functions:config:set email_api_password="your-app-password"
   ```

2. **Deploy Cloud Functions:**
   ```bash
   cd functions
   npm run build
   firebase deploy --only functions
   ```

3. **Verify Functions:**
   - Check Firebase Console > Functions
   - Verify scheduled functions are active
   - Test by creating a joined action

## 📝 Testing Checklist

- [ ] Test "Joined Action" email by creating a joined moment
- [ ] Test ritual reminder email (wait for scheduled time or trigger manually)
- [ ] Test weekly summary email (wait for Sunday 6 PM UTC or trigger manually)
- [ ] Test email preferences toggle in UI
- [ ] Verify emails respect quiet hours
- [ ] Verify emails respect user time preferences
- [ ] Test unsubscribe flow (future enhancement)

## 🔮 Future Enhancements

### Priority 2 Features (Not Yet Implemented)
- Comment notifications
- Ripple reaction notifications
- Milestone celebration emails
- Welcome email series
- Re-engagement emails

### Technical Improvements
- Email analytics (open rates, click rates)
- Batch notifications (daily digest option)
- Email verification before sending
- Better error handling and retry logic
- A/B testing for email content

## 📚 Related Files

**Cloud Functions:**
- `functions/src/functions/joined-action-notification.ts`
- `functions/src/functions/ritual-reminder.ts`
- `functions/src/functions/weekly-summary.ts`

**Email Templates:**
- `functions/src/emails/joined-action.ts`
- `functions/src/emails/ritual-reminder.ts`
- `functions/src/emails/weekly-summary.ts`

**Frontend:**
- `src/components/rituals/ritual-settings.tsx`
- `src/pages/api/rituals/settings.ts`
- `src/lib/types/user.ts`
- `src/lib/types/ritual.ts`

## 🐛 Known Issues

None currently. Report any issues in the project issue tracker.

## 📞 Support

For questions or issues, refer to:
- Firebase Functions logs: `firebase functions:log`
- Email delivery issues: Check Gmail app password configuration
- User preferences: Check `user_ritual_states` collection in Firestore

