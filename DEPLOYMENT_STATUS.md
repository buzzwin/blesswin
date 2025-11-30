# Email Functions Deployment Status

## ✅ Completed Setup

### 1. Configuration Files Created
- ✅ `functions/.env` - Contains email credentials for local testing
- ✅ `functions/.env.example` - Template for other developers
- ✅ Updated `functions/src/lib/env.ts` - Supports both .env (local) and Firebase Secrets (production)
- ✅ Updated `functions/src/index.ts` - Loads dotenv for local development
- ✅ Added `dotenv` package to `functions/package.json`

### 2. Code Updates
- ✅ Fixed TypeScript errors (removed unused imports)
- ✅ Updated Node.js engine to 14 (for Firebase CLI compatibility)
- ✅ Email functions are ready to deploy

### 3. Deployment Scripts
- ✅ `scripts/deploy-email-functions.sh` - Bash deployment script
- ✅ `scripts/deploy-email-functions.js` - Node.js deployment script
- ✅ Added npm scripts: `deploy:email-functions` and `deploy:email-functions:js`

## ⚠️ Current Issue

**Project ID Problem:**
- Current project ID in `.firebaserc`: `buzzwin-49a85`
- Error: "Project 'buzzwin-49a85' not found or permission denied"

## 🔧 Next Steps to Deploy

### Step 1: Fix Project ID

1. **Find your correct Firebase project ID:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Check the project selector at the top
   - Note the exact project ID (should be lowercase)

2. **Update `.firebaserc`:**
   ```json
   {
     "projects": {
       "default": "your-actual-project-id"
     }
   }
   ```

3. **Verify project access:**
   ```bash
   firebase projects:list
   ```

### Step 2: Set Firebase Secrets (Production)

Since Firebase CLI 9.2.0 doesn't support `functions:secrets:set`, use Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Functions** → **Configuration** → **Secrets** tab
4. Click **Add Secret** and create:
   - `EMAIL_API` = `link2sources@gmail.com`
   - `EMAIL_API_PASSWORD` = Your Gmail App Password (16 characters)
   - `TARGET_EMAIL` = `link2sources@gmail.com`

### Step 3: Deploy Functions

Once project ID is fixed and secrets are set:

```bash
# Deploy email functions
npm run deploy:email-functions

# Or with auto-confirm
NON_INTERACTIVE=true npm run deploy:email-functions
```

## 📝 Current Configuration

### Local Testing (.env file)
Located at: `functions/.env`
```
EMAIL_API=link2sources@gmail.com
EMAIL_API_PASSWORD=dyiq mkcl driu tmke
TARGET_EMAIL=link2sources@gmail.com
```

### Production (Firebase Secrets)
Set via Firebase Console:
- `EMAIL_API`
- `EMAIL_API_PASSWORD`
- `TARGET_EMAIL`

## 🧪 Testing After Deployment

1. **Test "Joined Action" email:**
   - Create an impact moment
   - Have another user join it
   - Check original creator's email inbox

2. **Test Ritual Reminder:**
   - Wait for scheduled time (8 AM UTC daily)
   - Or trigger manually in Firebase Console

3. **Test Weekly Summary:**
   - Wait for Sunday 6 PM UTC
   - Or trigger manually in Firebase Console

## 📊 Deployment Checklist

- [ ] Fix Firebase project ID in `.firebaserc`
- [ ] Verify Firebase project access
- [ ] Set secrets in Firebase Console
- [ ] Deploy functions: `npm run deploy:email-functions`
- [ ] Verify deployment in Firebase Console
- [ ] Test email notifications
- [ ] Check Firebase Functions logs: `firebase functions:log`

## 🔍 Troubleshooting

### "Project not found" Error
- Verify project ID in Firebase Console
- Check `.firebaserc` has correct lowercase project ID
- Ensure you're logged in: `firebase login`
- Verify project permissions

### "Permission denied" Error
- Check Firebase Console permissions
- Ensure you have Firebase Admin/Editor role
- Try: `firebase login --reauth`

### Functions Not Deploying
- Check Firebase CLI version: `firebase --version`
- Update if needed: `npm install -g firebase-tools@latest`
- Verify Node.js version compatibility

## 📚 Related Files

- `functions/.env` - Local credentials (gitignored)
- `functions/.env.example` - Template file
- `functions/src/lib/env.ts` - Environment variable handling
- `scripts/deploy-email-functions.sh` - Deployment script
- `FIREBASE_EMAIL_SETUP.md` - Setup guide
- `EMAIL_FEATURES_IMPLEMENTATION.md` - Feature documentation

