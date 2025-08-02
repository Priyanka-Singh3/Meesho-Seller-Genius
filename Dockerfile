# 1. Use Node base image
FROM node:18

# 2. Install system dependencies for OpenGL, Python, and image processing
RUN apt-get update && \
    apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    # Essential OpenGL and graphics libraries for rembg
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    # Essential libraries for OpenCV and image processing
    libglib2.0-dev \
    libjpeg-dev \
    libpng-dev \
    libtiff-dev \
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

# 7. Make venv default and set environment variables
ENV PATH="/opt/venv/bin:$PATH"
ENV PYTHONPATH="/app"
ENV DISPLAY=:99
ENV QT_QPA_PLATFORM=offscreen

# 8. Copy full backend code (after deps)
COPY backend/ .

# 9. Install Node dependencies
RUN npm install

# 10. Create directory for rembg models (optional - helps with caching)
RUN mkdir -p /app/.u2net

# 11. Expose Node.js port
EXPOSE 3000

# 12. Run backend server
CMD ["node", "server.js"]