import { useState } from "react";
import { useScrollLock } from "@/hooks/useScrollLock";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/firebase/firebase";

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
    } catch (err) {
      console.log(err);
      closeModal();
      alert(err);
    }
  };

  return { signInModal, openModal, closeModal, signInWithgoogle };
};

export default useSignInModal;
