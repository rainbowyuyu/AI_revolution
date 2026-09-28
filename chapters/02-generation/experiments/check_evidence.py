"""Check archived chapter-02 evidence; no training and no writes unless --report is set."""
import argparse
import hashlib
import json
import math
from pathlib import Path
import platform
import sys
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]


def require(condition, message):
    if not condition:
        raise ValueError(message)


def light_checks():
    manifest = json.loads((ROOT / "results/artifact-manifest.json").read_text(encoding="utf8"))
    for item in manifest["files"]:
        path = ROOT / item["path"]
        require(path.is_file(), f"Missing {item['path']}")
        require(path.stat().st_size == item["bytes"], f"Size changed: {item['path']}")
        require(hashlib.sha256(path.read_bytes()).hexdigest() == item["sha256"], f"Hash changed: {item['path']}")
    dist = json.loads((ROOT / "results/distributions-v5.json").read_text(encoding="utf8"))
    digits = json.loads((ROOT / "results/digits.json").read_text(encoding="utf8"))
    summary = json.loads((ROOT / "results/experiment-summary-v5.json").read_text(encoding="utf8"))
    for data, name in [(dist, "train_distributions_v5.py"), (digits, "train_digits.py")]:
        original = ROOT / "experiments/original" / name
        require(hashlib.sha256(original.read_bytes()).hexdigest() == data["code_sha256"], f"Historical code mismatch: {name}")
    require(dist["configuration"]["seeds"] == [12, 25, 2003], "Wrong distribution seeds")
    require(dist["configuration"]["steps"] == 6000, "Wrong distribution steps")
    for model in ("gan", "ddpm"):
        require([row["seed"] for row in dist[model]] == [12, 25, 2003], f"Missing {model} runs")
        for row, brief in zip(dist[model], summary[model]):
            require(row["steps"] == 6000 and len(row["samples"]) == 2048, "Wrong run size")
            require(all(row[key] == brief[key] for key in brief), "Summary differs from full result")
            counts, distances = [0]*8, []
            for point in row["samples"]:
                require(len(point) == 2 and all(math.isfinite(x) for x in point), "Invalid 2-D sample")
                ds = [math.dist(point, center) for center in dist["centers"]]
                nearest = min(range(8), key=ds.__getitem__)
                distances.append(ds[nearest])
                if ds[nearest] < .36:
                    counts[nearest] += 1
            metrics = row["metrics"]
            require(counts == metrics["mode_counts"], "Rounded sample counts differ")
            require(sum(counts)/2048 == metrics["near_mode_fraction"], "Near-mode fraction differs")
            require(sum(c >= 10 for c in counts) == metrics["covered_modes"], "Coverage differs")
            require(abs(sum(distances)/2048 - metrics["mean_nearest_distance"]) < 1e-5, "Distance exceeds rounding tolerance")
            require([x["step"] for x in row["history"]] == list(range(0, 6000, 50)), "Incomplete loss history")
            if model == "ddpm":
                require([x["t"] for x in row["trajectory"]] == [200] + list(range(196, -1, -4)), "Incomplete DDPM trajectory")
                require(row["trajectory"][-1]["points"] == row["samples"][:256], "Final trajectory differs")
            else:
                require(row["snapshots"][0]["step"] == 0 and row["snapshots"][-1]["step"] == 6000, "Incomplete GAN snapshots")
    require(digits["seed"] == 42, "Wrong MNIST seed")
    require(digits["gan_steps"] == digits["ddpm_steps"] == 3000, "Wrong MNIST steps")
    require(digits["data"]["train"] == 55000 and digits["data"]["validation"] == 5000, "Wrong MNIST split")
    require(0 < digits["validation_noise_mse"] < 1, "Invalid historical MNIST validation loss")
    for model in ("gan", "ddpm"):
        require([x["step"] for x in digits[model]] == list(range(0, 3000, 50)), "Incomplete MNIST loss history")
    return {"archived_files_hashed": len(manifest["files"]), "distribution_runs_recounted": 6,
            "historical_code_hashes_matched": 2, "digits_seed": 42}


