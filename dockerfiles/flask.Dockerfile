# Python requirements
FROM python:3.10.11-slim AS flask

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Api Directory
COPY api /app/api

# Include saved_models directory
COPY saved_models /app/saved_models

# Set the Flask application entry point
ENV FLASK_APP=api/index.py

EXPOSE 8000

# Command to start the Flask server using Gunicorn
CMD ["sh", "-c", "PYTHONPATH=/app/api gunicorn -b 0.0.0.0:8000 api.index:app"]