from ultralytics import YOLO
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import shutil

app = Flask(__name__)
CORS(app)

# Define the upload folder path in the /tmp directory
UPLOAD_FOLDER = '/tmp/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Define the results folder path in the /tmp directory
RESULTS_FOLDER = '/tmp/results'
app.config['RESULTS_FOLDER'] = RESULTS_FOLDER

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

@app.route("/api/home", methods=["POST"])
def return_home():
    clear_old_images()
    
    # Get Images from the client
    input_images = request.files.getlist("inputImage")
    uploaded_filenames = []
    uploaded_image_paths = []

    yolo_images = []

    if input_images:
        # Save Images in the /tmp/uploads folder
        for image in input_images:
            filename = secure_filename(image.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            image.save(file_path)
            uploaded_filenames.append(filename)
            uploaded_image_paths.append(file_path)

        object_detection(uploaded_image_paths, uploaded_filenames, yolo_images)
        
        return jsonify({"user_input_images": uploaded_filenames, "yolo_filenames": yolo_images})
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

def object_detection(uploaded_image_paths, uploaded_filenames, yolo_images):
    # Load Pre-trained YOLOv8 Model
    saved_model = 'saved_models/best.pt'
    model = YOLO(saved_model)

    # Detect objects
    results = model(uploaded_image_paths)

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

if __name__ == "__main__":
    app.run(host="0.0.0.0")
