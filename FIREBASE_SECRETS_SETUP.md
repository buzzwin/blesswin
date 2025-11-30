# Firebase Secrets Setup Guide

## Important: Firebase Functions v2 Secrets

Your code uses `defineString` from `firebase-functions/params`, which is Firebase Functions v2. The way to set these secrets depends on your Firebase CLI version.

## Method 1: Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Functions** → **Configuration** → **Secrets** tab
4. Click **Add Secret** and create:
   - `EMAIL_API` - Your Gmail address (e.g., `link2sources@gmail.com`)
   - `EMAIL_API_PASSWORD` - Your Gmail App Password
   - `TARGET_EMAIL` - Target email (optional, for legacy notifications)

## Method 2: Environment Variables During Deployment

You can set secrets as environment variables when deploying:

```bash
# Set environment variables
export EMAIL_API="link2sources@gmail.com"
export EMAIL_API_PASSWORD="your-app-password"
export TARGET_EMAIL="link2sources@gmail.com"

# Deploy functions
firebase deploy --only functions
```

## Method 3: Using Firebase CLI (if available)

If your Firebase CLI version supports it, you can try:

```bash
# For newer Firebase CLI versions
firebase functions:secrets:set EMAIL_API
firebase functions:secrets:set EMAIL_API_PASSWORD
firebase functions:secrets:set TARGET_EMAIL
```

**Note:** This command may not be available in Firebase CLI 9.2.0. Use Method 1 (Console) instead.

## Method 4: Update Code to Use Runtime Config (Alternative)

If secrets don't work, you can modify the code to use Firebase Runtime Config instead:

### Update `functions/src/lib/env.ts`:

```typescript
import { defineString } from 'firebase-functions/params';

// Try to get from environment first, then use defineString
const EMAIL_API = defineString('EMAIL_API', {
  default: process.env.EMAIL_API || ''
});

const EMAIL_API_PASSWORD = defineString('EMAIL_API_PASSWORD', {
  default: process.env.EMAIL_API_PASSWORD || ''
});

const TARGET_EMAIL = defineString('TARGET_EMAIL', {
  default: process.env.TARGET_EMAIL || ''
});

export { EMAIL_API, EMAIL_API_PASSWORD, TARGET_EMAIL };
```

Then set environment variables before deployment.

## Recommended Approach

**For Firebase CLI 9.2.0, use Method 1 (Firebase Console):**

1. Set secrets via Firebase Console
2. Deploy functions normally
3. Secrets will be automatically available to your functions

## Verifying Secrets Are Set

After setting secrets, you can verify by:

1. **Check Firebase Console:**
   - Go to Functions → Configuration → Secrets
   - You should see your secrets listed

2. **Test Function:**
   - Deploy a test function that logs the secret value
   - Check Firebase Functions logs: `firebase functions:log`

3. **Check Function Configuration:**
   ```bash
   firebase functions:config:get
   ```
   (Note: This shows runtime config, not secrets)

## Troubleshooting

### "Secret not found" Error
- Make sure secrets are set in Firebase Console
- Verify secret names match exactly (case-sensitive)
- Redeploy functions after setting secrets

### "Permission denied" Error
- Make sure you have Firebase Admin permissions
- Check Firebase Console permissions

### Secrets Not Working
- Try redeploying functions after setting secrets
- Check Firebase Functions logs for errors
- Verify secret names match in code and console

## Next Steps

1. Set secrets via Firebase Console (Method 1)
2. Deploy functions: `npm run deploy:email-functions`
3. Test by creating a joined action
4. Check logs: `firebase functions:log`

