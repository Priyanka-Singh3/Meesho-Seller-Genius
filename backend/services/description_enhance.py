import sys
from transformers import pipeline

def enhance_description(text):
    pipe = pipeline("summarization", model="t5-base")
    result = pipe(text)
    print(result[0]['summary_text'])

if __name__ == "__main__":
    text = sys.argv[1]
    enhance_description(text) 