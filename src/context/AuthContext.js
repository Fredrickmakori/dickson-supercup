import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider, db } from "../firebase";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await fetchUserRole(u.uid);
      } else {
        setRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // 🔹 Fetch role from Firestore
  const fetchUserRole = async (uid) => {
    try {
      const ref = doc(db, "roles", uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setRole(snap.data().role);
      } else {
        setRole("guest"); // default role
      }
    } catch (err) {
      console.error("Error fetching role:", err);
    }
  };

  // 🔹 Set role in Firestore
  const setRoleForUser = async (uid, role) => {
    if (!uid) return;
    try {
      await setDoc(doc(db, "roles", uid), { role }, { merge: true });
      setRole(role);
    } catch (err) {
      console.error("Error saving role:", err);
    }
  };

  // 🔹 Auth functions
  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user || null);

      if (result.user) {
        await fetchUserRole(result.user.uid);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email, password, displayName = "") => {
    setLoading(true);
    setError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      if (displayName) {
        await updateProfile(result.user, { displayName });
      }

      setUser(result.user || null);
      await setRoleForUser(result.user.uid, "team"); // default role
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      setUser(result.user || null);
      await fetchUserRole(result.user.uid);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
  };

  // 🔹 Role helpers
  const isAdmin = role === "admin";
  const isTeam = role === "team";
  const isCoach = role === "coach";
  const isGuest = role === "guest";

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        error,
        signInWithGoogle,
        signOutUser,
        signUpWithEmail,
        signInWithEmail,
        setRoleForUser,
        redirectPath,
        setRedirectPath,
        isAdmin,
        isTeam,
        isCoach,
        isGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
