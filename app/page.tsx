"use client";

import { useState } from "react";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { useScrollLock } from "@/hooks/useScrollLock";
import Axios from "axios";
import useDragAndDrop from "@/hooks/useDragAndDrop";
import Hero from "./components/Hero";
import ClassInfoCards from "./components/ClassInfoCards";
import DragDrop from "./components/DragDrop";
import InfoIcon from "./components/Icons/InfoIcon";
import InfoModal from "./components/Modals/InfoModal";
import Loading from "./components/States/Loading";
import Error from "./components/States/Error";
import { db, GradingInfo } from "./db";
import { toBase64FromUrl } from "@/utils/toBase64FromUrl";
import SyncLoader from "react-spinners/SyncLoader";
import styles from "@/styles/Classify.module.scss";

interface InputProps {
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
}

interface LoadingSave {
  [key: string]: boolean;
}

interface DataSaved {
  [key: string]: boolean;
}

const backend_url = "http://localhost:8000";

// Define the mutation function
const sendUserInput = async (files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("inputImage", file);
  });

  const response = await Axios.post(`${backend_url}/api/analyze-images`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export default function Home() {
  const [inputMode, setInputMode] = useState(true);
  const [infoModal, setInfoModal] = useState<number | string>(0);
  const [loadingSave, setLoadingSave] = useState<LoadingSave>({});
  const [dataSaved, setDataSaved] = useState<DataSaved>({});

  const { lock, unlock } = useScrollLock({
    autoLock: false,
    lockTarget: "#scrollable",
  });

  const { dragOver, setDragOver, onDragOver, onDragLeave } = useDragAndDrop();

  // Use the useMutation hook
  const mutation = useMutation<InputProps, Error, File[]>({
    mutationFn: sendUserInput,
  });

  // Uploading Files to the server
  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();

    setInputMode(false);
    setDragOver(false);

    const files = e?.dataTransfer?.files
      ? Array.from(e?.dataTransfer?.files)
      : [];

    mutation.mutate(files);
  };

  const fileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputMode(false);
    const files = event.target.files ? Array.from(event.target.files) : [];
    mutation.mutate(files);
  };

  // Uploading to Grading Results Database
  async function addGradingInfo(info: GradingInfo) {
    setDataSaved((prevStates) => ({ ...prevStates, [info.id]: false }));
    setLoadingSave((prevStates) => ({ ...prevStates, [info.id]: true }));

    // Convert string to file images
    info.input_image = await toBase64FromUrl(
      `${backend_url}/api/get-image/${info.input_image}`
    );
    info.yolo_images = await toBase64FromUrl(
      `${backend_url}/api/yolo-results/${info.yolo_images}`
    );

    for (const result of info.results) {
      result.cropped_images = await toBase64FromUrl(
        `${backend_url}/api/yolo-cropped-images/${result.cropped_images}`
      );
    }

    await db.transaction(
      "rw",
      db.grading_info,
      db.results,
      db.probabilities,
      async () => {
        await db.grading_info.add(info);

        for (const result of info.results) {
          await db.results.add(result);
          for (const probability of result.probabilities) {
            await db.probabilities.add(probability);
          }
        }
      }
    );

    setDataSaved((prevStates) => ({ ...prevStates, [info.id]: true }));
    setLoadingSave((prevStates) => ({ ...prevStates, [info.id]: false }));
  }

  // Check if the format is in Base64
  const isBase64 = (str: string) => {
    return str.startsWith("data:");
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
      <Hero />
      <ClassInfoCards />

      <div className={styles["scan-card-title"]}>
        <h1>Dragon Fruit Scanning</h1>
      </div>

      {inputMode ? (
        <div className={styles["scan-card-wrapper"]}>
          <DragDrop
            dragOver={dragOver}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            fileSelect={fileSelect}
          />
        </div>
      ) : null}

      {mutation.isPending && <Loading />}
      {mutation.isError && <Error />}
      {mutation.isSuccess && mutation.data !== undefined && (
        <>
          {!inputMode ? (
            <div className={styles["classify-button"]}>
              <button onClick={() => setInputMode(true)}>
                Classify Another Set
              </button>
            </div>
          ) : null}

          {!inputMode ? (
            <ul>
              {mutation.data.structured_info.map((info) => {
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
                              <div
                                key={result.id}
                                className={styles["results-card"]}
                              >
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
                        <p>Time Graded: {info.timestamp}</p>
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
                            {dataSaved[info.id]
                              ? "Results Saved"
                              : "Save Results"}
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </>
      )}
    </main>
  );
}
