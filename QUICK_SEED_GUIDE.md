# Quick Guide: Seeding Rituals

## 🚀 Fastest Method: Use Browser Console

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Log in to your app** (go to `http://localhost:3000`)

3. **Open browser console** (F12) and run:
   ```javascript
   fetch('/api/admin/seed-rituals', { method: 'POST' })
     .then(r => r.json())
     .then(data => {
       console.log('✅ Seeded!', data);
       console.log(`Added: ${data.added}, Skipped: ${data.skipped}, Total: ${data.total}`);
     });
   ```

That's it! The rituals will be seeded.

## 🔧 Alternative: Firebase Admin SDK (For Production)

If you need to seed from command line (e.g., for production):

1. **Get Firebase Service Account Key:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: **Buzzwin-49a85**
   - Go to **Project Settings** → **Service Accounts**
   - Click **Generate New Private Key**
   - Save as `firebase-admin-key.json` in project root

2. **Run the seed script:**
   ```bash
   npm run seed:rituals
   ```

## ✅ Verify It Worked

After seeding, check:

1. **Firestore Console:**
   - Go to Firebase Console → Firestore Database
   - Navigate to `rituals` collection
   - Should see 20 documents

2. **In Your App:**
   - Navigate to `/rituals` page
   - Should see rituals displayed

3. **Via API:**
   ```bash
   curl http://localhost:3000/api/rituals/today?userId=YOUR_USER_ID
   ```

## 🎯 What Gets Seeded?

- **20 ritual definitions** across 5 categories:
  - Mind (4 rituals)
  - Body (4 rituals)
  - Relationships (4 rituals)
  - Nature (4 rituals)
  - Community (4 rituals)

- **1 global ritual** (assigned to all users daily)
- **19 personalized rituals** (AI-selected based on preferences)

---

**Need help?** Check `SEEDING_RITUALS.md` for detailed troubleshooting.

