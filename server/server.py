from flask import Flask, jsonify
from flask_cors import CORS

# App instance
app = Flask(__name__)
CORS(app)

# Setting up endpoint
@app.route("/api/home", methods=["GET"])
def return_home():
    return jsonify({
        "title": "Post #1",
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing",
        "keywords": ["development", "technical", "programming", "fullstack"]
    })

if __name__ == "__main__":
    app.run(debug=True, port=8080)