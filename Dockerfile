# Use Node base image
FROM node:18

# Install system dependencies
RUN apt-get update && \
    apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libomp-dev \
    libopenblas-dev \
    && rm -rf /var/lib/apt/lists/*

# Create Python virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Set working directory
WORKDIR /app

# Copy Python requirements first for better caching
COPY backend/python/requirements.txt ./requirements.txt

# Install Python packages
RUN /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

# Set environment variables for performance and model path
ENV OMP_NUM_THREADS=2
ENV MKL_NUM_THREADS=2
ENV NUMEXPR_NUM_THREADS=2
ENV OPENBLAS_NUM_THREADS=2
# Model will be cached by pre-deploy command at this path
ENV REMBG_MODELS_PATH=/opt/render/project/src/.u2net

# Copy the pre-deploy script
COPY predeploy.sh .
RUN chmod +x predeploy.sh

# Copy backend code
COPY backend/ .

# Install Node dependencies
RUN npm install

# Expose port
EXPOSE 5050

# Start command
CMD ["node", "server.js"]