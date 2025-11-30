import { defineString } from 'firebase-functions/params';

// Support both Firebase Secrets (production) and environment variables (local/testing)
// For local development, set these in functions/.env file
// For production, set them as Firebase Secrets in Firebase Console

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
