import ErrorIcon from "../Icons/ErrorIcon";
import styles from "@/styles/states/Error.module.scss";

interface ErrorProps {
  message: string;
}

const Error = ({ message }: ErrorProps) => {
  return (
    <div className={styles["wrapper"]}>
      <div className={styles["content"]}>
        <ErrorIcon width="4.5em" height="4.5em" />
        <h1>{message}</h1>
      </div>
    </div>
  );
};

export default Error;
