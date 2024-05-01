from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Store the path of the last uploaded image
last_uploaded_image_path = None

# Check if the upload folder exists and create it if it doesn't
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
    print("Created folder: ", UPLOAD_FOLDER)
else:
    print(UPLOAD_FOLDER, "folder already exists.")

@app.route("/api/home", methods=["POST"])
def return_home():
    global last_uploaded_image_path # Use the global variable
    input_image = request.files.get("inputImage")
    if input_image:
        # Delete the old image if it exists
        if last_uploaded_image_path and os.path.exists(last_uploaded_image_path):
            os.remove(last_uploaded_image_path)
            print(f"Deleted old image: {last_uploaded_image_path}")
        
        filename = secure_filename(input_image.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        input_image.save(file_path)
        print(f"Input image: {filename}")
        
        # Update the path of the last uploaded image
        last_uploaded_image_path = file_path
        
        return jsonify({"user_input_image": filename})
    else:
        return jsonify({"error": "No file uploaded"}), 400

@app.route('/get-image/<filename>', methods=["GET"])
def get_image(filename):
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    return send_file(file_path, mimetype='image/png')

if __name__ == "__main__":
    app.run(debug=True, port=8080)