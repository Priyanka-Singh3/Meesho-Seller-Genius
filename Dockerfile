# 1. Use Node base image
FROM node:18

# 2. Install Python and venv
RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-venv && \
    python3 -m venv /opt/venv

# 3. Set working directory
WORKDIR /app

# 4. Copy Python dependencies first
COPY backend/python/requirements.txt ./requirements.txt

# 5. Install Python packages in virtual env
RUN /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install -r requirements.txt

# 6. Make venv default
ENV PATH="/opt/venv/bin:$PATH"

# 7. Copy full backend code (after deps)
COPY backend/ .

# 8. Install Node dependencies
RUN npm install

# 9. Expose Node.js port (update if your backend uses a different one)
EXPOSE 3000

# 10. Run backend server
CMD ["node", "server.js"]
