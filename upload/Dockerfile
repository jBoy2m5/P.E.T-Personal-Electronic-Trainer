FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    libxcb1 \
    libglib2.0-0 \
    libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .

CMD python websocket_server.py
