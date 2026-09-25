import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
client = genai.Client()

model = os.environ.get("GEMINI_IMAGE_MODEL", "gemini-2.5-flash-image")
try:
    result = client.models.generate_content(
        model=model,
        contents="A cute cat"
    )
    print("Success with generate_content!")
    if result.generated_images:
        print("Got image bytes:", len(result.generated_images[0].image.image_bytes))
    elif result.candidates and result.candidates[0].content.parts:
        print("Got parts:", len(result.candidates[0].content.parts))
except Exception as e:
    print("Failed:", str(e))
