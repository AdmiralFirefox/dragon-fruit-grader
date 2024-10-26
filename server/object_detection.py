from ultralytics import YOLO
from cloudinary import uploader
import cv2
import os
from werkzeug.utils import secure_filename


def ensure_folder_exists(folder_path):
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)


def object_detection(upload_folder, results_folder, cropped_image_folder, uploaded_images, uploaded_filenames, cropped_images_full_path, upload_image_url, result_image_url, cropped_image_url):
    # Ensure results and cropped image folders exist
    ensure_folder_exists(results_folder)
    ensure_folder_exists(cropped_image_folder)
    
    # Load Pre-trained YOLOv8 Model
    saved_model = 'saved_models/best.pt'
    model = YOLO(saved_model)

    # Detect objects
    results = model(uploaded_images)

    # Iterate through the Detected Objects
    for i, result in enumerate(results):
        boxes = result.boxes  

        if len(boxes) > 0:
            # Get the file name of the uploaded images
            uploaded_filenames_noextension = os.path.splitext(uploaded_filenames[i])[0]
            secured_filename = secure_filename(f'detected_{uploaded_filenames_noextension}.jpg')

            # Save detected images to the results directory
            filename = os.path.join(results_folder, secured_filename)
            result.save(filename=filename)

            # Upload input image to cloudinary
            input_public_id = os.path.splitext(uploaded_filenames[i])[0]
            input_image_file_path = os.path.join(upload_folder, uploaded_filenames[i])
            upload_input_result = uploader.upload(input_image_file_path,
                                            public_id=input_public_id,
                                            folder="dragon-fruit-grader",
                                            resource_type="image",
                                            transformation=[
                                                {"quality": "auto:eco"}
                                            ])
            upload_image_url.append(upload_input_result["url"])

            # Upload detected image to cloudinary
            detected_public_id = os.path.splitext(secured_filename)[0]
            upload_detected_result = uploader.upload(filename,
                                            public_id=detected_public_id,
                                            folder="dragon-fruit-grader",
                                            resource_type="image",
                                            transformation=[
                                                {"quality": "auto:eco"}
                                            ])
            result_image_url.append(upload_detected_result["url"])
        else:
            print(f"No detections in image {uploaded_filenames[i]}, skipping save and upload.")
    
    # Perform inference on each image and crop the detected objects
    for image in uploaded_images:
        # Perform inference on an image
        results = model(image)

        # Load the original image
        img = cv2.imread(image)

        # Extract bounding boxes
        boxes = results[0].boxes.xyxy.tolist()

        # Iterate through the bounding boxes
        for i, box in enumerate(boxes):
            x1, y1, x2, y2 = box
            
            # Crop the object using the bounding box coordinates
            ultralytics_crop_object = img[int(y1):int(y2), int(x1):int(x2)]
            
            # Save to Folder 
            # Construct the filename with the desired path
            cropped_image_name = "cropped_" + os.path.basename(image).split(".")[0] + "_" + str(i) + ".jpg"
            filename = os.path.join(cropped_image_folder, cropped_image_name)

            # Save the cropped object as an image in the 'cropped_images' folder
            cv2.imwrite(filename, ultralytics_crop_object)

            # Upload image to cloudinary
            cropped_public_id = os.path.splitext(cropped_image_name)[0]
            upload_cropped_result = uploader.upload(filename,
                                            public_id=cropped_public_id,
                                            folder="dragon-fruit-grader",
                                            resource_type="image",
                                            transformation=[
                                                {"quality": "auto:eco"}
                                            ])
            cropped_image_url.append(upload_cropped_result["url"])

            cropped_images_full_path.append(filename)