import ErrorIcon from "../Icons/ErrorIcon";
import styles from "@/styles/states/Error.module.scss";

const Error = () => {
  return (
    <div className={styles["wrapper"]}>
      <div className={styles["content"]}>
        <ErrorIcon width="4.75em" height="4.75em" />
        <h1>Something went wrong. Please try again later.</h1>
      </div>
    </div>
  );
};

export default Error;
