import { useWindowSize } from "@/hooks/useWindowSize";
import { motion, AnimatePresence } from "framer-motion";
import DonutChart from "../Charts/DonutChart";
import { monserrat_medium, monserrat_bold } from "../../fonts";
import styles from "@/styles/InfoModal.module.scss";

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
  const { height = 0 } = useWindowSize();

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
              <div className={styles["chart-content"]}>
                {probabilities.map((result) => (
                  <div key={result.id} className={styles["content"]}>
                    <p className={monserrat_bold.className}>{result.class}</p>
                    <div className={styles["chart-container"]}>
                      <DonutChart
                        probability={Math.round(result.probability * 100) / 100}
                      />
                    </div>
                    <p className={monserrat_medium.className}>
                      {Math.round(result.probability * 100) / 100}%
                    </p>
                  </div>
                ))}
              </div>
              <div className={styles["products-content"]}>
                <p className={`${monserrat_bold.className} title`}>Products:</p>
                <ul className={styles["products"]}>
                  {products.map((product, index) => (
                    <li key={index + 1} className={monserrat_medium.className}>
                      {product}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default InfoModal;
