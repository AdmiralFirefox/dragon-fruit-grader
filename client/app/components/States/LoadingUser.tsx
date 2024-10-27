import SpinnerLoader from "../Loaders/SpinnerLoader";
import styles from "@/styles/states/LoadingUser.module.scss";

const LoadingUser = () => {
  return (
    <main>
      <div className={styles["user"]}>
        <div className={styles["user-photo"]}>
          <div></div>
        </div>
        <div className={styles["user-info"]}>
          <div className={styles["user-info-skeleton1"]}></div>
          <div className={styles["user-info-skeleton2"]}></div>
          <div className={styles["button-wrapper"]}>
            <div className={styles["button-wrapper-skeleton1"]}></div>
            <div className={styles["button-wrapper-skeleton2"]}></div>
          </div>
        </div>
      </div>

      <div className={styles["saved-results-title"]}>
        <h1>Saved Results</h1>
        <div className={styles["border"]}></div>
      </div>

      <SpinnerLoader />
    </main>
  );
};

export default LoadingUser;
