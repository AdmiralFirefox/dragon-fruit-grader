import BoxLoader from "../Loaders/BoxLoader";
import styles from "@/styles/states/LoadingAdmin.module.scss";

const LoadingAdmin = ({ message }: { message: string }) => {
  return (
    <div className={styles["container"]}>
      <BoxLoader />
      <h1>{message}</h1>
    </div>
  );
};

export default LoadingAdmin;
