"use client";

import Image from "next/image";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import { useAuthState } from "@/hooks/useAuthState";
import styles from "@/styles/Admin.module.scss";

const AdminContent = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { initializing } = useAuthState();
  const imageSize = 53;

  const user = useContext(AuthContext);
  const router = useRouter();

  // Fetch list of users
  useEffect(() => {
    const fetchUsers = async () => {
      if (user) {
        const token = await user.getIdToken(); // Get the auth token

        const res = await fetch("/api/admin/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 403) {
          alert("Access denied");
          return;
        }

        const users_data = await res.json();
        setUsers(users_data);
      }
    };

    fetchUsers();
  }, [user]);

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
      <div className={styles["user-info"]}>
        <table>
          <thead>
            <tr>
              <th>User Photo</th>
              <th>Display Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Sign Out</th>
              <th>Disable</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {/* Admin */}
            {users
              .filter((currentUser) => currentUser.uid === user!.uid)
              .map((user) => (
                <tr key={user.uid}>
                  <td>
                    <Image
                      src={user.photoURL as string}
                      alt="User Photo"
                      width={imageSize}
                      height={imageSize}
                    />
                  </td>
                  <td>{user.displayName}</td>
                  <td>{user.email}</td>
                  <td>Admin</td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              ))}
            {/* User */}
            {users
              .filter((currentUser) => currentUser.uid !== user!.uid)
              .map((user) => (
                <tr key={user.uid}>
                  <td>
                    <Image
                      src={user.photoURL as string}
                      alt="User Photo"
                      width={imageSize}
                      height={imageSize}
                    />
                  </td>
                  <td>{user.displayName}</td>
                  <td>{user.email}</td>
                  <td>User</td>
                  <td>
                    <button>Sign Out</button>
                  </td>
                  <td>
                    <button>Disable</button>
                  </td>
                  <td>
                    <button>Delete</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default AdminContent;
