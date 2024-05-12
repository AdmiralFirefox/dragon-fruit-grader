"use client";

import { useState } from "react";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import Axios from "axios";
import { koho_bold, monserrat_medium, monserrat_bold } from "./fonts";
import useDragAndDrop from "@/hooks/useDragAndDrop";
import Hero from "./components/Hero";
import ClassInfoCards from "./components/ClassInfoCards";
import styles from "@/styles/Classify.module.scss";
import DragDrop from "./components/DragDrop";

interface InputProps {
  input_images: string[];
  yolo_images: string[];
  cropped_images: string[];
  grading_results: string[];
}

const backend_url = "http://localhost:8000";

// Define the mutation function
const sendUserInput = async (files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("inputImage", file);
  });

  const response = await Axios.post(`${backend_url}/api/home`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export default function Home() {
  const [inputMode, setInputMode] = useState(true);

  const { dragOver, setDragOver, onDragOver, onDragLeave } = useDragAndDrop();

  // Use the useMutation hook
  const mutation = useMutation<InputProps, Error, File[]>({
    mutationFn: sendUserInput,
  });

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

  return (
    <main>
      <Hero />
      <ClassInfoCards />

      <div className={styles["scan-card-title"]}>
        <h1 className={koho_bold.className}>Dragon Fruit Scanning</h1>
      </div>

      <div className={styles["scan-card-wrapper"]}>
        {inputMode ? (
          <DragDrop
            dragOver={dragOver}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            fileSelect={fileSelect}
          />
        ) : null}
      </div>

      {mutation.isPending && <p>Loading...</p>}
      {mutation.isError && <p>An error occurred.</p>}
      {mutation.isSuccess && mutation.data !== undefined && (
        <ul>
          {!inputMode ? (
            <button onClick={() => setInputMode(true)}>
              Classify Another Set
            </button>
          ) : null}
          {!inputMode ? (
            <>
              <>
                <h1>Uploaded Images</h1>
                {mutation.data.input_images.map((filename, index) => (
                  <li key={index}>
                    <Image
                      src={`${backend_url}/api/get-image/${filename}`}
                      alt={`Uploaded Image ${index + 1}`}
                      width={300}
                      height={300}
                      unoptimized
                    />
                  </li>
                ))}
                <h1>Detected Images</h1>
                {mutation.data.yolo_images.map((filename, index) => (
                  <li key={index}>
                    <Image
                      src={`${backend_url}/api/yolo-results/${filename}`}
                      alt={`YOLO Image Result ${index + 1}`}
                      width={300}
                      height={300}
                      unoptimized
                    />
                  </li>
                ))}
                <h1>Cropped Images</h1>
                {mutation.data.cropped_images.map((filename, index) => (
                  <li key={index}>
                    <Image
                      src={`${backend_url}/api/yolo-cropped-images/${filename}`}
                      alt={`YOLO Image Result ${index + 1}`}
                      width={300}
                      height={300}
                      unoptimized
                    />
                  </li>
                ))}
                {mutation.data.grading_results.map((results, index) => (
                  <li key={index}>
                    <h1>The predicted classs is: {results}</h1>
                  </li>
                ))}
              </>
            </>
          ) : null}
        </ul>
      )}
    </main>
  );
}
