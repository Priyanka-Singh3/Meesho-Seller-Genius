import sys
import io
import base64
from PIL import Image, ImageColor
from transformers import pipeline

# --- Step 1: Read background color from CLI args ---
bg_color = sys.argv[1] if len(sys.argv) > 1 else '#ffffff'
bg_rgb = ImageColor.getrgb(bg_color)

# --- Step 2: Load input image from stdin ---
image_bytes = sys.stdin.buffer.read()
input_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

# --- Step 3: Load Hugging Face background removal model ---
pipe = pipeline("image-segmentation", model="briaai/RMBG-1.4", trust_remote_code=True)

# --- Step 4: Run the model to get image with transparent background ---
output_image = pipe(input_image)  # Returns a PIL Image with transparency (RGBA)

# --- Step 5: Create a new background of the selected color ---
background = Image.new("RGBA", output_image.size, bg_rgb + (255,))  # Solid color with full alpha
composited = Image.alpha_composite(background, output_image)

# --- Step 6: Convert result to base64 PNG and print ---
buffered = io.BytesIO()
composited.convert("RGB").save(buffered, format="PNG")
b64_output = base64.b64encode(buffered.getvalue()).decode("utf-8")
print(b64_output)