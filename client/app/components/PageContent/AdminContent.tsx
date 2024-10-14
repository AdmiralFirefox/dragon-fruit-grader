"use client";

import { useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useAuthState } from "@/hooks/useAuthState";

const AdminContent = () => {
  const { initializing } = useAuthState();

  const user = useContext(AuthContext);
  const router = useRouter();

  // Restrict access
  useEffect(() => {
    const checkAdmin = async () => {
      if (!initializing) {
        if (user) {
          const token = await user.getIdTokenResult();

          if (!token.claims.admin) {
            router.push("/"); // Redirect if not admin
          } else {
            return; // Continue loading admin content
          }
        } else {
          router.push("/"); // Redirect if not authenticated
        }
      }
    };

    checkAdmin();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initializing, user]);

  if (initializing) {
    return (
      <div style={{ marginTop: "5em", textAlign: "center" }}>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <main style={{ marginTop: "4em" }}>
      <h1>Admin Page</h1>
    </main>
  );
};

export default AdminContent;
