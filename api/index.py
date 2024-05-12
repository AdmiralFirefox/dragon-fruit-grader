import torch
from torchvision import models, transforms
from torch import nn
from PIL import Image
from ultralytics import YOLO
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import shutil
import cv2

app = Flask(__name__)
CORS(app)

# Define the upload folder path in the /tmp directory
UPLOAD_FOLDER = '/tmp/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Define the results folder path in the /tmp directory
RESULTS_FOLDER = '/tmp/results'
app.config['RESULTS_FOLDER'] = RESULTS_FOLDER

# Define the cropped images folder path in the /tmp directory
CROPPED_IMAGES_FOLDER = '/tmp/cropped_images'
app.config['CROPPED_IMAGES_FOLDER'] = CROPPED_IMAGES_FOLDER

# Check if the upload folder exists in /tmp and create it if it doesn't
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
else:
    print(f"{UPLOAD_FOLDER} folder already exists.")

# Check if the results folder exists in /tmp and create it if it doesn't
if not os.path.exists(RESULTS_FOLDER):
    os.makedirs(RESULTS_FOLDER)
else:
    print(f"{RESULTS_FOLDER} folder already exists.")

# Check if the cropped images folder exists in /tmp and create it if it doesn't
if not os.path.exists(CROPPED_IMAGES_FOLDER):
    os.makedirs(CROPPED_IMAGES_FOLDER)
else:
    print(f"{CROPPED_IMAGES_FOLDER} folder already exists.")

@app.route("/api/home", methods=["POST"])
def return_home():
    clear_old_images()
    
    # Get Images from the client
    input_images = request.files.getlist("inputImage")
    uploaded_filenames = []

    uploaded_images = []
    yolo_images = []
    cropped_images = []
    cropped_images_full_path = []
    grading_results = []

    if input_images:
        # Save Images in the /tmp/uploads folder
        for image in input_images:
            filename = secure_filename(image.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            image.save(file_path)
            uploaded_filenames.append(filename)
            uploaded_images.append(file_path)

        object_detection(uploaded_images, uploaded_filenames, yolo_images, cropped_images, cropped_images_full_path)
        image_classification(cropped_images_full_path, grading_results)
        
        return jsonify({"input_images": uploaded_filenames, "yolo_images": yolo_images, "cropped_images": cropped_images, "grading_results": grading_results})
    else:
        return jsonify({"error": "No files uploaded"}), 400

@app.route('/api/get-image/<filename>', methods=["GET"])
def get_image(filename):
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    return send_file(file_path, mimetype='image/png')

@app.route('/api/yolo-results/<filename>', methods=["GET"])
def yolo_results(filename):
    file_path = os.path.join(app.config['RESULTS_FOLDER'], filename)
    return send_file(file_path, mimetype='image/png')

@app.route('/api/yolo-cropped-images/<filename>', methods=["GET"])
def cropped_images(filename):
    file_path = os.path.join(app.config['CROPPED_IMAGES_FOLDER'], filename)
    return send_file(file_path, mimetype='image/png')

def clear_old_images():
    # Delete all old uploaded images
    for filename in os.listdir(UPLOAD_FOLDER):
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
        except Exception as e:
            print(f'Failed to delete {file_path}. Reason: {e}')

    # Delete all old detected images
    for filename in os.listdir(RESULTS_FOLDER):
        file_path = os.path.join(RESULTS_FOLDER, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
        except Exception as e:
            print(f'Failed to delete {file_path}. Reason: {e}')
    
    # Delete all old cropped images folder
    for filename in os.listdir(CROPPED_IMAGES_FOLDER):
        file_path = os.path.join(CROPPED_IMAGES_FOLDER, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
        except Exception as e:
            print(f'Failed to delete {file_path}. Reason: {e}')

def object_detection(uploaded_images, uploaded_filenames, yolo_images, cropped_images, cropped_images_full_path):
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
        filename = os.path.join(app.config['RESULTS_FOLDER'], secured_filename)
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
            filename = os.path.join(app.config['CROPPED_IMAGES_FOLDER'], cropped_image_name)

            # Save the cropped object as an image in the 'cropped_images' folder
            cv2.imwrite(filename, ultralytics_crop_object)
            cropped_images.append(cropped_image_name)
            cropped_images_full_path.append(filename)

def image_classification(cropped_images_full_path, grading_results):
    # Define class names
    class_names = ['Class 1', 'Class 2', 'Extra Class', 'Reject', 'Reject (Unripe)']

    # Load the pre-trained ResNet model
    model = models.resnet50(weights=None)  
    num_ftrs = model.fc.in_features

    # Replace the fully connected layer
    num_classes = 5  # Number of Classes
    model.fc = torch.nn.Linear(num_ftrs, num_classes)

    # Load the state dictionary
    state_dict = torch.load("saved_models/resnet50_model.pth", map_location=torch.device("cpu"))

    # Rename keys in the state dictionary
    new_state_dict = {}
    for key, value in state_dict.items():
        if key.startswith('fc.1.'):
            new_key = key.replace('fc.1.', 'fc.')
            new_state_dict[new_key] = value
        else:
            new_state_dict[key] = value

    # Load the modified state dictionary into the model
    model.load_state_dict(new_state_dict)

    # Set the model to evaluation mode
    model.eval()

    # Define image transformation
    preprocess = transforms.Compose([
        transforms.Resize(256), # Resize the image to 256x256 pixels
        transforms.CenterCrop(224), # Crop the center of the image to 224x224 pixels
        transforms.ToTensor(), # Convert the image to a PyTorch tensor
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]), # Normalize the image
    ])

    # Predicting multiple images
    for image_path in cropped_images_full_path:
        # Load and preprocess the image
        img = Image.open(image_path)
        img_t = preprocess(img)
        batch_t = torch.unsqueeze(img_t, 0)
        
        # Make predictions
        with torch.no_grad():
            out = model(batch_t)
        
        _, predicted = torch.max(out, 1)
        predicted_class = class_names[predicted]
        
        # print("The predicted class is", predicted_class)
        grading_results.append(predicted_class)

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
