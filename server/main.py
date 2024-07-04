from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from clear_old_images import delete_files_with_pattern
from object_detection import object_detection
from image_classification import image_classification
from werkzeug.utils import secure_filename
from collections import defaultdict
from datetime import datetime
import pytz
import uuid
import os

app = Flask(__name__)
CORS(app)

# Define directories
UPLOAD_FOLDER = f"/tmp/outputs/uploads"
RESULTS_FOLDER = f"/tmp/outputs/results"
CROPPED_IMAGES_FOLDER = f"/tmp/outputs/cropped_images"

# Define configurations for directories
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['RESULTS_FOLDER'] = RESULTS_FOLDER
app.config['CROPPED_IMAGES_FOLDER'] = CROPPED_IMAGES_FOLDER


def ensure_folder_exists(folder_path):
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)
    else:
        print(f"{folder_path} folder already exists.")


# Ensure folders exist
for folder in [UPLOAD_FOLDER, RESULTS_FOLDER, CROPPED_IMAGES_FOLDER]:
    ensure_folder_exists(folder)


@app.route("/api/clear-session-output", methods=["POST"])
def clear_output():
    data = request.get_json()
    session_id = data.get("sessionId")
    
    if not session_id:
        return jsonify({"error": "Session ID is required"}), 400
    
    pattern = session_id

    delete_files_with_pattern(UPLOAD_FOLDER, pattern)
    delete_files_with_pattern(RESULTS_FOLDER, pattern)
    delete_files_with_pattern(CROPPED_IMAGES_FOLDER, pattern)

    return jsonify({ "message": "Files cleared successfully" })


@app.route("/api/analyze-images", methods=["POST"])
def analyze_images():
    # Generate Session ID
    session_id = str(uuid.uuid4())

    # Generate Unique ID for each image
    unique_image_id = "_" + session_id
    
    # Get Images from the client
    input_images = request.files.getlist("inputImage")
    uploaded_filenames = []

    uploaded_images = []
    yolo_images = []
    cropped_images = []
    cropped_images_full_path = []
    grading_results = []
    product_suggestions = []

    class_lists = []
    class_probabilities = []

    if input_images:
        # Save Images in the /tmp/uploads folder
        for image in input_images:
            filename = secure_filename(image.filename)
            unique_filename = os.path.splitext(filename)[0] + unique_image_id + os.path.splitext(filename)[1]

            file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)

            try:
                image.save(file_path)
            except FileNotFoundError:
                os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
                image.save(file_path)

            uploaded_filenames.append(unique_filename)
            uploaded_images.append(file_path)

        object_detection(app.config['RESULTS_FOLDER'], app.config['CROPPED_IMAGES_FOLDER'], uploaded_images, uploaded_filenames, yolo_images, cropped_images, cropped_images_full_path)
        image_classification(cropped_images_full_path, grading_results, product_suggestions, class_lists, class_probabilities)

        # Combining Class Lists and Class Probabilities
        combine_probabilities = [[{"id": str(uuid.uuid4()), "class": class_name, "probability": probability} for class_name, probability in zip(classes, probabilities)] for classes, probabilities in zip(class_lists, class_probabilities)]
        
        # Combining Cropped Images, Grading Results and Class Probabilities
        combine_info = [{"id": str(uuid.uuid4()), "cropped_images": cropped, "grading_result": result, "products": products, "probabilities":  probabilities} for cropped, result, products, probabilities in zip(cropped_images, grading_results, product_suggestions, combine_probabilities)]

        # Group similar filenames
        grouped_dict = defaultdict(list)

        for item in combine_info:
            filename = item['cropped_images']
            prefix = '_'.join(filename.split('_')[:-1])
            grouped_dict[prefix].append(item)

        # Convert grouped items back to list format
        grouped_list = list(grouped_dict.values())

        # Get Current Date and Time
        utc_now = datetime.now(pytz.utc)

        # Structure all Information
        structured_info = [{"id": str(uuid.uuid4()), "timestamp": utc_now.isoformat(), "input_image": input_image, "yolo_images": detected_object, "results": results} for input_image, detected_object, results in zip(uploaded_filenames, yolo_images, grouped_list)]

        return jsonify({ "structured_info": structured_info, "session_id": session_id })
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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port="8000")
