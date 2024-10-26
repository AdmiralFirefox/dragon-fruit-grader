"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { User } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import { onAuthStateChanged, getIdTokenResult } from "firebase/auth";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        // Get ID token and set it in a cookie
        const tokenResult = await getIdTokenResult(firebaseUser);

        // Send token to API route to set it as a cookie server-side
        await fetch("/api/auth/set-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: tokenResult.token }),
        });

        // Set a timer to refresh the token before it expires
        const expirationTime = new Date(tokenResult.expirationTime).getTime();
        const currentTime = new Date().getTime();
        const timeToExpire = expirationTime - currentTime;

        // Refresh the token 5 minutes (300000 ms) before it expires
        const refreshTimeout = Math.max(timeToExpire - 300000, 0);

        const refreshTimer = setTimeout(async () => {
          const newTokenResult = await getIdTokenResult(firebaseUser);
          await fetch("/api/auth/set-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: newTokenResult.token }),
          });
        }, refreshTimeout);

        return () => clearTimeout(refreshTimer); // Clear the timer on unmount
      } else {
        setUser(null);
        await fetch("/api/auth/remove-token", { method: "POST" });
        router.push("/");
      }
    });

    return unsubscribe;
  }, [router]);

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
};
