import sys
from transformers import pipeline

def caption_image(image_path):
    pipe = pipeline("image-to-text", model="nlpconnect/vit-gpt2-image-captioning")
    result = pipe(image_path)
    print(result[0]['generated_text'])

if __name__ == "__main__":
    image_path = sys.argv[1]
    caption_image(image_path) 