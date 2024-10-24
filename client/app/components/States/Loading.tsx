import CogLoader from "../Loaders/CogLoader";
import styles from "@/styles/states/Loading.module.scss";

const Loading = () => {
  return (
    <div className={styles["wrapper"]}>
      <div className={styles["content"]}>
        <CogLoader />
        <h1>Detecting and Classifying Dragon Fruits</h1>
      </div>
    </div>
  );
};

export default Loading;
