"use client";

import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import Axios from "axios";

interface InputProps {
  input_images: string[];
  yolo_images: string[];
  cropped_images: string[];
  grading_results: string[];
}

// Define the mutation function
const sendUserInput = async (files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("inputImage", file);
  });

  const response = await Axios.post(`/api/home`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export default function Home() {
  // Use the useMutation hook
  const mutation = useMutation<InputProps, Error, File[]>({
    mutationFn: sendUserInput,
  });

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    mutation.mutate(files);
  };

  return (
    <main>
      <h1>Upload Image</h1>
      <input type="file" accept="image/*" onChange={handleFileInput} multiple />

      {mutation.isPending && <p>Loading...</p>}
      {mutation.isError && <p>An error occurred.</p>}
      {mutation.isSuccess && mutation.data !== undefined && (
        <ul>
          <h1>Uploaded Images</h1>
          {mutation.data.input_images.map((filename, index) => (
            <li key={index}>
              <Image
                src={`/api/get-image/${filename}`}
                alt={`Uploaded Image ${index + 1}`}
                width={300}
                height={300}
                unoptimized
              />
            </li>
          ))}
          <h1>Detected Imges</h1>
          {mutation.data.yolo_images.map((filename, index) => (
            <li key={index}>
              <Image
                src={`/api/yolo-results/${filename}`}
                alt={`YOLO Image Result ${index + 1}`}
                width={300}
                height={300}
                unoptimized
              />
            </li>
          ))}
          <h1>Cropped Imges</h1>
          {mutation.data.cropped_images.map((filename, index) => (
            <li key={index}>
              <Image
                src={`/api/yolo-cropped-images/${filename}`}
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
        </ul>
      )}
    </main>
  );
}
