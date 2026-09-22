import type { Database } from "firebase/database";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * databaseURL is the only field the Realtime Database client strictly needs, so
 * it doubles as the flag for "is this deployment wired to Firebase yet".
 */
export const isFirebaseConfigured = Boolean(config.databaseURL && config.apiKey);

let dbPromise: Promise<Database> | null = null;

export function getDb(): Promise<Database> {
  if (!isFirebaseConfigured) {
    return Promise.reject(new Error("Firebase is not configured"));
  }
  if (!dbPromise) {
    dbPromise = (async () => {
      const [{ initializeApp, getApps, getApp }, { getDatabase }] = await Promise.all([
        import("firebase/app"),
        import("firebase/database"),
      ]);
      const app = getApps().length ? getApp() : initializeApp(config);
      return getDatabase(app);
    })();
  }
  return dbPromise;
}
