import styles from "@/styles/loaders/CogLoader.module.scss";

const CogLoader = () => {
  return (
    <div style={{ transform: "scale(1.35)" }}>
      <div className={styles["loader"]}></div>
    </div>
  );
};

export default CogLoader;
