"""Optional CPU CLIP inference on the three fixed scene candidates.

Install requirements-clip.txt in a separate environment. The first run may
download the pinned Hugging Face model; --local-files-only disables downloads.
The offline evidence checker does not import this script or load model weights.
"""
import argparse
import hashlib
import os
from pathlib import Path
from common import CHAPTER, new_output_dir, write_json

MODEL = "openai/clip-vit-base-patch32"
REVISION = "3d74acf9a28c67741b2f4f2ea7635f0aaf6f0268"
CHOICES = [
    ("umbrella_blue_door", "01-umbrella.png"),
    ("red_car", "candidate-red-car.png"),
    ("umbrella_grass", "candidate-umbrella-grass.png"),
]
QUERIES = [
    ("umbrella", "a photo of an umbrella"),
    ("red_umbrella_blue_door", "a red umbrella leaning against a blue door after rain"),
    ("red_car", "a red car on a street"),
    ("umbrella_grass", "an open umbrella on green grass on a sunny day"),
    ("blue_umbrella_red_door", "a blue umbrella leaning against a red door"),
]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out-dir", help="Empty output directory; default: repository runs/ch03-clip-<UTC>.")
    parser.add_argument("--local-files-only", action="store_true", help="Use cached weights only; never download.")
    args = parser.parse_args()
    output = new_output_dir(args.out_dir, "clip")
    os.environ["TOKENIZERS_PARALLELISM"] = "false"
    import numpy as np
    import torch
    from PIL import Image
    from transformers import CLIPModel, CLIPProcessor

    torch.set_num_threads(4)
    media = CHAPTER / "assets" / "inputs"
    images = [Image.open(media / filename).convert("RGB") for _, filename in CHOICES]
    print("Loading pinned CLIP processor and model on CPU.", flush=True)
    options = {"revision": REVISION, "local_files_only": args.local_files_only}
    processor = CLIPProcessor.from_pretrained(MODEL, use_fast=False, **options)
    model = CLIPModel.from_pretrained(MODEL, **options).eval().to("cpu")
    input_dir = output / "clip-inputs"
    input_dir.mkdir()

    def run_condition(candidates, condition):
        batch = processor(text=[query for _, query in QUERIES], images=candidates,
                          return_tensors="pt", padding=True)
        with torch.inference_mode():
            prediction = model(**batch)
            cosine = prediction.text_embeds @ prediction.image_embeds.T
            logits = prediction.logits_per_text
            probabilities = logits.softmax(dim=-1)
        mean = np.array(processor.image_processor.image_mean)
        std = np.array(processor.image_processor.image_std)
        paths = []
        for index, (key, _) in enumerate(CHOICES):
            pixels = batch["pixel_values"][index].cpu().numpy().transpose(1, 2, 0)
            rgb = np.rint(np.clip(pixels * std + mean, 0, 1) * 255).astype(np.uint8)
            path = input_dir / f"{condition}-{key}.png"
            Image.fromarray(rgb).save(path)
            paths.append(path.relative_to(output).as_posix())
        records = []
        for index, (query_id, query) in enumerate(QUERIES):
            ranking = sorted(range(len(CHOICES)), key=lambda j: -float(cosine[index, j]))
            records.append({"id": query_id, "query": query, "ranking": [
                {"imageId": CHOICES[j][0], "cosine": float(cosine[index, j]),
                 "logit": float(logits[index, j]), "candidateSoftmax": float(probabilities[index, j])}
                for j in ranking]})
        return records, cosine.tolist(), paths

    records, matrix, crop_paths = run_condition(images, "center-crop")
    fill = tuple(round(value * 255) for value in processor.image_processor.image_mean)
    padded = []
    for image in images:
        side = max(image.size)
        canvas = Image.new("RGB", (side, side), fill)
        canvas.paste(image, ((side - image.width) // 2, (side - image.height) // 2))
        padded.append(canvas)
    control_records, control_matrix, control_paths = run_condition(padded, "letterbox")
    info = {
        "pathBase": "record_directory",
        "preprocessing": {
            "default": "official shortest-edge resize to224, center crop224",
            "originalInputs": crop_paths,
            "control": "center original image on square CLIP-mean-colored canvas before identical official processor",
            "controlFillRGB": fill, "controlInputs": control_paths,
            "processor": processor.image_processor.to_dict(),
        },
        "letterboxQueries": control_records, "letterboxRawCosineMatrix": control_matrix,
        "model": MODEL, "modelCommit": getattr(model.config, "_commit_hash", None),
        "device": "cpu", "torchVersion": torch.__version__, "queryLanguage": "English",
        "images": [{"id": key,
                    "file": Path(os.path.relpath(media / filename, output)).as_posix(),
                    "sha256": hashlib.sha256((media / filename).read_bytes()).hexdigest()}
                   for key, filename in CHOICES],
        "queries": records, "rawCosineMatrix": matrix,
        "logitScale": float(model.logit_scale.detach().exp()),
        "note": "Real inference of pretrained CLIP on three generated candidate images. Scores are candidate similarities, not calibrated correctness probabilities or open-domain benchmark accuracy.",
    }
    write_json(output / "clip_retrieval.json", info)
    print(f"Saved real inference and exact 224 x 224 model inputs to {output}", flush=True)


if __name__ == "__main__":
    main()
