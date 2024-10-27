"use client";

import Image from "next/image";
import Link from "next/link";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import ResultIcon from "./Icons/ResultIcon";
import { useAuthState } from "@/hooks/useAuthState";
import useSignInModal from "@/hooks/useSignInModal";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import SignInModal from "./Modals/SignInModal";
import styles from "@/styles/Navbar.module.scss";

const Navbar = () => {
  const { initializing } = useAuthState();
  const { isAdmin } = useAdminStatus();
  const { signInModal, openModal, closeModal, signInWithgoogle } =
    useSignInModal();

  const user = useContext(AuthContext);

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
            <div className={styles["scale-up-loader"]}></div>
          ) : (
            <>
              {isAdmin ? (
                <Link
                  href="/admin/manage_users?page=1"
                  className={styles["admin-link"]}
                >
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
