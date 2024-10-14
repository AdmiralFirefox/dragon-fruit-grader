import { NextResponse } from "next/server";
import cloudinary from "cloudinary";
import path from "path";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  const { input_image, yolo_images, results } = await request.json();

  // Upload the input_image to Cloudinary
  const trimmed_input_image = input_image.match(/[^\/]+$/)[0];
  const trimmed_input_image_no_ext = path.basename(
    trimmed_input_image,
    path.extname(trimmed_input_image)
  );
  const public_id_input_image = `saved_${trimmed_input_image_no_ext}`;
  await cloudinary.v2.uploader.upload(input_image, {
    public_id: public_id_input_image,
    folder: "saved_dragon_fruit_images",
  });

  // Upload the yolo_image to Cloudinary
  const trimmed_yolo_images = yolo_images.match(/[^\/]+$/)[0];
  const trimmed_yolo_images_no_ext = path.basename(
    trimmed_yolo_images,
    path.extname(trimmed_yolo_images)
  );
  const public_id_yolo_images = `saved_${trimmed_yolo_images_no_ext}`;
  await cloudinary.v2.uploader.upload(yolo_images, {
    public_id: public_id_yolo_images,
    folder: "saved_dragon_fruit_images",
  });

  // Upload each cropped_image in results array to Cloudinary
  await Promise.all(
    results.map(async (cropped_image: string) => {
      const trimed_cropped_image = cropped_image.match(/[^\/]+$/)![0];
      const trimed_cropped_image_no_ext = path.basename(
        trimed_cropped_image,
        path.extname(trimed_cropped_image)
      );
      const public_id_cropped_image = `saved_${trimed_cropped_image_no_ext}`;

      const uploadResponse = await cloudinary.v2.uploader.upload(
        cropped_image,
        {
          public_id: public_id_cropped_image,
          folder: "saved_dragon_fruit_images",
        }
      );

      return uploadResponse.secure_url;
    })
  );

  return NextResponse.json({
    message: "Image data received successfully",
  });
}
