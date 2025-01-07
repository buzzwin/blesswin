# 🎬 Buzzwin - Social Movie & TV Show Tracking Platform

Buzzwin is an open-source social platform that lets users track, review, and discuss movies and TV shows with friends and communities.

## ✨ Features

- 🎯 Track movies and TV shows you're watching
- ⭐ Share reviews and ratings
- 👥 Create and join watch clubs
- 📝 Curate personal watchlists
- 🤝 Follow friends and see their activity
- 🌙 Dark/Light mode support
- 🔐 Secure authentication with Google & Email
- 📱 Responsive design for all devices

## 🚀 Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Auth)
- **APIs**: TMDB API for movie/TV show data
- **Animation**: Framer Motion
- **State Management**: React Context
- **UI Components**: Headless UI

## 🛠️ Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/buzzwin.git
cd buzzwin
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with your API keys:

```env
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
NEXT_PUBLIC_TMDB_ACCESS_TOKEN=your_tmdb_access_token
OPENAI_KEY=your_openai_key
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
```

## 🔑 Environment Variables

- `NEXT_PUBLIC_TMDB_API_KEY`: TMDB API key for movie/TV show data
- `NEXT_PUBLIC_TMDB_ACCESS_TOKEN`: TMDB access token
- `OPENAI_KEY`: OpenAI key

## 🔧 Development

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/buzzwin.git
   cd buzzwin
   ```

2. Install dependencies

   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a Firebase project and select the web app

4. Add your Firebase config to `.env.development`. Note that `NEXT_PUBLIC_MEASUREMENT_ID` is optional

5. Make sure you have enabled the following Firebase services:

   - Authentication. Enable the Google sign-in method.
   - Cloud Firestore. Create a database and set its location to your nearest region.
   - Cloud Storage. Create a storage bucket.

6. Install Firebase CLI globally

   ```bash
   npm i -g firebase-tools
   ```

7. Log in to Firebase

   ```bash
   firebase login
   ```

8. Get your project ID

   ```bash
   firebase projects:list
   ```

9. Select your project ID

   ```bash
   firebase use your-project-id
   ```

10. Deploy Firestore rules, Firestore indexes, and Cloud Storage rules

    ```bash
    firebase deploy --except functions
    ```

11. Run the project

    ```bash
    npm run dev
    ```

> **_Note_**: When you deploy Firestore indexes rules, it might take a few minutes to complete. So before the indexes are enabled, you will get an error when you fetch the data from Firestore.<br><br>You can check the status of your Firestore indexes with the link below, replace `your-project-id` with your project ID: https://console.firebase.google.com/u/0/project/your-project-id/firestore/indexes

Optional:

- If you want to get trending data from Twitter API, you need to create a Twitter developer account and get your API keys. Then add your API keys to `.env.development`. I hope Elon Musk doesn't make this API paid 😅.
- If you want to make the user stats synced with the deleted tweets, you need to enable the Cloud Functions for Firebase. Then deploy the Cloud Functions.
