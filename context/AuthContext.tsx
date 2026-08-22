"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isGuestMode: boolean;
  activeUserId: string;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  enableGuestMode: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isGuestMode: false,
  activeUserId: "guest",
  signInWithGoogle: async () => {},
  signOutUser: async () => {},
  enableGuestMode: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("steam_vault_guest_mode") === "true";
    }
    return false;
  });

  useEffect(() => {
    if (!auth || !isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsGuestMode(false);
        if (typeof window !== "undefined") {
          localStorage.removeItem("steam_vault_guest_mode");
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!auth || !isFirebaseConfigured) {
      console.warn("Firebase Auth is not configured");
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
      setIsGuestMode(false);
      if (typeof window !== "undefined") {
        localStorage.removeItem("steam_vault_guest_mode");
      }
    } catch (error) {
      console.error("Google sign in error:", error);
      throw error;
    }
  };

  const signOutUser = async () => {
    if (auth) {
      await firebaseSignOut(auth);
    }
    setUser(null);
    setIsGuestMode(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("steam_vault_guest_mode");
    }
  };

  const enableGuestMode = () => {
    setIsGuestMode(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("steam_vault_guest_mode", "true");
    }
  };

  const activeUserId = user ? user.uid : isGuestMode ? "guest" : "guest";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isGuestMode,
        activeUserId,
        signInWithGoogle,
        signOutUser,
        enableGuestMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
