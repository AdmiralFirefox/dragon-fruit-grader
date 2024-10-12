import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useWindowSize } from "@/hooks/useWindowSize";
import CloseIcon from "../Icons/CloseIcon";
import styles from "@/styles/SignInModal.module.scss";

interface SignInModalProps {
  signInModal: boolean;
  closeModal: () => void;
}

const SignInModal = ({ signInModal, closeModal }: SignInModalProps) => {
  const { height: windowHeight } = useWindowSize();

  const variants = {
    initial: { opacity: 0, top: "30%", transform: "translate(-50%, -50%)" },
    animate: { opacity: 1, top: "30%", transform: "translate(-50%, -30%)" },
    exit: { opacity: 0, top: "30%", transform: "translate(-50%, -50%)" },
  };

  const backdrop_variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <>
      <AnimatePresence>
        {signInModal ? (
          <motion.div
            className={styles["backdrop"]}
            style={{ height: windowHeight }}
            onClick={closeModal}
            key="sign-in-backdrop"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={backdrop_variants}
            transition={{ duration: 0.25, ease: "linear" }}
          ></motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {signInModal ? (
          <motion.div
            className={styles["modal"]}
            style={{ maxHeight: `calc(${windowHeight}px - 10vh)` }}
            key="sign-in-modal"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.25, ease: "linear" }}
          >
            <button className={styles["close-button"]} onClick={closeModal}>
              <CloseIcon width="35" height="35" />
            </button>
            <h1>Sign In</h1>
            <p>Sign in to save your grading results.</p>
            <button className={styles["google-button"]}>
              <p>Sign In</p>
              <Image
                src="/logos/google.png"
                alt="Googl Logo"
                width={35}
                height={35}
              />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default SignInModal;
