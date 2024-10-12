"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import ResultIcon from "./Icons/ResultIcon";
import { useScrollLock } from "@/hooks/useScrollLock";
import SignInModal from "./Modals/SignInModal";
import styles from "@/styles/modals/Navbar.module.scss";

const Navbar = () => {
  const [signInModal, setSignInModal] = useState(false);
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

        {!user ? (
          <button onClick={openModal}>Sign In</button>
        ) : (
          <Link href="/save_results?page=1">
            <ResultIcon width="2.8em" height="2.8em" />
          </Link>
        )}
      </header>

      <SignInModal signInModal={signInModal} closeModal={closeModal} />
    </>
  );
};

export default Navbar;
