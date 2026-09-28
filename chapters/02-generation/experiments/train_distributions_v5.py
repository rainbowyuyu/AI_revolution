"""Reproducible toy GAN/DDPM run for chapter 02 V5.

Portable entry point adapted from original/train_distributions_v5.py.
The archived V5 evidence uses CPU and seeds 12, 25 and 2003. New output
requires an empty run directory. --smoke checks execution with 10 updates.
"""
from pathlib import Path
import argparse, json, math, time, hashlib
import numpy as np
import torch
from torch import nn

from common import device_name, fresh_run, provenance

DEVICE = "cpu"
torch.set_num_threads(2)

def centers():
    a = torch.arange(8) * 2 * math.pi / 8
    return torch.stack([a.cos(), a.sin()], 1) * 2

def real(n, generator=None):
    k = torch.randint(8, (n,), generator=generator)
    return centers()[k] + torch.randn(n, 2, generator=generator) * .12

def stats(x):
    distance = torch.cdist(x, centers()); nearest = distance.argmin(1)
    accepted = distance.min(1).values < .36
    counts = torch.bincount(nearest[accepted], minlength=8)
    return dict(near_mode_fraction=float(accepted.float().mean()), mode_counts=counts.tolist(),
                covered_modes=int((counts >= 10).sum()),
                coverage_rule='>=10 of 2048 samples within radius .36 of a mode',
                mean_nearest_distance=float(distance.min(1).values.mean()))

def rounded(x):
    return np.round(x.detach().cpu().numpy(), 5).tolist()

def mlp(a, b):
    return nn.Sequential(nn.Linear(a, 128), nn.SiLU(), nn.Linear(128, 128), nn.SiLU(), nn.Linear(128, b))

