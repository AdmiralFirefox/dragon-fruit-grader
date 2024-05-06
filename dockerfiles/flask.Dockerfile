# Python requirements
FROM python:3.10.11 AS flask

RUN apt-get update && apt-get install -y libgl1-mesa-glx

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Api Directory
COPY api/ .

# Include saved_models directory
COPY saved_models/ saved_models/

# Set the Flask application entry point
ENV FLASK_APP=index.py

EXPOSE 8000

# Command to start the Flask server
CMD [ "flask", "run", "--host=0.0.0.0", "--port=8000"]