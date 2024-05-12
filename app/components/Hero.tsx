import Image from "next/image";
import { koho_bold, monserrat_medium, monserrat_bold } from "../fonts";
import styles from "@/styles/Hero.module.scss";

const Hero = () => {
  return (
    <section className={styles["wrapper"]}>
      <div className={styles["logo-wrapper"]}>
        <Image
          src="/logos/web-logo.png"
          alt="Dragon Fruit Logo"
          width={300}
          height={30}
        />
      </div>
      <h1 className={koho_bold.className}>WELCOME</h1>
      <p className={monserrat_medium.className}>
        Find the easiest ways to classify dragon fruit and recommended products
        just for you!
      </p>

      <div className={styles["button-wrapper"]}>
        <button className={monserrat_bold.className}>Get Started</button>
        <button className={monserrat_bold.className}>Learn More</button>
      </div>
    </section>
  );
};

export default Hero;
