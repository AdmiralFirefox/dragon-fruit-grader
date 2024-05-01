"use client";

import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import Axios from "axios";

interface InputProps {
  user_input_image: string;
}

// Define the mutation function
const sendUserInput = async (file: File | null) => {
  if (!file) return;

  const formData = new FormData();
  formData.append("inputImage", file);

  const response = await Axios.post(
    "http://localhost:8080/api/home",
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
  // Use the useMutation hook
  const mutation = useMutation<InputProps, Error, File | null>({
    mutationFn: sendUserInput,
  });

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    mutation.mutate(file);
  };

  return (
    <main>
      <h1>Upload Image</h1>
      <input type="file" accept="image/*" onChange={handleFileInput} />

      {mutation.isPending && <p>Loading...</p>}
      {mutation.isError && <p>An error occurred.</p>}
      {mutation.isSuccess && mutation.data !== undefined && (
        <div>
          <Image
            src={`http://localhost:8080/get-image/${mutation.data.user_input_image}`}
            alt="Image"
            width={300}
            height={300}
          />
        </div>
      )}
    </main>
  );
}
