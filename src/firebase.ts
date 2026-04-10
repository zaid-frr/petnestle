import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const useFirebaseEmulators =
  import.meta.env.DEV && String(import.meta.env.VITE_USE_FIREBASE_EMULATORS || '').toLowerCase() === 'true';

if (useFirebaseEmulators) {
  // Auth emulator allows registering/logging in with any email/password in local dev.
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}
