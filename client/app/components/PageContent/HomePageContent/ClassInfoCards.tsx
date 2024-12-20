import { RefObject } from "react";
import Image from "next/image";
import classInfo from "@/data/class_info.json";
import styles from "@/styles/homepage/InfoCards.module.scss";

interface ClassCardProps {
  imgSrc: string;
  fruitClass: string;
  fruitDescription: string;
}

interface ClassInfoCardsProps {
  classInfoSectionRef: RefObject<HTMLElement>;
}

const ClassCard = ({
  imgSrc,
  fruitClass,
  fruitDescription,
}: ClassCardProps) => {
  return (
    <div className={styles["card-content"]}>
      <div className={styles["image-wrapper"]}>
        <Image
          src={imgSrc}
          alt="dragon fruit images"
          width={300}
          height={30}
          onDragStart={(e) => e.preventDefault()}
        />
      </div>
      <p>{fruitClass}</p>
      <p>{fruitDescription}</p>
    </div>
  );
};

const ClassInfoCards = ({ classInfoSectionRef }: ClassInfoCardsProps) => {
  return (
    <>
      <section className={styles["card-title"]} ref={classInfoSectionRef}>
        <h1>Classification of Dragon Fruit</h1>
        <p>
          Marketable dragon fruit grading classes that possess excellent
          qualities in terms of size, shape, and physical appearance.
        </p>
      </section>

      <div className={styles["card-wrapper"]}>
        <div className={styles["card-container"]}>
          {classInfo.map((info) => (
            <ClassCard
              key={info.class_number}
              imgSrc={info.class_image}
              fruitClass={info.class}
              fruitDescription={info.description}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default ClassInfoCards;
