"use client";

import Image from "next/image";
import { useState, useEffect, useContext, FormEvent } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { useAuthState } from "@/hooks/useAuthState";
import {
  AdminContentProps,
  UserInfo,
  LoadingAdminFunctions,
} from "@/types/AdminTypes";
import AdminNavbar from "../AdminNavbar";
import PaginationControls from "../PaginationControls";
import { truncateText } from "@/utils/truncateText";
import ClipboardIcon from "../Icons/ClipboardIcon";
import LoadingAdmin from "../States/LoadingAdmin";
import SyncLoader from "../Loaders/SyncLoader";
import { toast, Bounce } from "react-toastify";
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

  // Admin functions loadings state
  const [loadingSignOut, setLoadingSignOut] = useState<LoadingAdminFunctions>(
    {}
  );
  const [loadingDisable, setLoadingDisable] = useState<LoadingAdminFunctions>(
    {}
  );
  const [loadingDelete, setLoadingDelete] = useState<LoadingAdminFunctions>({});

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

  const pageParam = searchParams["page"];
  const perPageParam = searchParams["per_page"] ?? contents_per_page;

  const page = Array.isArray(pageParam)
    ? Number(pageParam[0])
    : Number(pageParam ?? "1");
  const per_page = Array.isArray(perPageParam)
    ? Number(perPageParam[0])
    : Number(perPageParam);

  // Calculate the total number of pages
  const totalPages = Math.ceil(users.length / per_page);

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
      toast.info("Copied User ID", {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    } catch (err) {
      console.error("Failed to copy text:", err);
      toast.error((err as Error).message || "An unknown error occurred", {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    }
  };

  // Sign Out User
  const handleSignOut = async (uid: string) => {
    setLoadingSignOut((prevStates) => ({ ...prevStates, [uid]: true }));
    const token = await user!.getIdToken();

    if (token) {
      try {
        await signOutUser(token, uid);
        toast.error("User will be Signed Out", {
          position: "top-center",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
      } catch (error) {
        console.log(error);
        toast.error((error as Error).message || "An unknown error occurred", {
          position: "top-center",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
      }
    }

    setLoadingSignOut((prevStates) => ({ ...prevStates, [uid]: false }));
  };

  // Disable User
  const handleDisable = async (uid: string, disabled: boolean) => {
    setLoadingDisable((prevStates) => ({ ...prevStates, [uid]: true }));
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
          toast.error("User is disabled", {
            position: "top-center",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Bounce,
          });
        } else {
          toast.info("User is enabled", {
            position: "top-center",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Bounce,
          });
        }
      } catch (error) {
        console.log(error);
        toast.error((error as Error).message || "An unknown error occurred", {
          position: "top-center",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
      }
    }

    setLoadingDisable((prevStates) => ({ ...prevStates, [uid]: false }));
  };

  // Delete User
  const handleDelete = async (uid: string) => {
    setLoadingDelete((prevStates) => ({ ...prevStates, [uid]: true }));
    const token = await user!.getIdToken();

    if (token) {
      try {
        await deleteUser(token, uid);
        setUsers((prevUsers) => prevUsers.filter((user) => user.uid !== uid));
        toast.error("User has been deleted", {
          position: "top-center",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
      } catch (error) {
        console.log(error);
        toast.error((error as Error).message || "An unknown error occurred", {
          position: "top-center",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
      }
    }
  };

  // Redirect if the page number is out of range
  useEffect(() => {
    const isValidNumber = !isNaN(page) && Number.isInteger(page);

    if (!isValidNumber) {
      router.push(`/admin?page=1`);
    } else if (page > totalPages && totalPages > 0) {
      router.push(`/admin?page=1`);
    } else if (page < 1) {
      router.push(`/admin?page=1`);
    }
  }, [page, totalPages, router]);

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

  return (
    <main>
      <AdminNavbar />
      {users.length === 0 && loadingUsers ? (
        <LoadingAdmin message="Loading Users" />
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
                        {loadingSignOut[user.uid] ? (
                          <button className={styles["loading-button"]}>
                            <SyncLoader width="2.5em" />
                          </button>
                        ) : (
                          <button onClick={() => handleSignOut(user.uid)}>
                            Sign Out
                          </button>
                        )}
                      </td>
                      <td>
                        {loadingDisable[user.uid] ? (
                          <button className={styles["loading-button"]}>
                            <SyncLoader width="2.5em" />
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleDisable(user.uid, !user.disabled)
                            }
                          >
                            {user.disabled ? "Enable" : "Disable"}
                          </button>
                        )}
                      </td>
                      <td>
                        {loadingDelete[user.uid] ? (
                          <button className={styles["loading-button"]}>
                            <SyncLoader width="2.5em" />
                          </button>
                        ) : (
                          <button onClick={() => handleDelete(user.uid)}>
                            Delete
                          </button>
                        )}
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
