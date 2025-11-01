# Firebase Admin SDK Setup for Netlify

This guide explains how to configure Firebase Admin SDK to work on Netlify.

## Why It Works Locally But Not on Netlify

### ✅ Local Development

- Firebase CLI credentials (`firebase login`)
- Google Cloud CLI credentials (`gcloud auth`)
- Local service account JSON file
- Application Default Credentials (ADC)

### ❌ Netlify (Serverless)

- No local files
- No CLI tools
- **Only environment variables** are available

## Setup Instructions

### Step 1: Get Your Firebase Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **Service Accounts** tab
4. Click **Generate New Private Key**
5. Save the JSON file (keep it secure!)

### Step 2: Add Environment Variables to Netlify

Go to **Netlify Dashboard** → **Site Settings** → **Environment Variables**

#### Option A: Individual Variables (Recommended)

Add these three environment variables:

| Variable Name           | Value                                               | Example                                                      |
| ----------------------- | --------------------------------------------------- | ------------------------------------------------------------ |
| `FIREBASE_PROJECT_ID`   | Your Firebase project ID                            | `my-awesome-app`                                             |
| `FIREBASE_CLIENT_EMAIL` | From service account JSON                           | `firebase-adminsdk-xxxxx@project-id.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY`  | From service account JSON (the `private_key` field) | `-----BEGIN PRIVATE KEY-----\nMIIEvQI...`                    |

**Important for `FIREBASE_PRIVATE_KEY`:**

- Copy the entire `private_key` value from the JSON file
- Keep the `\n` characters as-is, or replace `\\n` with actual newlines
- The code automatically handles `\n` conversion: `.replace(/\\n/g, '\n')`

#### Option B: JSON String (Alternative)

Add a single environment variable:

| Variable Name                  | Value                                       |
| ------------------------------ | ------------------------------------------- |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | The entire service account JSON as a string |

**Note:** This requires minifying the JSON to a single line or escaping it properly.

### Step 3: Redeploy

After adding environment variables:

1. Go to **Deploys** tab in Netlify
2. Click **Trigger deploy** → **Deploy site**
3. Or push a new commit to trigger automatic deployment

## Verification

After deployment, check the function logs in Netlify. You should see:

```
✅ Firebase Admin SDK initialized with individual credentials
```

Or if using JSON:

```
✅ Firebase Admin SDK initialized with JSON credentials
```

If credentials are missing, you'll see:

```
⚠️ Firebase Admin SDK not initialized: Could not load the default credentials...
⚠️ To enable Admin SDK on Netlify, set environment variables...
```

## Troubleshooting

### Error: "Could not load the default credentials"

**Cause:** Environment variables not set or incorrect

**Solution:**

1. Verify all environment variables are set in Netlify
2. Check for typos in variable names
3. Ensure `FIREBASE_PRIVATE_KEY` includes the full key with `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`

### Error: "Invalid PEM format"

**Cause:** Private key format incorrect

**Solution:**

- The private key should start with `-----BEGIN PRIVATE KEY-----`
- Ensure newlines are preserved (code handles `\n` conversion automatically)
- Don't add extra quotes around the value

### Error: "401 Unauthorized"

**Cause:** Service account doesn't have proper permissions

**Solution:**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Go to **IAM & Admin** → **IAM**
3. Find your service account email
4. Ensure it has **Firebase Admin SDK Administrator Service Agent** role
   - Or at minimum: **Cloud Datastore User** and **Service Account User**

## Security Best Practices

⚠️ **Never commit service account credentials to Git!**

- Service account keys have full access to your Firebase project
- Always use environment variables
- The `.gitignore` file already excludes `.env` files
- Rotate keys if accidentally exposed

## What Happens If Admin SDK Isn't Configured?

The app will still work, but with limited functionality:

✅ **Still Works:**

- Client-side Firebase operations (auth, Firestore reads/writes via rules)
- Generating recommendations (Gemini API)
- All frontend features

⚠️ **Limited Features:**

- Saving recommendation history to Firestore
- Server-side filtering of dismissed recommendations
- Some server-side Admin SDK operations

The code gracefully handles missing Admin SDK and logs warnings instead of crashing.

## Environment Variable Priority

The initialization code tries credentials in this order:

1. **Individual variables** (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`)
2. **JSON string** (`FIREBASE_SERVICE_ACCOUNT_KEY`)
3. **Application Default Credentials** (works locally only)

Use Option 1 (individual variables) for best compatibility with Netlify.
