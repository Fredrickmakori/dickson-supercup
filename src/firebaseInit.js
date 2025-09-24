// Firebase initialization scaffold — uses the config provided by the project owner.
// This file only initializes the Firebase app when the SDK is available. You still
// need to run `npm install firebase` (or add the SDK) before runtime calls to
// `firebase/*` will work.

// Replace or confirm the config below if needed.
const firebaseConfig = {
  apiKey: "AIzaSyDxUmxNddhORb7cpJsIeYsJf2oN4rmmBSo",
  authDomain: "election-campaign-website.firebaseapp.com",
  projectId: "election-campaign-website",
  storageBucket: "election-campaign-website.firebasestorage.app",
  messagingSenderId: "649224701548",
  appId: "1:649224701548:web:36297224970bfb5b32ba49",
  measurementId: "G-KREK6RP5QG"
};

// Initialize Firebase if the SDK is present. This is defensive: the app can still
// run without the SDK (we use dynamic imports elsewhere), but once you `npm install firebase`
// this will initialize the default app and make storage/auth available.
export async function initFirebase(){
  try{
    const { initializeApp } = await import('firebase/app');
    const { getAnalytics } = await import('firebase/analytics');
    // initialize and return
    const app = initializeApp(firebaseConfig);
    try{ getAnalytics(app); }catch(e){}
    return app;
  }catch(err){
    // SDK not installed — caller should handle fallback
    // console.warn('Firebase SDK not available at runtime.');
    return null;
  }
}

// Call init at module load (non-blocking)
initFirebase().catch(()=>{});
