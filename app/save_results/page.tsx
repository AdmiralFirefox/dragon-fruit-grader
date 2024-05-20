"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import Image from "next/image";
import InfoModal from "../components/Modals/InfoModal";
import { useScrollLock } from "@/hooks/useScrollLock";
import InfoIcon from "../components/Icons/InfoIcon";
import styles from "@/styles/SaveResults.module.scss";

export default function SaveResults() {
  const grading_info = useLiveQuery(() =>
    db.grading_info.orderBy("timestamp").reverse().toArray()
  );

  const [infoModal, setInfoModal] = useState<number | string>(0);

  const { lock, unlock } = useScrollLock({
    autoLock: false,
    lockTarget: "#scrollable",
  });

  // Delete Result
  const deleteResult = async (id: string) => {
    try {
      await db.grading_info.delete(id);
    } catch (error) {
      console.error("Failed to delete friend:", error);
    }
  };

  // Info Modal
  const openModal = (id: string) => {
    lock();
    if (infoModal === id) {
      return setInfoModal(0);
    }

    setInfoModal(id);
  };

  const closeModal = (id: string) => {
    unlock();
    if (infoModal === id) {
      return setInfoModal(0);
    }
  };

  return (
    <main>
      <div className={styles["saved-results-title"]}>
        <h1>Saved Results</h1>
      </div>
      {grading_info !== undefined
        ? grading_info.map((info) => (
            <li key={info.id} className={styles["result-wrapper"]}>
              <div className={styles["result-container"]}>
                <div className={styles["first-section"]}>
                  <div className={styles["uploaded-image"]}>
                    <p>Uploaded Image</p>
                    <div className={styles["image-wrapper"]}>
                      <Image
                        src={info.input_image}
                        alt={info.input_image}
                        width={300}
                        height={300}
                        unoptimized
                      />
                    </div>
                  </div>

                  <div className={styles["detected-image"]}>
                    <p>Detected Dragon Fruits</p>
                    <div className={styles["image-wrapper"]}>
                      <Image
                        src={info.yolo_images}
                        alt={info.yolo_images}
                        width={300}
                        height={300}
                        unoptimized
                      />
                    </div>
                  </div>
                </div>

                <div className={styles["second-section"]}>
                  <p className={styles["result-title"]}>Results</p>
                  <div className={styles["grading-results"]}>
                    {info.results != null &&
                      info.results.map((result) => (
                        <div key={result.id} className={styles["results-card"]}>
                          <div className={styles["image-wrapper"]}>
                            <Image
                              src={result.cropped_images}
                              alt={result.cropped_images}
                              width={250}
                              height={250}
                              unoptimized
                            />
                          </div>
                          <div className={styles["result-info"]}>
                            <p className={styles["grading-result"]}>
                              {result.grading_result}
                            </p>
                            <button onClick={() => openModal(result.id)}>
                              <InfoIcon width="2em" height="2em" />
                            </button>
                          </div>
                          <InfoModal
                            active={infoModal === result.id}
                            closeModal={() => closeModal(result.id)}
                            products={result.products}
                            probabilities={result.probabilities}
                            id={result.id}
                          />
                        </div>
                      ))}
                  </div>
                </div>

                <div className={styles["delete-results-button"]}>
                  <button onClick={() => deleteResult(info.id)}>
                    Delete Result
                  </button>
                </div>

                <div className={styles["timestamp"]}>
                  <p>Time Graded: {info.timestamp}</p>
                </div>
              </div>
            </li>
          ))
        : null}
    </main>
  );
}
