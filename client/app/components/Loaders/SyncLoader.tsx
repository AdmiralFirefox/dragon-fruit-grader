import styles from "@/styles/loaders/SyncLoader.module.scss";

const SyncLoader = ({ width }: { width: string }) => {
  return <div className={styles["loader"]} style={{ width: width }}></div>;
};

export default SyncLoader;
