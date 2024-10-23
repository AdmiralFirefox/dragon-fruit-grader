"use client";

import Image from "next/image";
import { useState, useEffect, useContext, FormEvent } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { useAuthState } from "@/hooks/useAuthState";
import { AdminContentProps, UserInfo } from "@/types/AdminTypes";
import AdminNavbar from "../AdminNavbar";
import PaginationControls from "../PaginationControls";
import { truncateText } from "@/utils/truncateText";
import ClipboardIcon from "../Icons/ClipboardIcon";
import styles from "@/styles/Admin.module.scss";

const AdminContent = ({
  searchParams,
  signOutUser,
  disableUser,
  deleteUser,
}: AdminContentProps) => {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);

  const { initializing } = useAuthState();
  const imageSize = 53;

  const user = useContext(AuthContext);
  const router = useRouter();

  //Create a fuse instance
  const fuse = new Fuse(users, {
    keys: ["displayName", "uid", "email"],
    includeScore: true,
    threshold: 0.3,
  });

  //Create a Search Result
  const results = fuse.search(searchUser);

  //Map the search result
  const filteredUsers =
    searchUser === "" ? users : results.map((result) => result.item);

  // Define Parameters for Pagination
  const contents_per_page = "10";

  const page = searchParams["page"] ?? "1";
  const per_page = searchParams["per_page"] ?? contents_per_page;

  const start = (Number(page) - 1) * Number(per_page);
  const end = start + Number(per_page);

  // Slice the data
  const users_data = filteredUsers !== undefined ? filteredUsers : [];
  const entries = users_data.slice(start, end);

  // Handle Search
  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchUser(searchInput);
    router.push("/admin?page=1");
  };

  // Copy User ID
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied UID");
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  // Sign Out User
  const handleSignOut = async (uid: string) => {
    const token = await user!.getIdToken();

    if (token) {
      try {
        await signOutUser(token, uid);
        alert("User will be signed out");
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Disable User
  const handleDisable = async (uid: string, disabled: boolean) => {
    const token = await user!.getIdToken();

    if (token) {
      try {
        await disableUser(token, uid, disabled);

        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.uid === uid ? { ...user, disabled } : user
          )
        );

        if (disabled) {
          alert("User is disabled");
        } else {
          alert("User is enabled");
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Delete User
  const handleDelete = async (uid: string) => {
    const token = await user!.getIdToken();

    if (token) {
      try {
        await deleteUser(token, uid);
        setUsers((prevUsers) => prevUsers.filter((user) => user.uid !== uid));
      } catch (error) {
        console.log(error);
      }
    }
  };

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
          setLoadingUsers(false);
          alert("Access denied");
          return;
        }

        const users_data = await res.json();
        setUsers(users_data);
        setLoadingUsers(false);
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
            setLoadingUsers(true); // Continue loading admin content
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
    <main>
      <AdminNavbar />
      {users.length === 0 && loadingUsers ? (
        <h1 style={{ textAlign: "center", marginTop: "1em" }}>
          Loading data...
        </h1>
      ) : (
        <>
          <form
            className={styles["search-wrapper"]}
            onSubmit={handleSearchSubmit}
          >
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit">Submit</button>
          </form>

          <div className={styles["user-info"]}>
            <table>
              <thead>
                <tr>
                  <th>User Photo</th>
                  <th>User ID</th>
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
                {entries
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
                      <td>
                        {truncateText(user.uid, 10)}
                        <button
                          className={styles["copy"]}
                          onClick={() => handleCopy(user.uid)}
                        >
                          <ClipboardIcon width="1.8em" height="1.8em" />
                        </button>
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
                {entries
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
                      <td>
                        {truncateText(user.uid, 10)}
                        <button
                          className={styles["copy"]}
                          onClick={() => handleCopy(user.uid)}
                        >
                          <ClipboardIcon width="1.8em" height="1.8em" />
                        </button>
                      </td>
                      <td>{user.displayName}</td>
                      <td>{user.email}</td>
                      <td>User</td>
                      <td>
                        <button onClick={() => handleSignOut(user.uid)}>
                          Sign Out
                        </button>
                      </td>
                      <td>
                        <button
                          onClick={() =>
                            handleDisable(user.uid, !user.disabled)
                          }
                        >
                          {user.disabled ? "Enable" : "Disable"}
                        </button>
                      </td>
                      <td>
                        <button onClick={() => handleDelete(user.uid)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {users_data.length <= 0 || users_data.length <= 9 ? null : (
            <PaginationControls
              routeName="admin"
              contentsPerPage={contents_per_page}
              hasNextPage={end < users_data!.length}
              hasPrevPage={start > 0}
              dataLength={users_data.length}
            />
          )}
        </>
      )}
    </main>
  );
};

export default AdminContent;