def gan(seed, steps, checkpoint_dir):
    torch.manual_seed(seed); g = mlp(2, 2); d = mlp(2, 1)
    og = torch.optim.Adam(g.parameters(), lr=.0002, betas=(.5, .999)); od = torch.optim.Adam(d.parameters(), lr=.0002, betas=(.5, .999))
    loss = nn.BCEWithLogitsLoss(); z = torch.randn(256, 2); snapshots = []; history = []
    grid = torch.cartesian_prod(torch.linspace(-3, 3, 25), torch.linspace(-3, 3, 25))
    record = set(range(0, steps + 1, max(1, steps // 40))) | {steps}
    for step in range(steps + 1):
        if step in record:
            with torch.no_grad():
                snapshots.append(dict(step=step, points=rounded(g(z)), discriminator=rounded(d(grid).sigmoid().flatten())))
        if step == steps: break
        x = real(256); fake = g(torch.randn(256, 2))
        ld = loss(d(x), torch.ones(256, 1)) + loss(d(fake.detach()), torch.zeros(256, 1))
        od.zero_grad(); ld.backward(); od.step()
        for p in d.parameters(): p.requires_grad_(False)
        lg = loss(d(g(torch.randn(256, 2))), torch.ones(256, 1))
        og.zero_grad(); lg.backward(); og.step()
        for p in d.parameters(): p.requires_grad_(True)
        if step % 50 == 0: history.append(dict(step=step, g_loss=float(lg.detach()), d_loss=float(ld.detach())))
    with torch.no_grad():
        torch.manual_seed(seed + 10000); samples = g(torch.randn(2048, 2)); report = stats(samples)
        za = torch.tensor([[-1.2, .4]]); zb = torch.tensor([[1.0, -.8]]); weights = torch.linspace(0, 1, 61)[:, None]
        latent = g(za * (1 - weights) + zb * weights)
    torch.save(dict(generator=g.state_dict(), discriminator=d.state_dict(), seed=seed, steps=steps), checkpoint_dir / f'gan-v5-{seed}.pt')
    return dict(seed=seed, steps=steps, snapshots=snapshots, history=history, metrics=report, interpolation=rounded(latent), samples=rounded(samples))

class Denoiser(nn.Module):
    def __init__(self):
        super().__init__(); self.net = mlp(18, 2); self.register_buffer('freq', torch.exp(torch.linspace(0, math.log(1000), 8)))
    def forward(self, x, t):
        phase = t[:, None].float() / 200 * self.freq[None, :]
        return self.net(torch.cat([x, phase.sin(), phase.cos()], 1))

def ddpm(seed, steps, checkpoint_dir):
    torch.manual_seed(seed); net = Denoiser(); optim = torch.optim.Adam(net.parameters(), lr=.001)
    beta = torch.linspace(.0001, .05, 200); alpha = 1 - beta; abar = alpha.cumprod(0); history = []
    for step in range(steps):
        x = real(512); t = torch.randint(200, (512,)); noise = torch.randn_like(x)
        xt = abar[t, None].sqrt() * x + (1 - abar[t, None]).sqrt() * noise
        prediction = net(xt, t); loss = (prediction - noise).square().mean()
        optim.zero_grad(); loss.backward(); optim.step()
        if step % 50 == 0: history.append(dict(step=step, noise_mse=float(loss.detach())))
    torch.manual_seed(seed + 10000); x = torch.randn(2048, 2); trajectory = [dict(t=200, points=rounded(x[:256]))]
    with torch.no_grad():
        for t in reversed(range(200)):
            eps = net(x, torch.full((len(x),), t)); mean = (x - beta[t] / (1 - abar[t]).sqrt() * eps) / alpha[t].sqrt()
            variance = beta[t] * (1 - (abar[t - 1] if t > 0 else torch.tensor(1.))) / (1 - abar[t])
            x = mean + variance.sqrt() * torch.randn_like(x) if t > 0 else mean
            if t % 4 == 0: trajectory.append(dict(t=t, points=rounded(x[:256])))
        report = stats(x); valgen = torch.Generator(device=DEVICE).manual_seed(91234); clean = real(4096, valgen); noise = torch.randn(4096, 2, generator=valgen); t = torch.randint(200, (4096,), generator=valgen)
        xt = abar[t, None].sqrt() * clean + (1 - abar[t, None]).sqrt() * noise; val = float((net(xt, t) - noise).square().mean())
    torch.save(dict(model=net.state_dict(), seed=seed, steps=steps, beta=beta), checkpoint_dir / f'ddpm-v5-{seed}.pt')
    return dict(seed=seed, steps=steps, history=history, metrics=report, validation_noise_mse=val, trajectory=trajectory, samples=rounded(x))

def main():
    global DEVICE
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run-dir", type=Path, required=True)
    parser.add_argument("--steps", type=int, default=6000)
    parser.add_argument("--seeds", nargs="+", type=int, default=[12, 25, 2003])
    parser.add_argument("--device", choices=["cpu", "cuda", "auto"], default="cpu")
    parser.add_argument("--smoke", action="store_true", help="10 updates per model, first seed only")
    args = parser.parse_args()
    if args.steps < 1 or any(seed < 0 or seed > 2**32 - 10001 for seed in args.seeds):
        parser.error("steps must be positive; seeds must be in [0, 2**32 - 10001]")
    DEVICE = device_name(args.device)
    out = fresh_run(args.run_dir)
    steps = 10 if args.smoke else args.steps
    seeds = list(dict.fromkeys(args.seeds))[:1] if args.smoke else list(dict.fromkeys(args.seeds))
    torch.set_default_device(DEVICE)
    result = dict(
        description="Learned 2-D eight-Gaussian teaching distribution",
        configuration=dict(steps=steps, seeds=seeds, target_modes=8, std=.12,
                           ddpm_timesteps=200, gan_batch=256, ddpm_batch=512,
                           eval_samples=2048, eval_seed_offset=10000),
        centers=rounded(centers()),
        target=rounded(real(512, torch.Generator(device=DEVICE).manual_seed(700))),
        gan=[], ddpm=[],
        **provenance(__file__, DEVICE, args.smoke),
    )
    for seed in seeds:
        for name, fn in [("gan", gan), ("ddpm", ddpm)]:
            at = time.perf_counter()
            row = fn(seed, steps, out / "checkpoints")
            row["elapsed_seconds"] = round(time.perf_counter() - at, 2)
            result[name].append(row)
            (out / "distributions-v5.json").write_text(json.dumps(result, separators=(",", ":")), encoding="utf8")
            print(name, seed, row["metrics"], flush=True)
    summary = {name: [{key: row[key] for key in ("seed", "metrics", "elapsed_seconds")}
                      for row in result[name]] for name in ("gan", "ddpm")}
    (out / "experiment-summary-v5.json").write_text(json.dumps(summary, indent=2), encoding="utf8")
    print("Completed", out)


if __name__ == "__main__":
    main()
