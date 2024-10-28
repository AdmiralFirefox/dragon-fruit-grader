import { motion, AnimatePresence } from "framer-motion";
import { useWindowSize } from "@/hooks/useWindowSize";
import CloseIcon from "../Icons/CloseIcon";
import GoogleIcon from "../Icons/GoogleIcon";
import styles from "@/styles/modals/SignInModal.module.scss";

interface SignInModalProps {
  signInModal: boolean;
  closeModal: () => void;
  signInWithgoogle: () => Promise<void>;
}

const SignInModal = ({
  signInModal,
  closeModal,
  signInWithgoogle,
}: SignInModalProps) => {
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
            <button
              className={styles["google-button"]}
              onClick={signInWithgoogle}
            >
              <p>Sign In</p>
              <GoogleIcon width="2.5em" height="2.5em" />
            </button>
            <p className={styles["disclaimer"]}>
              Disclaimer: We only use your information for sign-in. No
              additional data is collected or stored.
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default SignInModal;
