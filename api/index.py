from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import io

app = Flask(__name__)
CORS(app)

# Store images in memory
uploaded_images = {}

@app.route("/api/home", methods=["POST"])
def return_home():
    # Clear old images and log the action
    uploaded_images.clear()
    
    # Get Images from the client
    input_images = request.files.getlist("inputImage")
    uploaded_filenames = []

    if input_images:
        # Store Images in memory
        for image in input_images:
            filename = secure_filename(image.filename)
            image_data = io.BytesIO(image.read())
            uploaded_images[filename] = image_data
            uploaded_filenames.append(filename)
        
        return jsonify({"user_input_images": uploaded_filenames})
    else:
        return jsonify({"error": "No files uploaded"}), 400

@app.route('/api/get-image/<filename>', methods=["GET"])
def get_image(filename):
    if filename in uploaded_images:
        image_data = uploaded_images[filename]
        image_data.seek(0) # Reset the file pointer to the beginning
        return send_file(image_data, mimetype='image/png', as_attachment=True, download_name=filename)
    else:
        return jsonify({"error": "Image not found"}), 404

if __name__ == "__main__":
    app.run(debug=True, port=8080)
