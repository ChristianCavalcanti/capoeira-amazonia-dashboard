"""
Uvicorn entrypoint wrapper.

This project keeps the FastAPI app in `backend/main.py`, but some deployment
platforms run commands from the repository root. This file makes `uvicorn
main:app` work from the root by dynamically loading `backend/main.py`.
"""

from __future__ import annotations

from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path


_ROOT = Path(__file__).resolve().parent
_BACKEND_MAIN = _ROOT / "backend" / "main.py"

_spec = spec_from_file_location("backend_main", _BACKEND_MAIN)
if _spec is None or _spec.loader is None:
    raise RuntimeError(f"Could not load FastAPI module from: {_BACKEND_MAIN}")

_mod = module_from_spec(_spec)
_spec.loader.exec_module(_mod)

# Re-export for `uvicorn main:app`
app = _mod.app

