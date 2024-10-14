"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useContext } from "react";
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
      const result = await signInWithPopup(auth, provider);

      // Get ID token of signed-in user
      const user = result.user;
      const token = await user.getIdToken();

      await fetch("/api/auth/set-custom-claims", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      closeModal();
    } catch (err) {
      console.log(err);
      closeModal();
      alert(err);
    }
  };

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

        {initializing ? (
          <p>Loading...</p>
        ) : (
          <>
            {!user ? (
              <button onClick={openModal}>Sign In</button>
            ) : (
              <Link href="/save_results?page=1">
                <ResultIcon width="2.8em" height="2.8em" />
              </Link>
            )}
          </>
        )}
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
