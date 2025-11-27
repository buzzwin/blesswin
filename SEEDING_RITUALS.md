# Seeding Rituals Collection - Guide

This guide explains how to populate the Firestore `rituals` collection with ritual definitions.

## 📋 Overview

The Daily Rituals system requires ritual definitions to be stored in Firestore. This can be done using:

1. **Node.js Script** (Recommended) - Uses Firebase Admin SDK
2. **API Endpoint** - Uses client SDK (requires authentication)

## 🚀 Method 1: Node.js Script (Recommended)

### Prerequisites

1. **Firebase Admin Credentials:**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file as `firebase-admin-key.json` in the project root
   - **OR** set environment variables:
     - `GOOGLE_APPLICATION_CREDENTIALS` (path to service account JSON)

### Run the Script

```bash
npm run seed:rituals
```

Or directly:
```bash
node scripts/seed-rituals.js
```

### What It Does

- ✅ Checks for existing rituals (won't duplicate)
- ✅ Adds all 20 ritual definitions from `ritual-definitions-data.js`
- ✅ Sets `createdAt`, `usageCount: 0`, `completionRate: 0`
- ✅ Shows progress and summary

### Expected Output

```
🌱 Starting ritual seeding...

✅ Added "Take 5 Deep Breaths"
✅ Added "Write One Gratitude"
...
✨ Successfully seeded 20 rituals!

📊 Total rituals in collection: 20
   - Global: 1
   - Personalized: 19

🏷️  Breakdown by tag:
   - mind: 4
   - body: 4
   - relationships: 4
   - nature: 4
   - community: 4

🎉 Seeding complete!
```

## 🌐 Method 2: API Endpoint (Alternative)

### Prerequisites

- User must be authenticated
- Admin permissions (if required by your security rules)

### Run via API

```bash
curl -X POST http://localhost:3000/api/admin/seed-rituals \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Or use the browser console:
```javascript
fetch('/api/admin/seed-rituals', { method: 'POST' })
  .then(r => r.json())
  .then(console.log);
```

### Response

```json
{
  "success": true,
  "added": 20,
  "skipped": 0,
  "total": 20
}
```

## 📊 Ritual Definitions

The seed script includes **20 ritual definitions** across 5 categories:

- **Mind** (4 rituals): Breathing, gratitude, meditation, reflection
- **Body** (4 rituals): Stretching, hydration, walking, cooking
- **Relationships** (4 rituals): Texting, calling, thank you notes, quality time
- **Nature** (4 rituals): Sky gazing, plant care, trash pickup, outdoor time
- **Community** (4 rituals): Smiling, door holding, donations, volunteering

### Scope Distribution

- **Global**: 1 ritual (assigned to all users daily)
- **Personalized**: 19 rituals (AI-selected based on user preferences)

## 🔍 Verification

After seeding, verify the data:

1. **Check Firestore Console:**
   - Go to Firebase Console → Firestore Database
   - Navigate to `rituals` collection
   - Should see 20 documents

2. **Check via API:**
   ```bash
   curl http://localhost:3000/api/rituals/today?userId=YOUR_USER_ID
   ```

3. **Check in App:**
   - Navigate to `/rituals` page
   - Should see rituals displayed

## 🔄 Re-seeding

The script is **idempotent** - it won't create duplicates:

- ✅ Checks for existing rituals by title
- ✅ Skips rituals that already exist
- ✅ Only adds new rituals

To re-seed everything:
1. Delete existing rituals from Firestore Console
2. Run the seed script again

## 🛠️ Troubleshooting

### Error: "Firebase Admin SDK not initialized"

**Solution:**
- Ensure `firebase-admin-key.json` exists in project root
- Or set `GOOGLE_APPLICATION_CREDENTIALS` environment variable
- Check that the service account has Firestore permissions

### Error: "Missing or insufficient permissions"

**Solution:**
- Check Firestore security rules allow admin writes
- Verify service account has proper IAM roles
- Ensure `rituals` collection rules allow creation

### Script runs but no rituals appear

**Solution:**
- Check Firestore Console for errors
- Verify network connectivity
- Check script output for errors
- Ensure Firestore is enabled in Firebase Console

## 📝 Notes

- Rituals are **read-only** for regular users (public read)
- Only admins can create/update/delete (via Admin SDK)
- The seed script uses Firebase Admin SDK to bypass security rules
- Ritual definitions are also available in code at `src/lib/data/ritual-definitions.ts`

## ✅ Success Checklist

- [ ] Firebase Admin credentials configured
- [ ] Seed script runs without errors
- [ ] 20 rituals appear in Firestore Console
- [ ] Rituals display on `/rituals` page
- [ ] Today's rituals API returns data
- [ ] Personalization works (after user completes rituals)

## 🎯 Next Steps

After seeding:
1. Test the `/rituals` page
2. Complete a few rituals
3. Check stats calculation
4. Verify personalization works
5. Test Impact Moment sharing from rituals

---

**Need Help?** Check the main `README.md` or open an issue.

