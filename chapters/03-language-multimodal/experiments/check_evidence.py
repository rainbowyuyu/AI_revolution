"""Offline numerical and integrity checks; no CLIP download or model inference.

Recomputes the teaching mechanisms, compares an optional independently saved run,
checks the frozen CLIP record's internal consistency, and verifies file hashes.
This is not a replacement for rerunning the pretrained CLIP model.
"""
import argparse
from copy import deepcopy
from datetime import datetime, timezone
import hashlib
import json
import math
import platform
from pathlib import Path
import numpy as np
from PIL import Image
import PIL
from common import CHAPTER, RESULTS, new_output_dir, write_json
from run_mechanisms import compute_results
from run_formula_examples import compute_formula_examples


def read(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def close_tree(actual, expected, path="root", tolerance=1e-12):
    if isinstance(expected, dict):
        assert isinstance(actual, dict) and actual.keys() == expected.keys(), f"{path}: keys differ"
        for key in expected:
            close_tree(actual[key], expected[key], f"{path}.{key}", tolerance)
    elif isinstance(expected, list):
        assert isinstance(actual, list) and len(actual) == len(expected), f"{path}: lengths differ"
        for index, (left, right) in enumerate(zip(actual, expected)):
            close_tree(left, right, f"{path}[{index}]", tolerance)
    elif isinstance(expected, (int, float)) and not isinstance(expected, bool):
        assert isinstance(actual, (int, float)) and math.isfinite(actual), f"{path}: invalid number"
        assert math.isclose(actual, expected, abs_tol=tolerance, rel_tol=0), f"{path}: {actual} != {expected}"
    else:
        assert actual == expected, f"{path}: {actual!r} != {expected!r}"


def chapter_path(relative):
    path = Path(relative)
    assert not path.is_absolute(), f"Absolute published path: {relative}"
    resolved = (CHAPTER / path).resolve()
    assert resolved.is_relative_to(CHAPTER.resolve()), f"Path leaves chapter: {relative}"
    return resolved


def check_hashes():
    manifest = read(RESULTS / "migration-manifest.json")
    for entry in manifest["files"]:
        digest = hashlib.sha256(chapter_path(entry["published"]).read_bytes()).hexdigest()
        assert digest == entry["publishedSha256"], f"Changed evidence: {entry['published']}"
        if entry["transformation"] == "exact byte copy":
            assert digest == entry["sourceSha256"]
        if "originalArchive" in entry:
            original_hash = hashlib.sha256(chapter_path(entry["originalArchive"]).read_bytes()).hexdigest()
            assert original_hash == entry["sourceSha256"]
    for entry in manifest.get("codeProvenance", []):
        digest = hashlib.sha256(chapter_path(entry["published"]).read_bytes()).hexdigest()
        assert digest == entry["publishedSha256"], f"Changed reproduction code: {entry['published']}"
    return len(manifest["files"])


def check_clip():
    clip = read(RESULTS / "clip_retrieval.json")
    original = read(RESULTS / "original" / "clip_retrieval.json")
    normalized = deepcopy(clip)
    assert normalized.pop("pathBase") == "record_directory"
    for item, old in zip(normalized["images"], original["images"]):
        item["file"] = old["file"]
    for key in ("originalInputs", "controlInputs"):
        normalized["preprocessing"][key] = original["preprocessing"][key]
    assert normalized == original, "CLIP migration modified more than file paths"
    assert clip["modelCommit"] == "3d74acf9a28c67741b2f4f2ea7635f0aaf6f0268"
    ids = [image["id"] for image in clip["images"]]
    for item in clip["images"]:
        path = (RESULTS / item["file"]).resolve()
        assert path.is_relative_to(CHAPTER.resolve())
        assert hashlib.sha256(path.read_bytes()).hexdigest() == item["sha256"]
    for key in ("originalInputs", "controlInputs"):
        for relative in clip["preprocessing"][key]:
            path = (RESULTS / relative).resolve()
            assert path.is_relative_to(RESULTS.resolve())
            with Image.open(path) as image:
                assert image.size == (224, 224), f"Bad CLIP input dimensions: {relative}"
    max_logit_error = 0.0
    max_softmax_error = 0.0
    for key, matrix_key in (("queries", "rawCosineMatrix"), ("letterboxQueries", "letterboxRawCosineMatrix")):
        matrix = np.asarray(clip[matrix_key])
        assert matrix.shape == (5, 3) and np.isfinite(matrix).all()
        for row, query in enumerate(clip[key]):
            ranking = query["ranking"]
            assert [item["imageId"] for item in ranking] == [ids[j] for j in np.argsort(-matrix[row], kind="stable")]
            logits = np.array([item["logit"] for item in ranking])
            probabilities = np.exp(logits - logits.max())
            probabilities /= probabilities.sum()
            for index, item in enumerate(ranking):
                assert item["cosine"] == float(matrix[row, ids.index(item["imageId"])])
                logit_error = abs(item["logit"] - item["cosine"] * clip["logitScale"])
                probability_error = abs(item["candidateSoftmax"] - float(probabilities[index]))
                max_logit_error = max(max_logit_error, logit_error)
                max_softmax_error = max(max_softmax_error, probability_error)
                assert logit_error <= 2e-5, "CLIP cosine/logit inconsistency"
                assert probability_error <= 2e-6, "CLIP candidate softmax inconsistency"
    default_car = next(query for query in clip["queries"] if query["id"] == "red_car")
    padded_car = next(query for query in clip["letterboxQueries"] if query["id"] == "red_car")
    assert default_car["ranking"][0]["imageId"] == "umbrella_blue_door"
    assert padded_car["ranking"][0]["imageId"] == "red_car"
    return {"modelInferenceRerun": False, "modelDownloaded": False,
            "pathOnlyMigrationVerified": True, "candidateCount": len(ids),
            "conditions": ["center-crop", "letterbox"],
            "maxCosineToLogitAbsoluteError": max_logit_error,
            "maxCandidateSoftmaxAbsoluteError": max_softmax_error,
            "redCarTop1": {"centerCrop": "umbrella_blue_door", "letterbox": "red_car"},
            "scope": "Frozen record, hashes, rankings and arithmetic verified; not a fresh CLIP inference."}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run-dir", type=Path, help="Also compare JSON from a separate run_mechanisms.py execution.")
    parser.add_argument("--out-dir", help="Empty verification-report directory; default: repository runs/ch03-check-<UTC>.")
    args = parser.parse_args()
    # Python -O must not silently disable this evidence gate.
    if not __debug__:
        raise RuntimeError("Do not use python -O: this checker requires assertions.")
    output = new_output_dir(args.out_dir, "check")
    computed = compute_results()
    for name, value in computed.items():
        close_tree(value, read(RESULTS / f"{name}.json"), name)
        if args.run_dir:
            close_tree(read(args.run_dir / f"{name}.json"), value, f"run.{name}")
    attention = computed["causal_attention"]
    weights = np.asarray(attention["weights"])
    assert np.allclose(weights.sum(axis=1), 1, atol=1e-12)
    assert np.all(weights[np.triu_indices(4, 1)] == 0)
    formulas = compute_formula_examples(attention)
    close_tree(formulas, read(RESULTS / "formula_examples.json"), "formula_examples")
    original_formula = read(RESULTS / "formula-example-evidence-original.json")
    for key in ("norm", "loss"):
        close_tree(formulas[key], original_formula[key], f"original_formula.{key}")
    if args.run_dir:
        close_tree(read(args.run_dir / "formula_examples.json"), formulas, "run.formula_examples")
    for projection in formulas["projection"]["projections"]:
        assert np.asarray(projection["weights"]).shape == (6, 2)
        close_tree(projection["output"], projection["target"], f"projection.{projection['name']}")
    hashed_files = check_hashes()
    clip_report = check_clip()
    report = {
        "status": "pass", "verifiedAt": datetime.now(timezone.utc).isoformat(),
        "environment": {"python": platform.python_version(), "numpy": np.__version__, "Pillow": PIL.__version__},
        "mechanismsRecomputed": list(computed), "absoluteTolerance": 1e-12,
        "independentSavedRunCompared": args.run_dir is not None,
        "formulas": {"normalization": "pass", "crossEntropy": "pass", "constructed6x2QKV": "pass"},
        "hashedEvidenceFiles": hashed_files, "clip": clip_report,
        "metrics": computed["next_token"]["metrics"],
        "limitations": ["Teaching corpora and matrices are deliberately small and constructed.",
                        "The 6 x 2 projection is not a learned network weight.",
                        "CLIP inference was not rerun during migration; only its frozen evidence was checked.",
                        "File hashes support provenance, not an independent reproduction of the original inference."],
    }
    write_json(output / "verification.json", report)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    print(f"Verification report: {output / 'verification.json'}")


if __name__ == "__main__":
    main()
