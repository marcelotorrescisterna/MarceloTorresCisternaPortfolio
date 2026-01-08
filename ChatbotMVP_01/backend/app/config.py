import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"

print("✅ BASE_DIR =", BASE_DIR)
print("✅ ENV_PATH =", ENV_PATH)
print("✅ ENV exists? =", ENV_PATH.exists())
if ENV_PATH.exists():
    print("✅ ENV first lines =", ENV_PATH.read_text(encoding="utf-8")[:200])

loaded = load_dotenv(dotenv_path=ENV_PATH, override=True)
#print("✅ load_dotenv loaded? =", loaded)

def _split_csv(value: str) -> list[str]:
    return [v.strip() for v in value.split(",") if v.strip()]

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openai").lower()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
#print(f"OPEN AI KEEEEEEEEEY : {OPENAI_API_KEY} , {OPENAI_MODEL}")
CORS_ORIGINS = _split_csv(os.getenv("CORS_ORIGINS", "http://localhost:5173"))
