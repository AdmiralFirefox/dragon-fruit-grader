import styles from "@/styles/states/Initializing.module.scss";

const Initializing = () => {
  return (
    <div className={styles["container"]}>
      <div className={styles["loader-wrapper"]}>
        <div className={styles["loader"]}></div>
      </div>

      <h1>Initializing Data</h1>
    </div>
  );
};

export default Initializing;
