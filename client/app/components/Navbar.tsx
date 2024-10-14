"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import ResultIcon from "./Icons/ResultIcon";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useAuthState } from "@/hooks/useAuthState";
import SignInModal from "./Modals/SignInModal";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import styles from "@/styles/Navbar.module.scss";

const Navbar = () => {
  const [signInModal, setSignInModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { initializing } = useAuthState();

  const user = useContext(AuthContext);

  const { lock, unlock } = useScrollLock({
    autoLock: false,
    lockTarget: "#scrollable",
  });

  const openModal = () => {
    lock();
    setSignInModal(true);
  };

  const closeModal = () => {
    unlock();
    setSignInModal(false);
  };

  //Sign In with Google
  const signInWithgoogle = async () => {
    const provider = new GoogleAuthProvider();
    auth.useDeviceLanguage();

    try {
      const userCreds = await signInWithPopup(auth, provider);
      const idToken = await userCreds.user.getIdToken();

      await fetch("/api/auth/set-custom-claims", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      closeModal();
    } catch (err) {
      console.log(err);
      closeModal();
      alert(err);
    }
  };

  // Check if user has admin privileges
  useEffect(() => {
    const checkAdmin = async () => {
      const currentUser = auth.currentUser;

      if (currentUser) {
        const token = await currentUser.getIdTokenResult();

        if (!token.claims.admin) {
          setIsAdmin(false);
        } else {
          setIsAdmin(true);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, [user]);

  return (
    <>
      <header className={styles["navbar"]}>
        <Link href="/" className={styles["web-title"]}>
          <div className={styles["web-logo"]}>
            <Image
              src="/logos/web-logo.png"
              alt="Web Logo"
              width={100}
              height={100}
            />
          </div>
          <h1>Dragon Fruit Grader</h1>
        </Link>

        <div className={styles["page-links"]}>
          {initializing ? (
            <p>Loading...</p>
          ) : (
            <>
              {isAdmin ? (
                <Link href="/admin" className={styles["admin-link"]}>
                  Admin
                </Link>
              ) : null}

              {!user ? (
                <button onClick={openModal}>Sign In</button>
              ) : (
                <Link href="/save_results?page=1">
                  <ResultIcon width="2.8em" height="2.8em" />
                </Link>
              )}
            </>
          )}
        </div>
      </header>

      {!user ? (
        <SignInModal
          signInModal={signInModal}
          closeModal={closeModal}
          signInWithgoogle={signInWithgoogle}
        />
      ) : null}
    </>
  );
};

export default Navbar;
