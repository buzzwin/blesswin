import * as admin from 'firebase-admin';
// Load environment variables from .env file for local development
// In production, these will come from Firebase Secrets
if (process.env.NODE_ENV !== 'production') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
  } catch {
    // dotenv not available or .env file doesn't exist - that's okay
    // Will use Firebase Secrets in production
  }
}

admin.initializeApp();

//export * from './normalize-stats';
export * from './notify-email';
export * from './functions/joined-action-notification';
export * from './functions/ritual-reminder';
export * from './functions/weekly-summary';
export * from './functions/send-invite-email';
