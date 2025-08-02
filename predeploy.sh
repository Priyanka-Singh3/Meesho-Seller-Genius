#!/bin/bash
# Pre-Deploy Command for Render
# This runs BEFORE your app starts, during deployment

echo "🚀 Starting pre-deploy setup..."

# Set environment variables for model caching
export REMBG_MODELS_PATH=/opt/render/project/src/.u2net
export OMP_NUM_THREADS=2
export MKL_NUM_THREADS=2

# Create model cache directory
mkdir -p /opt/render/project/src/.u2net

echo "📦 Installing Python dependencies..."
# Make sure all Python deps are installed
/opt/venv/bin/pip install --no-cache-dir rembg[cpu] onnxruntime Pillow

echo "🔥 Pre-loading rembg silueta model..."
# Pre-download and cache the model
/opt/venv/bin/python3 -c "
import os
os.environ['REMBG_MODELS_PATH'] = '/opt/render/project/src/.u2net'
from rembg import new_session
import sys

try:
    print('Downloading silueta model...')
    session = new_session('silueta')
    print('✅ Silueta model downloaded and cached successfully!')
    print(f'Model cached in: {os.environ.get(\"REMBG_MODELS_PATH\")}')
    
    # Verify the model works
    print('🧪 Testing model...')
    from rembg import remove
    import io
    from PIL import Image
    
    # Create a small test image
    test_img = Image.new('RGB', (100, 100), color='red')
    test_buffer = io.BytesIO()
    test_img.save(test_buffer, format='PNG')
    test_bytes = test_buffer.getvalue()
    
    # Test background removal
    result = remove(test_bytes, session=session)
    print(f'✅ Model test successful! Output size: {len(result)} bytes')
    
except Exception as e:
    print(f'❌ Model pre-loading failed: {e}')
    sys.exit(1)
"

echo "✅ Pre-deploy setup completed successfully!"