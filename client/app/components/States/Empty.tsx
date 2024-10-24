import styles from "@/styles/states/Empty.module.scss";

const Empty = () => {
  return (
    <div className={styles["container"]}>
      <div className={styles["loader"]}></div>
      <h1>You have no saved results</h1>
    </div>
  );
};

export default Empty;
