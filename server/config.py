import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10MB
    RATELIMIT_STORAGE_URI = "memory://"
