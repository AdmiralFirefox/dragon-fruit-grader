import Image from "next/image";
import styles from "@/styles/homepage/Hero.module.scss";

interface HeroProps {
  scrollToClassInfo: () => void;
  scrollToClassify: () => void;
}

const Hero = ({ scrollToClassInfo, scrollToClassify }: HeroProps) => {
  return (
    <section className={styles["wrapper"]}>
      <div className={styles["content"]}>
        <div className={styles["hero-info"]}>
          <h1>Welcome!</h1>
          <p>
            The easiest ways to classify dragon fruit and recommend products.
          </p>

          <div className={styles["button-wrapper"]}>
            <button onClick={scrollToClassify}>Get Started</button>
            <button onClick={scrollToClassInfo}>Learn More</button>
          </div>
        </div>

        <div className={styles["hero-logo"]}>
          <Image
            src="/logos/hero-logo.png"
            alt="Hero Logo"
            width={600}
            height={600}
            priority
            onDragStart={(e) => e.preventDefault()}
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
