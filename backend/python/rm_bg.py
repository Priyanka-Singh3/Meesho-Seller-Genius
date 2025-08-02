#!/usr/bin/env python3

#!/usr/bin/env python3

import sys
import io
import os
import base64
import logging
from PIL import Image, ImageColor

# Configure logging to stderr FIRST
logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - %(levelname)s - %(message)s',
    stream=sys.stderr
)
logger = logging.getLogger(__name__)

# Force rembg to use the cached model location
# Try Render path first, fallback to Docker path
model_paths = [
    '/opt/render/project/src/.u2net',  # Render path
    '/root/.u2net',                    # Docker path
    os.path.expanduser('~/.u2net')     # Default fallback
]

for path in model_paths:
    if os.path.exists(path) or not os.environ.get('REMBG_MODELS_PATH'):
        os.environ['REMBG_MODELS_PATH'] = path
        break

# NOW we can use logger safely
logger.info(f"Using model path: {os.environ.get('REMBG_MODELS_PATH')}")

# Global session cache to avoid reloading model
_session_cache = None

def get_rembg_session():
    """Get or create rembg session with silueta model (cached during Docker build)"""
    global _session_cache
    
    if _session_cache is not None:
        return _session_cache
    
    try:
        from rembg import new_session
        
        logger.info("Creating new rembg silueta session...")
        _session_cache = new_session('silueta')
        logger.info("rembg session created successfully")
        return _session_cache
        
    except ImportError as e:
        logger.error("rembg not installed. Please install with: pip install rembg")
        raise ImportError("rembg library is required. Install with: pip install rembg")
    except Exception as e:
        logger.error(f"Failed to create rembg session: {e}")
        raise

def preprocess_image(image, max_size=(800, 800)):  # Reduced from 1024 to 800
    """Preprocess image to optimize for processing - more aggressive resizing"""
    try:
        original_size = image.size
        
        # More aggressive resizing for faster processing
        if image.size[0] > max_size[0] or image.size[1] > max_size[1]:
            ratio = min(max_size[0] / image.size[0], max_size[1] / image.size[1])
            new_size = (int(image.size[0] * ratio), int(image.size[1] * ratio))
            # Use NEAREST for faster resizing (trade quality for speed)
            image = image.resize(new_size, Image.Resampling.NEAREST)
            logger.info(f"Resized image from {original_size} to {image.size}")
        
        # Convert to RGB if not already (removes alpha channel complexity)
        if image.mode in ('RGBA', 'LA', 'P'):
            # Create white background for transparent images
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            if image.mode in ('RGBA', 'LA'):
                background.paste(image, mask=image.split()[-1])
                image = background
            else:
                image = image.convert('RGB')
        
        return image
    except Exception as e:
        logger.error(f"Image preprocessing error: {e}")
        return image

def remove_background_rembg(image_bytes, bg_color='#ffffff'):
    """Remove background using rembg with optimizations"""
    try:
        from rembg import remove
        
        # Get cached session
        session = get_rembg_session()
        
        logger.info("Removing background with rembg silueta...")
        
        # Remove background
        output_bytes = remove(image_bytes, session=session)
        
        # Convert to PIL Image
        output_image = Image.open(io.BytesIO(output_bytes)).convert("RGBA")
        logger.info(f"Background removed, output size: {output_image.size}")
        
        # Parse background color
        try:
            bg_rgb = ImageColor.getrgb(bg_color)
        except ValueError:
            logger.warning(f"Invalid color format: {bg_color}, using white")
            bg_rgb = (255, 255, 255)
        
        # Create background with the specified color
        background = Image.new("RGB", output_image.size, bg_rgb)  # Use RGB instead of RGBA
        
        # Paste the foreground onto background using alpha channel as mask
        background.paste(output_image, (0, 0), output_image)
        
        # Save to bytes with lower quality for speed
        buffered = io.BytesIO()
        background.save(buffered, format="JPEG", quality=85, optimize=True)  # JPEG is faster than PNG
        
        logger.info("Background replacement completed successfully")
        return buffered.getvalue()
        
    except Exception as e:
        logger.error(f"Background removal failed: {e}")
        raise

