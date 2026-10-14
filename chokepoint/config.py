import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
CACHE_DIR = BASE_DIR / ".cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

DEPS_CACHE_DIR = CACHE_DIR / "deps_dev"
DEPS_CACHE_DIR.mkdir(parents=True, exist_ok=True)

OSV_CACHE_DIR = CACHE_DIR / "osv"
OSV_CACHE_DIR.mkdir(parents=True, exist_ok=True)

FALKORDB_HOST = os.getenv("FALKORDB_HOST", "localhost")
FALKORDB_PORT = int(os.getenv("FALKORDB_PORT", "6379"))

# API endpoints
DEPS_DEV_API_BASE = "https://api.deps.dev/v3"
OSV_API_BASE = "https://api.osv.dev/v1"
