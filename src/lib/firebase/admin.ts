/**
 * Firebase Admin SDK Configuration
 * Server-side Firebase initialization for API routes and server components
 */

import * as admin from "firebase-admin";

let adminApp;

try {
  // Check if Firebase Admin is already initialized
  if (!admin.apps.length) {
    // Initialize with service account from environment
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    };

    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as any),
      projectId: process.env.FIREBASE_PROJECT_ID,
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
    });

    console.log("✅ Firebase Admin SDK initialized");
  } else {
    adminApp = admin.app();
  }
} catch (error) {
  console.error("❌ Firebase Admin SDK initialization failed:", error);
  console.warn(
    "⚠️  Make sure Firebase credentials are set in environment variables"
  );
}

// Get instances
export const firebaseAdmin = adminApp;
export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export const adminStorage = admin.storage();

export default {
  app: adminApp,
  db: adminDb,
  auth: adminAuth,
  storage: adminStorage,
};
