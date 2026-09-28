"""Paths and provenance for new teaching runs; archived evidence is read-only."""
from pathlib import Path
import hashlib
import platform
import sys

import numpy as np
import torch


def fresh_run(path):
    path = Path(path).resolve()
    if path.exists() and (not path.is_dir() or any(path.iterdir())):
        raise ValueError(f"Use a new or empty --run-dir: {path}")
    path.mkdir(parents=True, exist_ok=True)
    (path / "checkpoints").mkdir()
    return path


def device_name(requested):
    device = "cuda" if requested == "auto" and torch.cuda.is_available() else requested
    if device == "auto":
        device = "cpu"
    if device == "cuda" and not torch.cuda.is_available():
        raise ValueError("CUDA is unavailable; use --device cpu")
    return device


def provenance(script, device, smoke):
    return {
        "code_sha256": hashlib.sha256(Path(script).read_bytes()).hexdigest(),
        "python": sys.version.split()[0],
        "platform": platform.platform(),
        "torch": torch.__version__,
        "numpy": np.__version__,
        "device": device,
        "smoke": smoke,
        "scope": "New run; smoke results only check execution, not model quality",
    }
