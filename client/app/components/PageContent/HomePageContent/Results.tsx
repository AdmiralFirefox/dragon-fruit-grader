"use client";

import Image from "next/image";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import SyncLoader from "react-spinners/SyncLoader";
import InfoModal from "@/app/components/Modals/InfoModal";
import InfoIcon from "@/app/components/Icons/InfoIcon";
import { formatTime } from "@/utils/formatTime";
import { ResultsProps } from "@/types/ResultTypes";
import styles from "@/styles/homepage/Results.module.scss";

const Results = ({
  structured_info,
  imageInHttps,
  infoModal,
  openModal,
  closeModal,
  addGradingInfo,
  docExist,
  docLoadingSave,
}: ResultsProps) => {
  const user = useContext(AuthContext);

  return (
    <ul>
      {structured_info.map((info) => {
        return (
          <li key={info.id} className={styles["result-wrapper"]}>
            <div className={styles["result-container"]}>
              <div className={styles["first-section"]}>
                <div className={styles["uploaded-image"]}>
                  <p>Uploaded Image</p>
                  <div className={styles["image-wrapper"]}>
                    <Image
                      src={imageInHttps(info.input_image)}
                      alt="Uploaded Image"
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
                      src={imageInHttps(info.yolo_images)}
                      alt="Detected Dragon Fruits"
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
                            src={imageInHttps(result.cropped_images)}
                            alt="Dragon Fruit"
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

              <div className={styles["timestamp"]}>
                <p>Time Graded: {formatTime(info.timestamp)}</p>
              </div>

              {!user ? (
                <div className={styles["save-results-button"]}>
                  <p>Sign In to Save Results</p>
                </div>
              ) : (
                <div className={styles["save-results-button"]}>
                  {docLoadingSave[info.id] ? (
                    <button className={styles["loading-button"]}>
                      <SyncLoader color="#f7fff9" size={10} />
                    </button>
                  ) : (
                    <div className={styles["save-results-button"]}>
                      <button
                        onClick={() => addGradingInfo(info)}
                        className={styles["save-button"]}
                        disabled={docExist[info.id]}
                      >
                        {docExist[info.id] ? "Results Saved" : "Save Results"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default Results;