def main():
    try:
        # Step 1: Read background color from CLI args
        bg_color = sys.argv[1] if len(sys.argv) > 1 else '#ffffff'
        logger.info(f"Processing with background color: {bg_color}")
        
        # Step 2: Load input image from stdin
        try:
            if sys.platform == 'win32':
                import msvcrt
                msvcrt.setmode(sys.stdin.fileno(), os.O_BINARY)
        except Exception as e:
            logger.warning(f"Could not set binary mode for stdin: {e}")
        
        image_bytes = sys.stdin.buffer.read()
        if not image_bytes:
            logger.error("No image data received from stdin")
            sys.exit(1)
            
        logger.info(f"Received image data: {len(image_bytes)} bytes")
        
        # Step 3: Validate and preprocess input image
        try:
            test_image = Image.open(io.BytesIO(image_bytes))
            logger.info(f"Input image size: {test_image.size}, mode: {test_image.mode}")
            
            # Always preprocess to reduce size and complexity
            test_image = preprocess_image(test_image, max_size=(800, 800))  # Smaller max size
            
            # Convert back to bytes
            buffer = io.BytesIO()
            test_image.save(buffer, format='PNG', optimize=True)
            image_bytes = buffer.getvalue()
            logger.info(f"Preprocessed image size: {len(image_bytes)} bytes")
                
        except Exception as e:
            logger.error(f"Failed to load input image: {e}")
            print("Error: Invalid image format", file=sys.stderr)
            sys.exit(1)
        
        # Step 4: Process with rembg
        logger.info("Starting background removal process...")
        try:
            final_bytes = remove_background_rembg(image_bytes, bg_color)
            logger.info(f"Background removal completed, output size: {len(final_bytes)} bytes")
        except MemoryError:
            logger.error("Out of memory during processing")
            print("Error: Image too large for processing", file=sys.stderr)
            sys.exit(1)
        except Exception as e:
            logger.error(f"Background removal failed: {e}")
            print(f"Error: Background removal failed - {e}", file=sys.stderr)
            sys.exit(1)
        
        # Step 5: Convert result to base64 and print to stdout
        try:
            b64_output = base64.b64encode(final_bytes).decode("utf-8")
            print(b64_output, end='')
            sys.stdout.flush()
            logger.info("Processing completed successfully")
        except Exception as e:
            logger.error(f"Failed to encode output: {e}")
            print(f"Error: Failed to encode output - {e}", file=sys.stderr)
            sys.exit(1)
        
    except KeyboardInterrupt:
        logger.info("Processing interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
    
'''
import sys
import io
import os
import base64
import logging
from PIL import Image, ImageColor

# Force rembg to use the cached model location
# Try Render path first, fallback to Docker path
model_paths = [
    '/opt/render/project/src/.u2net',  # Render path
    '/root/.u2net',                    # Docker path
    os.path.expanduser('~/.u2net')     # Default fallback
]

for path in model_paths:
    if os.path.exists(path) or not os.environ.get('REMBG_MODELS_PATH'):
        os.environ['REMBG_MODELS_PATH'] = path
        break

logger.info(f"Using model path: {os.environ.get('REMBG_MODELS_PATH')}")

# Configure logging to stderr
logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - %(levelname)s - %(message)s',
    stream=sys.stderr
)
logger = logging.getLogger(__name__)

# Global session cache to avoid reloading model
_session_cache = None

def get_rembg_session():
    """Get or create rembg session with silueta model (cached during Docker build)"""
    global _session_cache
    
    if _session_cache is not None:
        return _session_cache
    
    try:
        from rembg import new_session
        
        logger.info("Creating new rembg silueta session...")
        _session_cache = new_session('silueta')
        logger.info("rembg session created successfully")
        return _session_cache
        
    except ImportError as e:
        logger.error("rembg not installed. Please install with: pip install rembg")
        raise ImportError("rembg library is required. Install with: pip install rembg")
    except Exception as e:
        logger.error(f"Failed to create rembg session: {e}")
        raise

def preprocess_image(image, max_size=(800, 800)):  # Reduced from 1024 to 800
    """Preprocess image to optimize for processing - more aggressive resizing"""
    try:
        original_size = image.size
        
        # More aggressive resizing for faster processing
        if image.size[0] > max_size[0] or image.size[1] > max_size[1]:
            ratio = min(max_size[0] / image.size[0], max_size[1] / image.size[1])
            new_size = (int(image.size[0] * ratio), int(image.size[1] * ratio))
            # Use NEAREST for faster resizing (trade quality for speed)
            image = image.resize(new_size, Image.Resampling.NEAREST)
            logger.info(f"Resized image from {original_size} to {image.size}")
        
        # Convert to RGB if not already (removes alpha channel complexity)
        if image.mode in ('RGBA', 'LA', 'P'):
            # Create white background for transparent images
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            if image.mode in ('RGBA', 'LA'):
                background.paste(image, mask=image.split()[-1])
                image = background
            else:
                image = image.convert('RGB')
        
        return image
    except Exception as e:
        logger.error(f"Image preprocessing error: {e}")
        return image

def remove_background_rembg(image_bytes, bg_color='#ffffff'):
    """Remove background using rembg with optimizations"""
    try:
        from rembg import remove
        
        # Get cached session
        session = get_rembg_session()
        
        logger.info("Removing background with rembg silueta...")
        
        # Remove background
        output_bytes = remove(image_bytes, session=session)
        
        # Convert to PIL Image
        output_image = Image.open(io.BytesIO(output_bytes)).convert("RGBA")
        logger.info(f"Background removed, output size: {output_image.size}")
        
        # Parse background color
        try:
            bg_rgb = ImageColor.getrgb(bg_color)
        except ValueError:
            logger.warning(f"Invalid color format: {bg_color}, using white")
            bg_rgb = (255, 255, 255)
        
        # Create background with the specified color
        background = Image.new("RGB", output_image.size, bg_rgb)  # Use RGB instead of RGBA
        
        # Paste the foreground onto background using alpha channel as mask
        background.paste(output_image, (0, 0), output_image)
        
        # Save to bytes with lower quality for speed
        buffered = io.BytesIO()
        background.save(buffered, format="JPEG", quality=85, optimize=True)  # JPEG is faster than PNG
        
        logger.info("Background replacement completed successfully")
        return buffered.getvalue()
        
    except Exception as e:
        logger.error(f"Background removal failed: {e}")
        raise

def main():
    try:
        # Step 1: Read background color from CLI args
        bg_color = sys.argv[1] if len(sys.argv) > 1 else '#ffffff'
        logger.info(f"Processing with background color: {bg_color}")
        
        # Step 2: Load input image from stdin
        try:
            if sys.platform == 'win32':
                import msvcrt
                msvcrt.setmode(sys.stdin.fileno(), os.O_BINARY)
        except Exception as e:
            logger.warning(f"Could not set binary mode for stdin: {e}")
        
        image_bytes = sys.stdin.buffer.read()
        if not image_bytes:
            logger.error("No image data received from stdin")
            sys.exit(1)
            
        logger.info(f"Received image data: {len(image_bytes)} bytes")
        
        # Step 3: Validate and preprocess input image
        try:
            test_image = Image.open(io.BytesIO(image_bytes))
            logger.info(f"Input image size: {test_image.size}, mode: {test_image.mode}")
            
            # Always preprocess to reduce size and complexity
            test_image = preprocess_image(test_image, max_size=(800, 800))  # Smaller max size
            
            # Convert back to bytes
            buffer = io.BytesIO()
            test_image.save(buffer, format='PNG', optimize=True)
            image_bytes = buffer.getvalue()
            logger.info(f"Preprocessed image size: {len(image_bytes)} bytes")
                
        except Exception as e:
            logger.error(f"Failed to load input image: {e}")
            print("Error: Invalid image format", file=sys.stderr)
            sys.exit(1)
        
        # Step 4: Process with rembg
        logger.info("Starting background removal process...")
        try:
            final_bytes = remove_background_rembg(image_bytes, bg_color)
            logger.info(f"Background removal completed, output size: {len(final_bytes)} bytes")
        except MemoryError:
            logger.error("Out of memory during processing")
            print("Error: Image too large for processing", file=sys.stderr)
            sys.exit(1)
        except Exception as e:
            logger.error(f"Background removal failed: {e}")
            print(f"Error: Background removal failed - {e}", file=sys.stderr)
            sys.exit(1)
        
        # Step 5: Convert result to base64 and print to stdout
        try:
            b64_output = base64.b64encode(final_bytes).decode("utf-8")
            print(b64_output, end='')
            sys.stdout.flush()
            logger.info("Processing completed successfully")
        except Exception as e:
            logger.error(f"Failed to encode output: {e}")
            print(f"Error: Failed to encode output - {e}", file=sys.stderr)
            sys.exit(1)
        
    except KeyboardInterrupt:
        logger.info("Processing interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()

import sys
import io
import os
import base64
import logging
from PIL import Image, ImageColor

# Configure logging to stderr (so it doesn't interfere with stdout output)
logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - %(levelname)s - %(message)s',
    stream=sys.stderr  # Important: log to stderr, not stdout
)
logger = logging.getLogger(__name__)

# Global session cache to avoid reloading model
_session_cache = None

def get_rembg_session():
    """
    Get or create rembg session with u2net model
    This caches the session to avoid reloading on each request
    """
    global _session_cache
    
    if _session_cache is not None:
        return _session_cache
    
    try:
        from rembg import new_session
        
        logger.info("Creating new rembg u2net session...")
        # u2net model: ~176MB, good balance of speed and quality
        _session_cache = new_session('u2net')
        logger.info("rembg session created successfully")
        return _session_cache
        
    except ImportError as e:
        logger.error("rembg not installed. Please install with: pip install rembg")
        raise ImportError("rembg library is required. Install with: pip install rembg")
    except Exception as e:
        logger.error(f"Failed to create rembg session: {e}")
        raise

def preprocess_image(image, max_size=(1024, 1024)):
    """
    Preprocess image to optimize for processing
    """
    try:
        original_size = image.size
        
        # Resize if image is too large (speeds up processing significantly)
        if image.size[0] > max_size[0] or image.size[1] > max_size[1]:
            # Calculate new size maintaining aspect ratio
            ratio = min(max_size[0] / image.size[0], max_size[1] / image.size[1])
            new_size = (int(image.size[0] * ratio), int(image.size[1] * ratio))
            image = image.resize(new_size, Image.Resampling.LANCZOS)
            logger.info(f"Resized image from {original_size} to {image.size}")
        
        return image
    except Exception as e:
        logger.error(f"Image preprocessing error: {e}")
        return image  # Return original if preprocessing fails

def remove_background_rembg(image_bytes, bg_color='#ffffff'):
    """
    Remove background using rembg and apply new background color
    """
    try:
        from rembg import remove
        
        # Get cached session
        session = get_rembg_session()
        
        logger.info("Removing background with rembg u2net...")
        
        # Remove background (returns bytes with transparent background)
        output_bytes = remove(image_bytes, session=session)
        
        # Convert to PIL Image
        output_image = Image.open(io.BytesIO(output_bytes)).convert("RGBA")
        logger.info(f"Background removed, output size: {output_image.size}")
        
        # Parse background color
        try:
            bg_rgb = ImageColor.getrgb(bg_color)
        except ValueError:
            logger.warning(f"Invalid color format: {bg_color}, using white")
            bg_rgb = (255, 255, 255)
        
        # Create background with the specified color
        background = Image.new("RGBA", output_image.size, bg_rgb + (255,))
        
        # Composite the image with the new background
        final_image = Image.alpha_composite(background, output_image)
        
        # Convert to RGB for final output (smaller file size)
        final_rgb = final_image.convert("RGB")
        
        # Save to bytes with optimization
        buffered = io.BytesIO()
        final_rgb.save(buffered, format="PNG", optimize=True, compress_level=6)
        
        logger.info("Background replacement completed successfully")
        return buffered.getvalue()
        
    except Exception as e:
        logger.error(f"Background removal failed: {e}")
        raise

def main():
    try:
        # --- Step 1: Read background color from CLI args ---
        bg_color = sys.argv[1] if len(sys.argv) > 1 else '#ffffff'
        logger.info(f"Processing with background color: {bg_color}")
        
        # --- Step 2: Load input image from stdin ---
        # Handle both Windows and Unix stdin properly
        try:
            if sys.platform == 'win32':
                import msvcrt
                msvcrt.setmode(sys.stdin.fileno(), os.O_BINARY)
        except Exception as e:
            logger.warning(f"Could not set binary mode for stdin: {e}")
        
        # Read with timeout to avoid hanging
        image_bytes = sys.stdin.buffer.read()
        if not image_bytes:
            logger.error("No image data received from stdin")
            sys.exit(1)
            
        logger.info(f"Received image data: {len(image_bytes)} bytes")
        
        # --- Step 3: Validate input image ---
        try:
            test_image = Image.open(io.BytesIO(image_bytes))
            logger.info(f"Input image size: {test_image.size}, mode: {test_image.mode}")
            
            # Preprocess image if it's very large
            if test_image.size[0] > 2048 or test_image.size[1] > 2048:
                test_image = preprocess_image(test_image, max_size=(2048, 2048))
                # Convert back to bytes
                buffer = io.BytesIO()
                test_image.save(buffer, format='PNG')
                image_bytes = buffer.getvalue()
                logger.info(f"Preprocessed image to reduce size")
                
        except Exception as e:
            logger.error(f"Failed to load input image: {e}")
            print("Error: Invalid image format", file=sys.stderr)
            sys.exit(1)
        
        # --- Step 4: Process with rembg ---
        logger.info("Starting background removal process...")
        try:
            final_bytes = remove_background_rembg(image_bytes, bg_color)
            logger.info(f"Background removal completed, output size: {len(final_bytes)} bytes")
        except MemoryError:
            logger.error("Out of memory during processing")
            print("Error: Image too large for processing", file=sys.stderr)
            sys.exit(1)
        except Exception as e:
            logger.error(f"Background removal failed: {e}")
            print(f"Error: Background removal failed - {e}", file=sys.stderr)
            sys.exit(1)
        
        # --- Step 5: Convert result to base64 and print to stdout ---
        try:
            b64_output = base64.b64encode(final_bytes).decode("utf-8")
            
            # Important: Only print the base64 string to stdout, nothing else
            print(b64_output, end='')  # No newline to avoid issues
            sys.stdout.flush()  # Ensure output is sent immediately
            
            logger.info("Processing completed successfully")
        except Exception as e:
            logger.error(f"Failed to encode output: {e}")
            print(f"Error: Failed to encode output - {e}", file=sys.stderr)
            sys.exit(1)
        
    except KeyboardInterrupt:
        logger.info("Processing interrupted by user")
        sys.exit(1)
    except ImportError as e:
        logger.error(f"Missing dependency: {e}")
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()'''


'''import sys
import io
import base64
import os
import pickle
import logging
from PIL import Image, ImageColor
from transformers import pipeline
import torch

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Global model cache
_model_cache = None
MODEL_CACHE_FILE = "/tmp/rmbg_model_cache.pkl"

def load_or_create_model():
    """
    Load model from cache or create new one
    This significantly reduces startup time for subsequent calls
    """
    global _model_cache
    
    if _model_cache is not None:
        return _model_cache
    
    try:
        # Try to load from cache file first
        if os.path.exists(MODEL_CACHE_FILE):
            logger.info("Loading model from cache...")
            with open(MODEL_CACHE_FILE, 'rb') as f:
                _model_cache = pickle.load(f)
                logger.info("Model loaded from cache successfully")
                return _model_cache
    except Exception as e:
        logger.warning(f"Failed to load model from cache: {e}")
    
    # Create new model if cache doesn't exist or failed to load
    logger.info("Creating new model instance...")
    try:
        # Use GPU if available for faster processing
        device = 0 if torch.cuda.is_available() else -1
        if device == 0:
            logger.info("Using GPU for processing")
        else:
            logger.info("Using CPU for processing")
            
        _model_cache = pipeline(
            "image-segmentation", 
            model="briaai/RMBG-1.4", 
            trust_remote_code=True,
            device=device,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32  # Use half precision on GPU
        )
        
        # Cache the model for future use
        try:
            with open(MODEL_CACHE_FILE, 'wb') as f:
                pickle.dump(_model_cache, f)
            logger.info("Model cached successfully")
        except Exception as e:
            logger.warning(f"Failed to cache model: {e}")
            
        logger.info("Model created successfully")
        return _model_cache
        
    except Exception as e:
        logger.error(f"Failed to create model: {e}")
        raise

def preprocess_image(image, max_size=(1024, 1024), quality=90):
    """
    Preprocess image to optimize for model processing
    """
    try:
        original_size = image.size
        
        # Resize if image is too large (speeds up processing significantly)
        if image.size[0] > max_size[0] or image.size[1] > max_size[1]:
            # Calculate new size maintaining aspect ratio
            ratio = min(max_size[0] / image.size[0], max_size[1] / image.size[1])
            new_size = (int(image.size[0] * ratio), int(image.size[1] * ratio))
            image = image.resize(new_size, Image.Resampling.LANCZOS)
            logger.info(f"Resized image from {original_size} to {image.size}")
        
        return image
    except Exception as e:
        logger.error(f"Image preprocessing error: {e}")
        return image  # Return original if preprocessing fails

def optimize_output_image(image, bg_rgb, optimize_size=True):
    """
    Optimize the final output image
    """
    try:
        # Create background with the selected color
        background = Image.new("RGBA", image.size, bg_rgb + (255,))
        composited = Image.alpha_composite(background, image)
        
        # Convert to RGB for final output (smaller file size)
        final_image = composited.convert("RGB")
        
        # Optionally compress the output
        if optimize_size:
            # Save with optimization
            buffered = io.BytesIO()
            final_image.save(buffered, format="PNG", optimize=True, compress_level=6)
            return buffered.getvalue()
        else:
            buffered = io.BytesIO()
            final_image.save(buffered, format="PNG")
            return buffered.getvalue()
            
    except Exception as e:
        logger.error(f"Output optimization error: {e}")
        # Fallback to basic processing
        background = Image.new("RGBA", image.size, bg_rgb + (255,))
        composited = Image.alpha_composite(background, image)
        buffered = io.BytesIO()
        composited.convert("RGB").save(buffered, format="PNG")
        return buffered.getvalue()

def main():
    try:
        # --- Step 1: Read background color from CLI args ---
        bg_color = sys.argv[1] if len(sys.argv) > 1 else '#ffffff'
        try:
            bg_rgb = ImageColor.getrgb(bg_color)
        except ValueError:
            logger.error(f"Invalid color format: {bg_color}")
            bg_rgb = (255, 255, 255)  # Default to white
        
        logger.info(f"Processing with background color: {bg_color} -> {bg_rgb}")
        
        # --- Step 2: Load input image from stdin ---
        image_bytes = sys.stdin.buffer.read()
        if not image_bytes:
            logger.error("No image data received from stdin")
            sys.exit(1)
            
        try:
            input_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            logger.info(f"Input image size: {input_image.size}")
        except Exception as e:
            logger.error(f"Failed to load input image: {e}")
            sys.exit(1)
        
        # --- Step 3: Preprocess image for faster processing ---
        input_image = preprocess_image(input_image)
        
        # --- Step 4: Load Hugging Face background removal model ---
        pipe = load_or_create_model()
        
        # --- Step 5: Run the model to get image with transparent background ---
        logger.info("Running background removal model...")
        try:
            # Process with error handling
            with torch.no_grad():  # Disable gradient computation for inference
                output_image = pipe(input_image)
            logger.info("Background removal completed successfully")
        except Exception as e:
            logger.error(f"Model processing failed: {e}")
            sys.exit(1)
        
        # --- Step 6: Optimize and create final output ---
        logger.info("Creating final output...")
        final_bytes = optimize_output_image(output_image, bg_rgb, optimize_size=True)
        
        # --- Step 7: Convert result to base64 and print ---
        b64_output = base64.b64encode(final_bytes).decode("utf-8")
        print(b64_output)
        
        logger.info("Processing completed successfully")
        
    except KeyboardInterrupt:
        logger.info("Processing interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()'''