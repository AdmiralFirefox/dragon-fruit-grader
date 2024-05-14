"use client";

import { useState } from "react";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import Axios from "axios";
import { koho_bold, monserrat_medium } from "./fonts";
import useDragAndDrop from "@/hooks/useDragAndDrop";
import Hero from "./components/Hero";
import ClassInfoCards from "./components/ClassInfoCards";
import styles from "@/styles/Classify.module.scss";
import DragDrop from "./components/DragDrop";

interface InputProps {
  structured_info: {
    input_image: string;
    yolo_images: string;
    results: {
      cropped_images: string;
      grading_result: string;
    }[]
  }[]
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
            <div className={styles["classify-button"]}>
              <button
                onClick={() => setInputMode(true)}
                className={koho_bold.className}
              >
                Classify Another Set
              </button>
            </div>
          ) : null}
          {!inputMode ? (
            <ul>
              {mutation.data.structured_info.map((info, index) => {
                return (
                  <li key={index} className={styles["result-wrapper"]}>
                    <div className={styles["result-container"]}>
                      <div className={styles["first-section"]}>
                        <div className={styles["uploaded-image"]}>
                          <p className={monserrat_medium.className}>
                            Uploaded Image
                          </p>
                          <div className={styles["image-wrapper"]}>
                            <Image
                              src={`${backend_url}/api/get-image/${info.input_image}`}
                              alt={`Uploaded Image ${index + 1}`}
                              width={300}
                              height={300}
                              unoptimized
                            />
                          </div>
                        </div>

                        <div className={styles["detected-image"]}>
                          <p className={monserrat_medium.className}>
                            Detected Dragon Fruits
                          </p>
                          <div className={styles["image-wrapper"]}>
                            <Image
                              src={`${backend_url}/api/yolo-results/${info.yolo_images}`}
                              alt={`Uploaded Image ${index + 1}`}
                              width={300}
                              height={300}
                              unoptimized
                            />
                          </div>
                        </div>
                      </div>

                      <div className={styles["second-section"]}>
                        <p className={monserrat_medium.className}>Results</p>
                        <div className={styles["grading-results"]}>
                          {info.results != null &&
                            info.results.map((result, index) => (
                              <div
                                key={index}
                                className={styles["results-card"]}
                              >
                                <div className={styles["image-wrapper"]}>
                                  <Image
                                    key={index}
                                    src={`${backend_url}/api/yolo-cropped-images/${result.cropped_images}`}
                                    alt={`Uploaded Image ${index + 1}`}
                                    width={250}
                                    height={250}
                                    unoptimized
                                  />
                                </div>
                                <p className={monserrat_medium.className}>
                                  {result.grading_result}
                                </p>
                                <button className={monserrat_medium.className}>
                                  Product Recommendations
                                </button>
                              </div>
                            ))}
                        </div>
                      </div>

                      <div className={styles["save-results-button"]}>
                        <button className={koho_bold.className}>
                          Save Results
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </ul>
      )}
    </main>
  );
}
