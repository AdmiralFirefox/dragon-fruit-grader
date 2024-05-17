import { useWindowSize } from "@/hooks/useWindowSize";
import { motion, AnimatePresence } from "framer-motion";
import styles from "@/styles/InfoModal.module.scss";

interface InfoModalProps {
  active: boolean;
  closeModal: (id: string) => void;
  products: string[];
  grading_result: string;
  id: string;
}

const InfoModal = ({
  active,
  closeModal,
  products,
  grading_result,
  id,
}: InfoModalProps) => {
  const { height = 0 } = useWindowSize();

  const variants = {
    initial: { opacity: 0, top: "20%", transform: "translate(-50%, -50%)" },
    animate: { opacity: 1, top: "25%", transform: "translate(-50%, -25%)" },
    exit: { opacity: 0, top: "20%", transform: "translate(-50%, -50%)" },
  };

  const backdrop_variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <>
      <AnimatePresence>
        {active ? (
          <motion.div
            key={`backdrop-animate-${id}`}
            onClick={() => closeModal(id)}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={backdrop_variants}
            transition={{ duration: 0.25, ease: "linear" }}
            className={styles["backdrop"]}
            style={{ height: `${height}px` }}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {active ? (
          <motion.div
            key={`modal-animate-${id}`}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.25, ease: "linear" }}
            className={styles["modal-wrapper"]}
          >
            <div
              className={styles["modal-content"]}
              style={{ maxHeight: `${height}px` }}
            >
              <div>
                <h1>Grading Result: {grading_result}</h1>
                <h1>Suggestions:</h1>
                {products.map((product, index) => (
                  <p key={index}>{product}</p>
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default InfoModal;
