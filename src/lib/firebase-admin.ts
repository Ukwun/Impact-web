import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin/lib/app/credential';

// Initialize Firebase Admin SDK
export function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // Build service account from environment variables
  const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID || 'impactknowledge-ab14f',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
  };

  if (!serviceAccount.clientEmail || !serviceAccount.privateKey) {
    console.warn(
      '⚠️ Firebase Admin SDK not fully configured. Using Auth without user profiles.'
    );
  }

  try {
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as any),
      projectId: process.env.FIREBASE_PROJECT_ID || 'impactknowledge-ab14f',
    });
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', (error as Error).message);
    // Return a partially configured app for development
    return admin.app();
  }
}

export function getFirebaseAuth() {
  initializeFirebaseAdmin();
  return admin.auth();
}

export function getFirestore() {
  initializeFirebaseAdmin();
  return admin.firestore();
}

export default admin;
