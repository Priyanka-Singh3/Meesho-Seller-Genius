# 1. Use Node base image
FROM node:18

# 2. Install minimal system dependencies for rembg
RUN apt-get update && \
    apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    # Only essential OpenGL libraries for rembg
    libgl1-mesa-glx \
    libglib2.0-0 \
    # Clean up to reduce image size
    && rm -rf /var/lib/apt/lists/*

# 3. Create Python virtual environment
RUN python3 -m venv /opt/venv

# 4. Set working directory
WORKDIR /app

# 5. Copy Python dependencies first
COPY backend/python/requirements.txt ./requirements.txt

# 6. Install Python packages in virtual env
RUN /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

# 7. Make venv default BEFORE downloading model
ENV PATH="/opt/venv/bin:$PATH"

# 8. Pre-download rembg model (ensure it matches Python script)
RUN mkdir -p /root/.u2net && \
    python3 -c "from rembg import new_session; print('Downloading silueta model...'); new_session('silueta'); print('Silueta model cached successfully in /root/.u2net/')"

# 9. Copy full backend code (after deps)
COPY backend/ .

# 10. Install Node dependencies
RUN npm install

# 11. Expose Node.js port
EXPOSE 5050

# 12. Run backend server
CMD ["node", "server.js"]