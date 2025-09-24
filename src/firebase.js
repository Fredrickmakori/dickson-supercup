// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDxUmxNddhORb7cpJsIeYsJf2oN4rmmBSo",
  authDomain: "election-campaign-website.firebaseapp.com",
  projectId: "election-campaign-website",
  storageBucket: "election-campaign-website.firebasestorage.app",
  messagingSenderId: "649224701548",
  appId: "1:649224701548:web:36297224970bfb5b32ba49",
  measurementId: "G-KREK6RP5QG",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let analytics;
try {
  analytics = getAnalytics(app);
} catch (e) {
  // analytics may fail in dev/SSR
}

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

/**
 * Save registration to Firestore
 */
export async function saveRegistration(role, data) {
  try {
    let user = auth.currentUser;

    if (!user) {
      const result = await signInWithPopup(auth, googleProvider);
      user = result.user;
    }

    if (!user) throw new Error("Authentication required.");

    const docRef = await addDoc(collection(db, "registrations"), {
      role,
      ...data,
      userId: user.uid,
      createdAt: new Date(),
    });

    console.log("✅ Registration saved with ID:", docRef.id);
    return docRef.id;
  } catch (err) {
    console.error("❌ Error saving registration:", err);
    throw err;
  }
}

export { app, analytics, auth, googleProvider, db };
