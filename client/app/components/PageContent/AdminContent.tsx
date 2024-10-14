"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "@/hooks/useAuthState";
import { auth } from "@/firebase/firebase";

const AdminContent = () => {
  const { initializing } = useAuthState();
  const router = useRouter();

  // Restrict access
  useEffect(() => {
    const checkAdmin = async () => {
      const currentUser = auth.currentUser;

      if (!initializing) {
        if (currentUser) {
          const token = await currentUser.getIdTokenResult();

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
  }, [initializing]);

  return (
    <main style={{ marginTop: "4em" }}>
      <h1>Admin Page</h1>
    </main>
  );
};

export default AdminContent;
