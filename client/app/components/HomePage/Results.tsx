import Image from "next/image";
import SyncLoader from "react-spinners/SyncLoader";
import InfoModal from "../Modals/InfoModal";
import InfoIcon from "../Icons/InfoIcon";
import { GradingInfo } from "../../db";
import { formatTime } from "@/utils/formatTime";
import styles from "@/styles/homepage/Results.module.scss";

interface ResultsProps {
  structured_info: {
    id: string;
    input_image: string;
    yolo_images: string;
    timestamp: string;
    results: {
      id: string;
      cropped_images: string;
      grading_result: string;
      products: string[];
      probabilities: {
        id: string;
        class: string;
        probability: number;
      }[];
    }[];
  }[];
  backend_url: string;
  isBase64: (str: string) => boolean;
  infoModal: string | number;
  openModal: (id: string) => void;
  closeModal: (id: string) => void;
  loadingSave: { [key: string]: boolean };
  dataSaved: { [key: string]: boolean };
  addGradingInfo(info: GradingInfo): Promise<void>;
}

const Results = ({
  structured_info,
  backend_url,
  isBase64,
  infoModal,
  openModal,
  closeModal,
  loadingSave,
  dataSaved,
  addGradingInfo,
}: ResultsProps) => {
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
                      src={
                        isBase64(info.input_image)
                          ? info.input_image
                          : `${backend_url}/api/get-image/${info.input_image}`
                      }
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
                      src={
                        isBase64(info.yolo_images)
                          ? info.yolo_images
                          : `${backend_url}/api/yolo-results/${info.yolo_images}`
                      }
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
                            src={
                              isBase64(result.cropped_images)
                                ? result.cropped_images
                                : `${backend_url}/api/yolo-cropped-images/${result.cropped_images}`
                            }
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

              <div className={styles["save-results-button"]}>
                {loadingSave[info.id] ? (
                  <button className={styles["loading-button"]}>
                    <SyncLoader color="#f7fff9" size={10} />
                  </button>
                ) : (
                  <button
                    onClick={() => addGradingInfo(info)}
                    className={styles["save-button"]}
                    disabled={dataSaved[info.id]}
                  >
                    {dataSaved[info.id] ? "Results Saved" : "Save Results"}
                  </button>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default Results;
