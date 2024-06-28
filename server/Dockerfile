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

# Copy all the needed files
COPY . .

# Set the Flask application entry point
ENV FLASK_APP=main.py

EXPOSE 8000

# Command to start the Flask server using Gunicorn
CMD ["gunicorn", "-b", "0.0.0.0:8000", "main:app"]