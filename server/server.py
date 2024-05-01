from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import shutil

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Check if the upload folder exists and create it if it doesn't
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
    # print("Created folder: ", UPLOAD_FOLDER)
else:
    print(UPLOAD_FOLDER, "folder already exists.")

@app.route("/api/home", methods=["POST"])
def return_home():
    # Delete all old images
    for filename in os.listdir(UPLOAD_FOLDER):
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
        except Exception as e:
            print(f'Failed to delete {file_path}. Reason: {e}')
    
    # Get Images from the client
    input_images = request.files.getlist("inputImage")
    uploaded_filenames = []

    if input_images:
        # Save Images in the uploads folder
        for image in input_images:
            filename = secure_filename(image.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            image.save(file_path)
            uploaded_filenames.append(filename)
            # print(f"Input image: {filename}")
        
        return jsonify({"user_input_images": uploaded_filenames})
    else:
        return jsonify({"error": "No files uploaded"}), 400

@app.route('/get-image/<filename>', methods=["GET"])
def get_image(filename):
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    return send_file(file_path, mimetype='image/png')

if __name__ == "__main__":
    app.run(debug=True, port=8080)
