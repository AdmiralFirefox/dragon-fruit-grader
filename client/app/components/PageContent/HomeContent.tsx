"use client";

import { useState, useRef, useContext } from "react";
import { useMutation } from "@tanstack/react-query";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { AuthContext } from "@/context/AuthContext";
import Axios from "axios";
import useDragAndDrop from "@/hooks/useDragAndDrop";
import Hero from "@/app/components/PageContent/HomePageContent/Hero";
import ClassInfoCards from "@/app/components/PageContent/HomePageContent/ClassInfoCards";
import Results from "@/app/components/PageContent/HomePageContent/Results";
import DragDrop from "@/app/components/PageContent/HomePageContent/DragDrop";
import TestImages from "./HomePageContent/TestImages";
import Loading from "@/app/components/States/Loading";
import Error from "@/app/components/States/Error";
import { StructuredInfo } from "@/types/DataType";
import {
  InputProps,
  DocLoadingSave,
  DocExist,
  ClearSessionProps,
} from "@/types/HomeContentTypes";
import styles from "@/styles/Classify.module.scss";

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

const HomeContent = () => {
  const [inputMode, setInputMode] = useState(true);
  const [sessionId, setSessionId] = useState("");

  const [docExist, setDocExist] = useState<DocExist>({});
  const [docLoadingSave, setDocLoadingSave] = useState<DocLoadingSave>({});

  const { dragOver, setDragOver, onDragOver, onDragLeave } = useDragAndDrop();

  const classInfoSectionRef = useRef<HTMLElement>(null);
  const classifySectionRef = useRef<HTMLDivElement>(null);

  const user = useContext(AuthContext);

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

  // Ensuring the url served is in https
  const imageInHttps = (image_url: string) => {
    return image_url.startsWith("http://")
      ? image_url.replace("http://", "https://")
      : image_url;
  };

  // Uploading to Grading Results Database
  const addGradingInfo = async (info: StructuredInfo) => {
    setDocExist((prevStates) => ({ ...prevStates, [info.id]: false }));
    setDocLoadingSave((prevStates) => ({ ...prevStates, [info.id]: true }));

    if (user) {
      try {
        const gradingInfoRef = collection(db, "grading_info");

        await addDoc(gradingInfoRef, {
          owner_id: user?.uid,
          owner_email: user?.email,
          owner_photo: user?.photoURL,
          input_image: info.input_image,
          timestamp: info.timestamp,
          yolo_images: info.yolo_images,
          results: info.results,
        });

        await fetch("/api/cloudinary/upload-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input_image: info.input_image,
            yolo_images: info.yolo_images,
            results: info.results.map((result) => result.cropped_images),
          }),
        });
      } catch (error) {
        console.error(error);
      }
    }

    setDocExist((prevStates) => ({ ...prevStates, [info.id]: true }));
    setDocLoadingSave((prevStates) => ({ ...prevStates, [info.id]: false }));
  };

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

          <TestImages setSampleImage={setSampleImage} />
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
              imageInHttps={imageInHttps}
              addGradingInfo={addGradingInfo}
              docExist={docExist}
              docLoadingSave={docLoadingSave}
            />
          ) : null}
        </>
      )}
    </main>
  );
};

export default HomeContent;
