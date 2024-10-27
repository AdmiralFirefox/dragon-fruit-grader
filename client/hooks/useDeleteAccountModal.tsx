import { useState, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useScrollLock } from "@/hooks/useScrollLock";
import {
  deleteUser,
  GoogleAuthProvider,
  reauthenticateWithPopup,
} from "firebase/auth";
import { FirebaseError } from "@firebase/util";
import { db } from "@/firebase/firebase";
import { toast, Bounce } from "react-toastify";
import { addDoc, collection } from "firebase/firestore";

export const useDeleteAccountModal = () => {
  const user = useContext(AuthContext);
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const router = useRouter();

  const { lock, unlock } = useScrollLock({
    autoLock: false,
    lockTarget: "#scrollable",
  });

  const openDeleteAccountModal = () => {
    lock();
    setDeleteAccountModal(true);
  };

  const closeDeleteAccountModal = () => {
    unlock();
    setDeleteAccountModal(false);
  };

  const handleDeleteAccount = async () => {
    if (!user) {
      toast.error("User is not signed in", {
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

    setDeleteLoading(true);

    try {
      // Add to blacklist collection
      const blacklistRef = collection(db, "blacklist");
      await addDoc(blacklistRef, {
        uid: user!.uid,
        disabledAt: new Date(),
      });

      // Delete User
      await deleteUser(user!);

      router.push("/");
      toast.success("Account Deleted Successfully", {
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
      setDeleteLoading(false);
    } catch (error) {
      if ((error as FirebaseError).code === "auth/requires-recent-login") {
        const provider = new GoogleAuthProvider();

        try {
          await reauthenticateWithPopup(user!, provider);

          // Add to blacklist collection
          const blacklistRef = collection(db, "blacklist");
          await addDoc(blacklistRef, {
            uid: user!.uid,
            disabledAt: new Date(),
          });

          // Delete User
          await deleteUser(user!);

          router.push("/");
          toast.success("Account Deleted Successfully", {
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
          setDeleteLoading(false);
        } catch (reauthError) {
          console.error("Re-authentication failed:", reauthError);
          toast.error("Re-authentication failed. Please try again.", {
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
          setDeleteLoading(false);
        }
      } else {
        console.error("Error deleting account:", error);
        toast.error("Error deleting account. Please try again.", {
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
        setDeleteLoading(false);
      }
    }
  };

  return {
    deleteAccountModal,
    deleteLoading,
    handleDeleteAccount,
    openDeleteAccountModal,
    closeDeleteAccountModal,
  };
};
