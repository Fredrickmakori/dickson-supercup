// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

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
 * Save a player as its own document in the 'players' collection
 */
export async function savePlayer(data) {
  try {
    let user = auth.currentUser;
    if (!user) {
      const result = await signInWithPopup(auth, googleProvider);
      user = result.user;
    }
    if (!user) throw new Error("Authentication required.");
    // Persist canonical user profile under users/{uid}
    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          email: user.email || null,
          displayName: user.displayName || data.fullName || null,
          role: data.role || "player",
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn("savePlayer: could not persist user profile", e);
    }

    const docRef = await addDoc(collection(db, "players"), {
      ...data,
      role: data.role || "player",
      userId: user.uid,
      createdAt: serverTimestamp(),
    });
    console.log("✅ Player saved with ID:", docRef.id);
    return docRef.id;
  } catch (err) {
    console.error("❌ Error saving player:", err);
    throw err;
  }
}

/**
 * Save a coach as its own document in the 'coaches' collection
 */
export async function saveCoach(data) {
  try {
    let user = auth.currentUser;
    if (!user) {
      const result = await signInWithPopup(auth, googleProvider);
      user = result.user;
    }
    if (!user) throw new Error("Authentication required.");
    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          email: user.email || null,
          displayName: user.displayName || data.fullName || null,
          role: data.role || "coach",
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn("saveCoach: could not persist user profile", e);
    }

    const docRef = await addDoc(collection(db, "coaches"), {
      ...data,
      role: data.role || "coach",
      userId: user.uid,
      createdAt: serverTimestamp(),
    });
    console.log("✅ Coach saved with ID:", docRef.id);
    return docRef.id;
  } catch (err) {
    console.error("❌ Error saving coach:", err);
    throw err;
  }
}

/**
 * Save a manager as its own document in the 'managers' collection
 */
export async function saveManager(data) {
  try {
    let user = auth.currentUser;
    if (!user) {
      const result = await signInWithPopup(auth, googleProvider);
      user = result.user;
    }
    if (!user) throw new Error("Authentication required.");
    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          email: user.email || null,
          displayName: user.displayName || data.fullName || null,
          role: data.role || "manager",
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn("saveManager: could not persist user profile", e);
    }

    const docRef = await addDoc(collection(db, "managers"), {
      ...data,
      role: data.role || "manager",
      userId: user.uid,
      createdAt: serverTimestamp(),
    });
    console.log("✅ Manager saved with ID:", docRef.id);
    return docRef.id;
  } catch (err) {
    console.error("❌ Error saving manager:", err);
    throw err;
  }
}

/**
 * Backwards-compatible saveRegistration entrypoint.
 * Accepts either (role, data) or (data) where data.role exists.
 */
export async function saveRegistration(role, data) {
  // Support calling saveRegistration(data) where data.role exists
  if (typeof role === "object") {
    data = role;
    role = data.role || "registration";
  }

  switch ((role || "").toString().toLowerCase()) {
    case "player":
      return savePlayer(data);
    case "coach":
      return saveCoach(data);
    case "manager":
      return saveManager(data);
    default:
      // Fallback: keep legacy behavior of storing in 'registrations'
      try {
        let user = auth.currentUser;
        if (!user) {
          const result = await signInWithPopup(auth, googleProvider);
          user = result.user;
        }
        if (!user) throw new Error("Authentication required.");
        try {
          await setDoc(
            doc(db, "users", user.uid),
            {
              uid: user.uid,
              email: user.email || null,
              displayName: user.displayName || data.fullName || null,
              role: role || null,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        } catch (e) {
          console.warn("saveRegistration: could not persist user profile", e);
        }

        const docRef = await addDoc(collection(db, "registrations"), {
          role,
          ...data,
          userId: user.uid,
          createdAt: serverTimestamp(),
        });
        console.log("✅ Registration saved with ID:", docRef.id);
        return docRef.id;
      } catch (err) {
        console.error("❌ Error saving registration:", err);
        throw err;
      }
  }
}

export { app, analytics, auth, googleProvider, db };
