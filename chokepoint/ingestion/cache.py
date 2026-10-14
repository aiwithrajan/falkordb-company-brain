import hashlib
import json
from pathlib import Path
from typing import Any, Optional

class DiskCache:
    def __init__(self, directory: Path):
        self.directory = directory
        self.directory.mkdir(parents=True, exist_ok=True)

    def _get_path(self, key: str) -> Path:
        safe_key = hashlib.sha256(key.encode("utf-8")).hexdigest()
        return self.directory / f"{safe_key}.json"

    def get(self, key: str) -> Optional[Any]:
        path = self._get_path(key)
        if path.exists():
            try:
                with open(path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                return None
        return None

    def set(self, key: str, value: Any) -> None:
        path = self._get_path(key)
        try:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(value, f, indent=2)
        except Exception as e:
            print(f"Warning: Failed to write cache for {key}: {e}")
