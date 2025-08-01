#!/usr/bin/env python3
import sys
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
    main()