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
          <div></div>
          <div></div>
          <div></div>
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
