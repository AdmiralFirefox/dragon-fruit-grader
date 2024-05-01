"use client";

import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import Axios from "axios";

interface InputProps {
  user_input_images: string[];
}

// Define the mutation function
const sendUserInput = async (files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("inputImage", file);
  });

  const response = await Axios.post("/api/home", formData, {
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
        <div>
          {mutation.data.user_input_images.map((filename, index) => (
            <Image
              key={index}
              src={`/api/get-image/${filename}`}
              alt={`Uploaded Image ${index + 1}`}
              width={300}
              height={300}
            />
          ))}
        </div>
      )}
    </main>
  );
}
