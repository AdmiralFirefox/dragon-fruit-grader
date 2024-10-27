import { useState } from "react";
import { useScrollLock } from "@/hooks/useScrollLock";
import { FirebaseError } from "@firebase/util";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import { toast, Bounce } from "react-toastify";

const useSignInModal = () => {
  const [signInModal, setSignInModal] = useState(false);

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
      toast.success("Signed In Successfully", {
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
      if ((err as FirebaseError).code === "auth/user-disabled") {
        console.log(err);
        closeModal();
        toast.error("Your account has been disabled", {
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
        console.log(err);
        closeModal();
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
    }
  };

  return { signInModal, openModal, closeModal, signInWithgoogle };
};

export default useSignInModal;
