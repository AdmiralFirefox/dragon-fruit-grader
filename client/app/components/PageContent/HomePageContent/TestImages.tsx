import Image from "next/image";
import styles from "@/styles/homepage/TestImages.module.scss";

interface TestImagesProps {
  setSampleImage: (imagePath: string) => Promise<void>;
}

const TestImages = ({ setSampleImage }: TestImagesProps) => {
  return (
    <>
      <p className={styles["sample-images-title"]}>Try these sample images:</p>

      <ul className={styles["sample-images-container"]}>
        <li
          className={styles["sample-image-wrapper"]}
          onClick={() => setSampleImage("/sample-images/dragon_fruit_1.jpg")}
        >
          <Image
            src="/sample-images/dragon_fruit_1.jpg"
            alt="Sample Dragon Fruit Image"
            width={100}
            height={100}
          />
        </li>
        <li
          className={styles["sample-image-wrapper"]}
          onClick={() => setSampleImage("/sample-images/dragon_fruit_2.png")}
        >
          <Image
            src="/sample-images/dragon_fruit_2.png"
            alt="Sample Dragon Fruit Image"
            width={100}
            height={100}
          />
        </li>
        <li
          className={styles["sample-image-wrapper"]}
          onClick={() => setSampleImage("/sample-images/dragon_fruit_3.png")}
        >
          <Image
            src="/sample-images/dragon_fruit_3.png"
            alt="Sample Dragon Fruit Image"
            width={100}
            height={100}
          />
        </li>
        <li
          className={styles["sample-image-wrapper"]}
          onClick={() => setSampleImage("/sample-images/dragon_fruit_4.jpg")}
        >
          <Image
            src="/sample-images/dragon_fruit_4.jpg"
            alt="Sample Dragon Fruit Image"
            width={100}
            height={100}
          />
        </li>
        <li
          className={styles["sample-image-wrapper"]}
          onClick={() => setSampleImage("/sample-images/dragon_fruit_5.jpg")}
        >
          <Image
            src="/sample-images/dragon_fruit_5.jpg"
            alt="Sample Dragon Fruit Image"
            width={100}
            height={100}
          />
        </li>
      </ul>
    </>
  );
};

export default TestImages;
