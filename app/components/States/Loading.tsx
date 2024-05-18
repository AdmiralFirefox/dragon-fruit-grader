import SyncLoader from "react-spinners/SyncLoader";
import styles from "@/styles/Loading.module.scss";

const Loading = () => {
  return (
    <div className={styles["wrapper"]}>
      <div className={styles["content"]}>
        <SyncLoader color="#f7fff9" size={15}  />
        <h1>Detecting and Classifying Dragon Fruits</h1>
      </div>
    </div>
  );
};

export default Loading;