def deep_checks(device):
    import numpy as np
    import torch
    from PIL import Image
    import train_distributions_v5 as dist_code
    import train_digits as digits_code

    require(device != "cuda" or torch.cuda.is_available(), "CUDA unavailable")
    torch.set_num_threads(2)
    dist = json.loads((ROOT / "results/distributions-v5.json").read_text(encoding="utf8"))
    details = []
    # The original two-dimensional runs used CPU. Keep that path for numerical checks.
    for model in ("gan", "ddpm"):
        for row in dist[model]:
            seed = row["seed"]
            ckpt = torch.load(ROOT / f"checkpoints/{model}-v5-{seed}.pt", map_location="cpu", weights_only=True)
            require(ckpt["seed"] == seed and ckpt["steps"] == 6000, "Checkpoint metadata differs")
            if model == "gan":
                net, disc = dist_code.mlp(2, 2), dist_code.mlp(2, 1)
                net.load_state_dict(ckpt["generator"])
                disc.load_state_dict(ckpt["discriminator"])
            else:
                net = dist_code.Denoiser()
                net.load_state_dict(ckpt["model"])
            net.eval()
            torch.manual_seed(seed + 10000)
            x = torch.randn(2048, 2)
            with torch.no_grad():
                if model == "gan":
                    x = net(x)
                else:
                    beta = ckpt["beta"]
                    require(torch.equal(beta, torch.linspace(.0001, .05, 200)), "Wrong 2-D beta schedule")
                    alpha, abar = 1-beta, (1-beta).cumprod(0)
                    for t in reversed(range(200)):
                        eps = net(x, torch.full((len(x),), t))
                        mean = (x - beta[t]/(1-abar[t]).sqrt()*eps)/alpha[t].sqrt()
                        variance = beta[t]*(1-(abar[t-1] if t else torch.tensor(1.)))/(1-abar[t])
                        x = mean + variance.sqrt()*torch.randn_like(x) if t else mean
                error = float(np.abs(x.numpy() - np.asarray(row["samples"])).max())
                require(error < 2e-5, f"{model} seed {seed}: sample error {error}")
                for key in ("mode_counts", "covered_modes", "near_mode_fraction"):
                    require(dist_code.stats(x)[key] == row["metrics"][key], f"Recomputed {key} differs")
            details.append({"model": model, "seed": seed, "max_sample_abs_error": error})

    gan = torch.load(ROOT / "checkpoints/digits-gan-42.pt", map_location=device, weights_only=True)
    g = torch.nn.Sequential(torch.nn.Linear(64,256), torch.nn.LeakyReLU(.2),
                            torch.nn.Linear(256,512), torch.nn.LeakyReLU(.2),
                            torch.nn.Linear(512,784), torch.nn.Tanh()).to(device)
    d = torch.nn.Sequential(torch.nn.Linear(784,256), torch.nn.LeakyReLU(.2),
                            torch.nn.Linear(256,128), torch.nn.LeakyReLU(.2),
                            torch.nn.Linear(128,1)).to(device)
    g.load_state_dict(gan["generator"])
    d.load_state_dict(gan["discriminator"])
    require(gan["steps"] == 3000, "Wrong MNIST GAN steps")
    with torch.no_grad():
        generated = g(torch.zeros(4,64,device=device))
        require(generated.shape == (4,784) and torch.isfinite(d(generated)).all().item(), "MNIST GAN inference failed")

    ckpt = torch.load(ROOT / "checkpoints/digits-ddpm-42.pt", map_location=device, weights_only=True)
    require(ckpt["steps"] == 3000, "Wrong MNIST DDPM steps")
    net = digits_code.TinyUNet().to(device)
    net.load_state_dict(ckpt["model"])
    net.eval()
    beta = ckpt["beta"]
    require(torch.equal(beta, torch.linspace(.0001,.04,200,device=device)), "Wrong MNIST beta schedule")
    alpha, abar = 1-beta, (1-beta).cumprod(0)
    torch.manual_seed(10042)
    x = torch.randn(32,1,28,28,device=device)
    with torch.no_grad():
        for t in reversed(range(200)):
            eps = net(x,torch.full((32,),t,device=device))
            mean = (x-beta[t]/(1-abar[t]).sqrt()*eps)/alpha[t].sqrt()
            variance = beta[t]*(1-(abar[t-1] if t else torch.tensor(1.,device=device)))/(1-abar[t])
            x = mean+variance.sqrt()*torch.randn_like(x) if t else mean
    require(torch.isfinite(x).all().item(), "MNIST DDPM sampling produced nonfinite values")
    samples = ((x.cpu().clamp(-1,1)+1)*127.5).byte().numpy()[:,0]
    saved = np.asarray(Image.open(ROOT / "results/digits/ddpm-t000.png").convert("RGB"))[::4,::4,0]
    saved_samples = np.stack([saved[(i//8)*32+2:(i//8)*32+30,(i%8)*32+2:(i%8)*32+30] for i in range(32)])
    pixel_error = int(np.abs(samples.astype(int)-saved_samples.astype(int)).max())
    # CPU and CUDA have different random streams. Pixel equality applies to the archived CUDA path.
    if device == "cuda":
        require(pixel_error <= 1, f"MNIST CUDA sample grid differs: max pixel error {pixel_error}")
    return {"torch": torch.__version__, "numpy": np.__version__, "distribution_checkpoint_samples": details,
            "mnist_device": device, "mnist_ddpm_samples": 32, "mnist_ddpm_reverse_steps": 200,
            "mnist_grid_compared_to_archived_cuda": device == "cuda",
            "mnist_grid_max_pixel_error": pixel_error if device == "cuda" else None,
            "checkpoints_loaded_with_weights_only": 8,
            "note": "Historical MNIST validation MSE is retained; it is not recomputed by this check."}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--deep", action="store_true", help="Load all 8 checkpoints and resample; requires experiment dependencies")
    parser.add_argument("--device", choices=["cpu", "cuda"], default="cpu", help="Device for MNIST; 2-D evidence always checks CPU")
    parser.add_argument("--report", type=Path, help="Optional new report file; refuses to overwrite an existing report")
    args = parser.parse_args()
    if args.report and args.report.exists():
        parser.error("Use a new --report path")
    result = {"checked_at_utc": datetime.now(timezone.utc).isoformat(), "python": sys.version.split()[0],
              "platform": platform.platform(), "light": light_checks()}
    if args.deep:
        result["deep"] = deep_checks(args.device)
    result["status"] = "passed"
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(result, indent=2), encoding="utf8")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
