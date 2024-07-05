"use client";

import { useState, useRef } from "react";
import Image from "next/image";
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
  session_id: string;
}

interface ClearSessionProps {
  message: string;
}

interface LoadingSave {
  [key: string]: boolean;
}

interface DataSaved {
  [key: string]: boolean;
}

const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL
  ? process.env.NEXT_PUBLIC_BACKEND_URL
  : "http://localhost:8000";

// Send User Input Images
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

// Clear Sessions
const clearSession = async (sessionId: string) => {
  const response = await Axios.post(
    `${backend_url}/api/clear-session-output`,
    { sessionId },
    {
      headers: {
        "Content-Type": "application/json",
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
  const [sessionId, setSessionId] = useState("");
  const { dragOver, setDragOver, onDragOver, onDragLeave } = useDragAndDrop();

  const classInfoSectionRef = useRef<HTMLElement>(null);
  const classifySectionRef = useRef<HTMLDivElement>(null);

  const { lock, unlock } = useScrollLock({
    autoLock: false,
    lockTarget: "#scrollable",
  });

  // Scroll to Specific Sections
  const scrollToClassInfo = () => {
    classInfoSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToClassify = () => {
    classifySectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Use the useMutation hook
  const mutation = useMutation<InputProps, Error, File[]>({
    mutationFn: sendUserInput,
    onSuccess: (data) => {
      setSessionId(data.session_id);
    },
  });

  const clear_session_mutation = useMutation<
    ClearSessionProps,
    Error,
    typeof sessionId
  >({
    mutationFn: clearSession,
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
    info.input_image = await toBase64FromUrl(info.input_image);
    info.yolo_images = await toBase64FromUrl(info.yolo_images);

    for (const result of info.results) {
      result.cropped_images = await toBase64FromUrl(result.cropped_images);
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

  // Set Sample Image
  const setSampleImage = async (imagePath: string) => {
    if (imagePath) {
      try {
        const response = await fetch(imagePath);
        const blob = await response.blob();

        // Extract the filename from the imagePath
        const filename = imagePath.split("/").pop();
        const imageFile = new File([blob], filename as string, {
          type: blob.type,
        });

        // Pass the imageFile as an array
        mutation.mutate([imageFile]);
        setInputMode(false);
      } catch (error) {
        console.error("Error setting sample image:", error);
      }
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
      <Hero
        scrollToClassInfo={scrollToClassInfo}
        scrollToClassify={scrollToClassify}
      />
      <ClassInfoCards classInfoSectionRef={classInfoSectionRef} />

      <div className={styles["scan-card-title"]} ref={classifySectionRef}>
        <h1>Dragon Fruit Scanning</h1>
      </div>

      {inputMode ? (
        <>
          <div className={styles["scan-card-wrapper"]}>
            <DragDrop
              dragOver={dragOver}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              fileSelect={fileSelect}
            />
          </div>

          <p className={styles["sample-images-title"]}>
            Try these sample images:
          </p>

          <ul className={styles["sample-images-container"]}>
            <li
              className={styles["sample-image-wrapper"]}
              onClick={() =>
                setSampleImage("/sample-images/dragon_fruit_1.jpg")
              }
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
              onClick={() =>
                setSampleImage("/sample-images/dragon_fruit_2.png")
              }
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
              onClick={() =>
                setSampleImage("/sample-images/dragon_fruit_3.png")
              }
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
              onClick={() =>
                setSampleImage("/sample-images/dragon_fruit_4.jpg")
              }
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
              onClick={() =>
                setSampleImage("/sample-images/dragon_fruit_5.jpg")
              }
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
      ) : null}

      {mutation.isPending && <Loading />}
      {mutation.isError && <Error />}
      {mutation.isSuccess && mutation.data !== undefined && (
        <>
          {!inputMode ? (
            <div className={styles["classify-button"]}>
              <button
                onClick={() => {
                  setInputMode(true);
                  mutation.reset();
                  clear_session_mutation.mutate(sessionId);
                }}
              >
                Classify Another Set
              </button>
            </div>
          ) : null}

          {!inputMode ? (
            <Results
              structured_info={mutation.data.structured_info}
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
