import Image from "next/image";
import classInfo from "@/data/class_info.json";
import styles from "@/styles/homepage/InfoCards.module.scss";

interface ClassCardProps {
  imgSrc: string;
  fruitClass: string;
  fruitDescription: string;
}

const ClassCard = ({
  imgSrc,
  fruitClass,
  fruitDescription,
}: ClassCardProps) => {
  return (
    <div className={styles["card-content"]}>
      <div className={styles["image-wrapper"]}>
        <Image src={imgSrc} alt="dragon fruit images" width={300} height={30} />
      </div>
      <p>{fruitClass}</p>
      <p>{fruitDescription}</p>
    </div>
  );
};

const ClassInfoCards = () => {
  return (
    <div>
      <section className={styles["card-title"]}>
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
    </div>
  );
};

export default ClassInfoCards;
