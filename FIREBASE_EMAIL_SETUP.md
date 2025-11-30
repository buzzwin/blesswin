# Firebase Email Setup Guide

## Setting Up Email Environment Variables

Your Firebase Functions are using the newer `defineString` approach (Firebase Functions v2+), which uses **Firebase Secrets** instead of the old config system.

### Option 1: Set Secrets via Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Functions** → **Secrets**
4. Click **Add Secret** and create:
   - `EMAIL_API` - Your Gmail address (e.g., `your-email@gmail.com`)
   - `EMAIL_API_PASSWORD` - Your Gmail App Password (see below)
   - `TARGET_EMAIL` - (Optional, for legacy notifications)

### Option 2: Set Secrets via Firebase CLI (⚠️ Not Available in CLI 9.2.0)

**Important:** Firebase CLI 9.2.0 does NOT support `functions:secrets:set` command.

**Please use Option 1 (Firebase Console) instead** - it's the recommended and working method.

If you upgrade to a newer Firebase CLI version in the future, you can try:

```bash
# These commands may not work in Firebase CLI 9.2.0
firebase functions:secrets:set EMAIL_API
firebase functions:secrets:set EMAIL_API_PASSWORD
firebase functions:secrets:set TARGET_EMAIL
```

**If you get "command not found" error, use Firebase Console (Option 1) instead.**

### Option 3: Set Secrets via Environment Variables (Local Development)

For local development/testing, you can set these in your `.env.local` file or export them:

```bash
export EMAIL_API="link2sources@gmail.com"
export EMAIL_API_PASSWORD="dyiq mkcl driu tmke"
export TARGET_EMAIL="link2sources@gmail.com"
```

## Gmail App Password Setup

Since you're using Gmail, you'll need to create an **App Password**:

1. Go to your [Google Account](https://myaccount.google.com/)
2. Navigate to **Security** → **2-Step Verification**
3. Scroll down to **App passwords**
4. Select **Mail** and **Other (Custom name)**
5. Enter "Buzzwin Email" as the name
6. Click **Generate**
7. Copy the 16-character password (use this as `EMAIL_API_PASSWORD`)

**Note:** Regular Gmail passwords won't work - you must use an App Password.

## Fixing Project ID Issue

If you're getting "Invalid project id" errors, check your `.firebaserc` file:

```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

The project ID must be:

- All lowercase
- Match your actual Firebase project ID
- You must have access to it

To find your correct project ID:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Check the project selector at the top
3. The project ID is shown there (it's usually lowercase)

## Verifying Setup

After setting secrets via Firebase Console:

1. **Check Firebase Console:**

   - Go to Functions → Configuration → Secrets
   - Verify your secrets are listed

2. **Deploy functions to test:**

   ```bash
   cd functions
   npm run build
   firebase deploy --only functions
   ```

3. **Check logs after deployment:**
   ```bash
   firebase functions:log
   ```

**Note:** The `firebase functions:secrets:access` command may not be available in Firebase CLI 9.2.0. Use the Console to verify instead.

## Testing Email Functions

1. **Test "Joined Action" email:**

   - Create an impact moment
   - Have another user join it
   - Check the original creator's email

2. **Test Ritual Reminder:**

   - Wait for scheduled time (8 AM UTC daily)
   - Or trigger manually via Firebase Console

3. **Test Weekly Summary:**
   - Wait for Sunday 6 PM UTC
   - Or trigger manually via Firebase Console

## Troubleshooting

### "Invalid project id" Error

- Check `.firebaserc` has correct lowercase project ID
- Verify you're logged in: `firebase login:list`
- Try: `firebase use --add` to select project

### "Permission denied" Error

- Make sure you're logged in: `firebase login`
- Verify you have access to the project
- Check Firebase Console permissions

### Email Not Sending

- Verify secrets are set correctly
- Check Firebase Functions logs: `firebase functions:log`
- Verify Gmail App Password is correct
- Check spam folder

### Functions Not Deploying

- Make sure `functions/package.json` has correct dependencies
- Run `npm install` in `functions` directory
- Check TypeScript compilation: `cd functions && npm run build`

## Next Steps

1. Set up Gmail App Password
2. Set Firebase secrets (via Console or CLI)
3. Deploy functions: `firebase deploy --only functions`
4. Test email notifications
5. Monitor logs for any issues
