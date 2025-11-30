const config = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID
} as const;

type Config = typeof config;

export function getFirebaseConfig(): Config {
  // Check if any required values are missing
  const missingValues = Object.entries(config)
    .filter(([key, value]) => !value)
    .map(([key]) => key);
  
  if (missingValues.length > 0) {
    const errorMessage = `Firebase config is incomplete. Missing: ${missingValues.join(', ')}. ` +
      `Please set these environment variables in .env.local: ${missingValues.map(k => `NEXT_PUBLIC_${k.toUpperCase()}`).join(', ')}`;
    throw new Error(errorMessage);
  }

  return config;
}
