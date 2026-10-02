"""Shared output handling: frozen evidence is always read-only."""
from datetime import datetime, timezone
from pathlib import Path
import json

CHAPTER = Path(__file__).resolve().parents[1]
REPOSITORY = CHAPTER.parents[1]
RESULTS = CHAPTER / "results"


def new_output_dir(value=None, label="mechanisms"):
    """Create a unique run directory, or accept an explicitly empty directory.

    Relative --out-dir paths resolve from the caller's working directory.
    Neither an existing evidence directory nor a non-empty run can be overwritten.
    """
    if value is None:
        stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
        destination = REPOSITORY / "runs" / f"ch03-{label}-{stamp}"
    else:
        destination = Path(value).expanduser().resolve()
    destination = destination.resolve()
    if destination == RESULTS.resolve() or RESULTS.resolve() in destination.parents:
        raise ValueError("Frozen results are read-only; choose an empty directory under runs/.")
    if destination.exists() and (not destination.is_dir() or any(destination.iterdir())):
        raise ValueError(f"Output directory must be empty: {destination}")
    destination.mkdir(parents=True, exist_ok=True)
    return destination


def write_json(path, payload):
    Path(path).write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
