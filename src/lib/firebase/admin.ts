import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
let adminDb: Firestore | null = null;

// Diagnostic: Log available environment variables (non-sensitive info only)
function logAdminSdkDiagnostics() {
  if (process.env.NODE_ENV === 'production') {
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY || process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY;
    
    const hasIndividual = !!(projectId && clientEmail && privateKey);
    const hasJson = !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY || !!process.env.NEXT_PUBLIC_FIREBASE_SERVICE_ACCOUNT_KEY;
    const hasPublicProjectId = !!process.env.NEXT_PUBLIC_PROJECT_ID;

    console.log('[Admin SDK Diagnostics]');
    console.log('  Project ID found:', !!projectId);
    console.log('  Client Email found:', !!clientEmail);
    console.log('  Private Key found:', !!privateKey);
    console.log('  Individual vars complete:', hasIndividual);
    console.log('  JSON var (FIREBASE_SERVICE_ACCOUNT_KEY or NEXT_PUBLIC_...):', hasJson);
    
    if (hasIndividual) {
      console.log('  Using Project ID:', projectId?.substring(0, 10) + '...');
      console.log('  Using Client Email:', clientEmail?.substring(0, 20) + '...');
      console.log('  Private Key format:', privateKey?.startsWith('-----') ? 'Valid (starts with -----)' : 'Invalid format');
    } else {
      console.log('  Missing vars:', {
        projectId: !projectId,
        clientEmail: !clientEmail,
        privateKey: !privateKey || !privateKey.startsWith('-----')
      });
    }
  }
}

try {
  logAdminSdkDiagnostics();

  if (!getApps().length) {
    // Option 1: Use individual environment variables (recommended for Netlify)
    // Supports both FIREBASE_* and NEXT_PUBLIC_FIREBASE_* naming conventions
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY || process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY;
    
    if (projectId && clientEmail && privateKey) {
      initializeApp({
        credential: cert({
          projectId: projectId,
          clientEmail: clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
      console.log('Firebase Admin SDK initialized with individual credentials');
    }
    // Option 2: Use JSON string (backward compatible)
    // Supports both FIREBASE_SERVICE_ACCOUNT_KEY and NEXT_PUBLIC_FIREBASE_SERVICE_ACCOUNT_KEY
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.NEXT_PUBLIC_FIREBASE_SERVICE_ACCOUNT_KEY) {
      const jsonKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.NEXT_PUBLIC_FIREBASE_SERVICE_ACCOUNT_KEY;
      const serviceAccount = JSON.parse(jsonKey as string);
      initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_PROJECT_ID || serviceAccount.project_id
      });
      console.log('Firebase Admin SDK initialized with JSON credentials');
    }
    // Option 3: Try Application Default Credentials (for local development with gcloud/Firebase CLI)
    else if (process.env.NEXT_PUBLIC_PROJECT_ID) {
      // This only works locally if you have gcloud/Firebase CLI credentials
      // Will fail on Netlify, but we handle it gracefully
      try {
        initializeApp({
          projectId: process.env.NEXT_PUBLIC_PROJECT_ID
        });
        console.log('Firebase Admin SDK initialized with Application Default Credentials (local only)');
      } catch (adcError) {
        // Application Default Credentials not available - this is expected on Netlify
        console.warn('Application Default Credentials not available (this is normal on Netlify)');
        throw adcError;
      }
    }
  }
  
  adminDb = getFirestore();
} catch (error) {
  // Admin SDK not available - this is OK, we'll handle it gracefully
  console.warn('Firebase Admin SDK not initialized:', error instanceof Error ? error.message : 'Unknown error');
  console.warn('To enable Admin SDK on Netlify, set environment variables:');
  console.warn('  - FIREBASE_PROJECT_ID');
  console.warn('  - FIREBASE_CLIENT_EMAIL');
  console.warn('  - FIREBASE_PRIVATE_KEY');
  console.warn('Or set FIREBASE_SERVICE_ACCOUNT_KEY with full JSON as string');
  adminDb = null;
}

export { adminDb }; 