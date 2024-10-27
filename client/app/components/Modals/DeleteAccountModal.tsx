import { motion, AnimatePresence } from "framer-motion";
import { useWindowSize } from "@/hooks/useWindowSize";
import SyncLoader from "../Loaders/SyncLoader";
import styles from "@/styles/modals/DeleteAccountModal.module.scss";

interface DeleteAccountModalProps {
  deleteAccountModal: boolean;
  deleteLoading: boolean;
  closeDeleteAccountModal: () => void;
  handleDeleteAccount: () => Promise<void>;
}

const DeleteAccountModal = ({
  deleteAccountModal,
  deleteLoading,
  closeDeleteAccountModal,
  handleDeleteAccount,
}: DeleteAccountModalProps) => {
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
        {deleteAccountModal ? (
          <motion.div
            className={styles["backdrop"]}
            style={{ height: windowHeight }}
            onClick={closeDeleteAccountModal}
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
        {deleteAccountModal ? (
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
            <p className={styles["message"]}>
              Are you sure you want to delete your account? Your data will be
              lost.
            </p>
            <div className={styles["button-wrapper"]}>
              {deleteLoading ? (
                <button className={styles["loading-button"]}>
                  <SyncLoader width="2.2em" />
                </button>
              ) : (
                <button onClick={handleDeleteAccount}>Delete</button>
              )}

              <button onClick={closeDeleteAccountModal}>Cancel</button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default DeleteAccountModal;
