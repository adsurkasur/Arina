import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// GOOGLE_APPLICATION_CREDENTIALS environment variable should be set.
// This will be loaded from .env in development (via dotenv in index.ts)
// and set directly in the production environment.
try {
  admin.initializeApp();
  console.log('Firebase Admin SDK initialized successfully.');
} catch (error) {
  console.error('Firebase Admin SDK initialization error:', error);
  // Depending on the severity, you might want to exit the process
  // process.exit(1);
}

export const auth = admin.auth();
export const db = admin.firestore(); // If you plan to use Firestore via Admin SDK
// export const storage = admin.storage(); // If you plan to use Storage via Admin SDK

export default admin;
