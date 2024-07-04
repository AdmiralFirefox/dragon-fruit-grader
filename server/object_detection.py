from ultralytics import YOLO
import cv2
import os
from werkzeug.utils import secure_filename


def ensure_folder_exists(folder_path):
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)


def object_detection(results_folder, cropped_image_folder, uploaded_images, uploaded_filenames, yolo_images, cropped_images, cropped_images_full_path):
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
        masks = result.masks  
        keypoints = result.keypoints
        probs = result.probs  
        
        # Get the file name of the uploaded images
        uploaded_filenames_noextension = os.path.splitext(uploaded_filenames[i])[0]
        secured_filename = secure_filename(f'{uploaded_filenames_noextension}.jpg')

        # Save detected images to the results directory
        filename = os.path.join(results_folder, secured_filename)
        result.save(filename=filename) 
        yolo_images.append(secured_filename)
    
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
            cropped_images.append(cropped_image_name)
            cropped_images_full_path.append(filename)