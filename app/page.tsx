"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useScrollLock } from "@/hooks/useScrollLock";
import Axios from "axios";
import useDragAndDrop from "@/hooks/useDragAndDrop";
import Hero from "./components/HomePage/Hero";
import ClassInfoCards from "./components/HomePage/ClassInfoCards";
import Results from "./components/HomePage/Results";
import DragDrop from "./components/HomePage/DragDrop";
import Loading from "./components/States/Loading";
import Error from "./components/States/Error";
import { db, GradingInfo } from "./db";
import { toBase64FromUrl } from "@/utils/toBase64FromUrl";
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

  const response = await Axios.post(
    `${backend_url}/api/analyze-images`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export default function Home() {
  const [inputMode, setInputMode] = useState(true);
  const [infoModal, setInfoModal] = useState<number | string>(0);
  const [loadingSave, setLoadingSave] = useState<LoadingSave>({});
  const [dataSaved, setDataSaved] = useState<DataSaved>({});
  const { dragOver, setDragOver, onDragOver, onDragLeave } = useDragAndDrop();

  const { lock, unlock } = useScrollLock({
    autoLock: false,
    lockTarget: "#scrollable",
  });

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
            <Results
              structured_info={mutation.data.structured_info}
              backend_url={backend_url}
              isBase64={isBase64}
              infoModal={infoModal}
              openModal={openModal}
              closeModal={closeModal}
              loadingSave={loadingSave}
              dataSaved={dataSaved}
              addGradingInfo={addGradingInfo}
            />
          ) : null}
        </>
      )}
    </main>
  );
}
