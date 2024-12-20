import { useState, ChangeEvent } from "react";
import { useWindowSize } from "@/hooks/useWindowSize";
import { motion, AnimatePresence } from "framer-motion";
import DonutChart from "../Charts/DonutChart";
import CloseIcon from "../Icons/CloseIcon";
import styles from "@/styles/modals/InfoModal.module.scss";

interface InfoModalProps {
  active: boolean;
  closeModal: (id: string) => void;
  products: string[];
  id: string;
  probabilities: {
    id: string;
    class: string;
    probability: number;
  }[];
}

const InfoModal = ({
  active,
  closeModal,
  products,
  id,
  probabilities,
}: InfoModalProps) => {
  const [showGraphs, setShowGraphs] = useState(false);
  const { height = 0 } = useWindowSize();

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    setShowGraphs(event.target.checked);
  };

  const variants = {
    initial: { opacity: 0, top: "20%", transform: "translate(-50%, -50%)" },
    animate: { opacity: 1, top: "20%", transform: "translate(-50%, -20%)" },
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
              style={{ maxHeight: `calc(${height}px - 3em)` }}
            >
              <div className={styles["close-button"]}>
                <button onClick={() => closeModal(id)}>
                  <CloseIcon width="35" height="35" />
                </button>
              </div>
              
              <div className={styles["products-content"]}>
                <p className={styles["products-title"]}>Products:</p>
                <ul
                  className={
                    products.length <= 1
                      ? styles["products-none"]
                      : styles["products"]
                  }
                >
                  {products.map((product, index) => (
                    <li key={index + 1}>{product}</li>
                  ))}
                </ul>
              </div>

              <div className={styles["advanced-results-input"]}>
                <input
                  type="checkbox"
                  checked={showGraphs}
                  onChange={handleCheckboxChange}
                />
                <p>Show Advanced Results</p>
              </div>

              {showGraphs ? (
                <div className={styles["chart-content"]}>
                  {probabilities.map((result) => (
                    <div key={result.id} className={styles["content"]}>
                      <p className={styles["class-result"]}>{result.class}</p>
                      <div className={styles["chart-container"]}>
                        <DonutChart
                          probability={
                            Math.round(result.probability * 100) / 100
                          }
                        />
                      </div>
                      <p className={styles["class-probability"]}>
                        {Math.round(result.probability * 100) / 100}%
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default InfoModal;
