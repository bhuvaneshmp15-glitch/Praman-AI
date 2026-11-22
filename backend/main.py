"""Vercel entrypoint for Praman FastAPI service."""
import sys
from pathlib import Path

# Ensure src/ is on python search path
src_dir = Path(__file__).resolve().parent / "src"
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

from praman_api.main import app
