import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  // Use the existing Firebase config for development
  // In production, you should use service account credentials
  initializeApp({
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID
    // For development, we'll use the public config
    // In production, use service account credentials
  });
}

export const adminDb = getFirestore(); 