import Image from "next/image";
import styles from "@/styles/homepage/Hero.module.scss";

interface HeroProps {
  scrollToClassInfo: () => void;
  scrollToClassify: () => void;
}

const Hero = ({ scrollToClassInfo, scrollToClassify }: HeroProps) => {
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
      <div className={styles["hero-bg"]}>
        <Image src="/background/hero-bg.png" alt="" fill priority />
      </div>
      <h1>WELCOME</h1>
      <p>
        Find the easiest ways to classify dragon fruit and recommended products
        just for you!
      </p>

      <div className={styles["button-wrapper"]}>
        <button onClick={scrollToClassify}>Get Started</button>
        <button onClick={scrollToClassInfo}>Learn More</button>
      </div>
    </section>
  );
};

export default Hero;
