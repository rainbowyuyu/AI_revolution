"""Render a small, attributable causal-attention GIF for the repository homepage.

Requires Python 3.10+, Pillow and NumPy; no model, network or training calls.
Run from any directory. Pass --sans-font on systems without the default font.
Stable frames show the four recorded rows. During a row change, a teaching
transition smoothly moves the contour and stretches bars; numerical labels are
hidden until the next recorded row is reached. This is not a training trajectory.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from functools import lru_cache
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
SOURCE = ROOT / "chapters/03-language-multimodal/results/causal_attention.json"
WIDTH, HEIGHT = 960, 420
FPS = 10
HOLD_FRAMES, TRANSITION_FRAMES = 21, 9
NAVY = (5, 14, 23)
IVORY = (247, 237, 215)
GOLD = (217, 187, 136)
TEAL = (135, 189, 187)
MUTED = (144, 161, 173)
LINE = (37, 59, 72)


@lru_cache(maxsize=24)
def font(path: str, size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    f = ImageFont.truetype(path, size)
    if hasattr(f, "get_variation_axes"):
        try:
            axes = f.get_variation_axes()
            f.set_variation_by_axes([
                (650 if bold else 400) if a["name"] == b"Weight" else a["default"]
                for a in axes
            ])
        except (OSError, ValueError):
            pass
    return f


def text(image: Image.Image, xy: tuple[float, float], value: str, size: int,
         color=IVORY, bold=False, anchor="lm") -> None:
    ImageDraw.Draw(image).text(xy, value, font=font(str(ARGS.sans_font), size, bold),
                              fill=color, anchor=anchor)


def blend_color(a: tuple[int, int, int], b: tuple[int, int, int], t: float):
    return tuple(round(x + (y - x) * t) for x, y in zip(a, b))


def read_evidence() -> dict:
    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    q, k, v = (np.asarray(data[name], dtype=float) for name in ("Q", "K", "V"))
    weights = np.asarray(data["weights"], dtype=float)
    if len(data["tokens"]) != 4 or any(x.shape != (4, 2) for x in (q, k, v)):
        raise ValueError("Expected the recorded four-token, two-dimensional example")
    scores = q @ k.T / np.sqrt(q.shape[1])
    masked = np.where(np.tril(np.ones((4, 4), dtype=bool)), scores, -np.inf)
    unnormalized = np.exp(masked - masked.max(axis=1, keepdims=True))
    calculated = unnormalized / unnormalized.sum(axis=1, keepdims=True)
    comparisons = [
        (scores, data["scores"]),
        (weights, calculated),
        (weights @ v, data["output"]),
        (weights.sum(axis=1), data["rowSums"]),
        (weights.sum(axis=1), np.ones(4)),
    ]
    if weights.shape != (4, 4) or not all(
        np.allclose(a, b, rtol=0, atol=1e-12) for a, b in comparisons
    ):
        raise ValueError("Recorded numerical evidence does not agree with Q/K/V")
    for i, row in enumerate(data["maskedScores"]):
        for j, value in enumerate(row):
            if (j > i and value is not None) or (
                j <= i and (value is None or abs(value - scores[i, j]) > 1e-12)
            ):
                raise ValueError("Recorded causal mask does not agree with positions")
    if not data["futureWeightsZero"] or np.any(weights[np.triu_indices(4, 1)] != 0):
        raise ValueError("Future attention must be exactly zero")
    return data


def canvas() -> Image.Image:
    yy, xx = np.mgrid[0:HEIGHT, 0:WIDTH]
    glow = np.exp(-(((xx - WIDTH * .79) / (WIDTH * .5)) ** 2
                    + ((yy - HEIGHT * .28) / (HEIGHT * .85)) ** 2) * 2)
    rgb = np.empty((HEIGHT, WIDTH, 3), dtype=np.uint8)
    for channel, base in enumerate(NAVY):
        rgb[:, :, channel] = base + glow * (4, 12, 15)[channel]
    return Image.fromarray(rgb)


def draw_state(data: dict, active: int, next_row: int | None = None,
               progress: float = 0) -> Image.Image:
    image = canvas()
    d = ImageDraw.Draw(image)
    tokens, weights = data["tokens"], data["weights"]
    transition = next_row is not None
    focus = active + ((next_row - active) * progress if transition else 0)
    shown_weights = np.asarray(weights[active])
    if transition:
        shown_weights = shown_weights * (1 - progress) + np.asarray(weights[next_row]) * progress
    d.rounded_rectangle((34, 35, 38, 68), radius=2, fill=GOLD)
    text(image, (54, 50), "一句话里的注意力", 34, bold=True)
    text(image, (921, 51), "只能使用自身与前文", 22, TEAL, anchor="rm")
    d.line((34, 91, 925, 91), fill=LINE, width=1)

    text(image, (36, 125), "因果权重", 24, bold=True)
    text(image, (262, 125), "× 未来屏蔽", 18, MUTED)
    text(image, (500, 125), "当前词的权重", 27, GOLD, bold=True)
    text(image, (500, 166), "当前位置看向哪些词", 19, MUTED)

    # A fixed 4 x 4 matrix, with a gold contour identifying the selected row.
    # A cross means masked, rather than an unknown or missing attention value.
    grid_x, grid_y, pitch_x, pitch_y = 127, 192, 74, 45
    cell_w, cell_h = 67, 37
    focus_y = grid_y + focus * pitch_y
    focus_cy = focus_y + cell_h / 2
    # Paint the moving contour beneath cells so it never crosses their numbers.
    d.rounded_rectangle((grid_x - 5, focus_y - 5,
                         grid_x + 3 * pitch_x + cell_w + 5, focus_y + cell_h + 5),
                        radius=10, outline=GOLD, width=2)
    for j, token in enumerate(tokens):
        text(image, (grid_x + j * pitch_x + cell_w / 2, 166), token, 23,
             IVORY, anchor="mm")
    for i, token in enumerate(tokens):
        cy = grid_y + i * pitch_y + cell_h / 2
        text(image, (91, cy), token, 24, IVORY, anchor="rm")
        for j, weight in enumerate(weights[i]):
            x, y = grid_x + j * pitch_x, grid_y + i * pitch_y
            if j > i:
                fill = (15, 28, 39)
            else:
                fill = blend_color((22, 46, 57), (80, 132, 134), weight)
            d.rounded_rectangle((x, y, x + cell_w, y + cell_h), radius=6,
                                fill=fill)
            value = "×" if j > i else f"{weight * 100:.1f}"
            text(image, (x + cell_w / 2, cy), value, 21,
                 (86, 108, 122) if j > i else IVORY,
                 anchor="mm")
    d.polygon([(102, focus_cy - 5), (109, focus_cy), (102, focus_cy + 5)], fill=GOLD)

    # Stable bars and labels share the saved values and a fixed 0..100% scale.
    # During the teaching transition only bar lengths are interpolated; every
    # numerical label is hidden so intermediate lengths cannot be read as data.
    bar_x, bar_w = 570, 236
    for j, (token, weight) in enumerate(zip(tokens, shown_weights)):
        cy = grid_y + j * pitch_y + cell_h / 2
        color = blend_color(TEAL, GOLD, max(0, 1 - abs(j - focus)))
        text(image, (500, cy), token, 24, IVORY)
        d.rounded_rectangle((bar_x, cy - 10, bar_x + bar_w, cy + 10), radius=4,
                            fill=(22, 42, 54))
        if weight > 0:
            d.rounded_rectangle((bar_x, cy - 10, bar_x + bar_w * weight, cy + 10),
                                radius=4, fill=color)
            if not transition:
                text(image, (923, cy), f"{weight * 100:.2f}%", 23, color, anchor="rm")
        else:
            # A quiet diagonal pattern makes the masked area distinct from a
            # small nonzero bar, without drawing token-to-token connections.
            for x in range(bar_x + 12, bar_x + bar_w - 10, 17):
                d.line((x, cy + 6, x + 8, cy - 6), fill=(45, 64, 78), width=1)
            if not transition:
                text(image, (923, cy), "屏蔽", 22, MUTED, anchor="rm")

    d.line((34, 381, 925, 381), fill=LINE, width=1)
    text(image, (35, 402), "手设 Q/K/V · 实算权重 · 逐行演示", 18, MUTED)
    text(image, (923, 402), "权重以百分比显示", 18, MUTED, anchor="rm")
    return image


def main() -> None:
    data = read_evidence()
    states = [draw_state(data, i) for i in range(4)]
    frames = []
    for row, state in enumerate(states):
        frames.extend([state] * HOLD_FRAMES)
        for step in range(1, TRANSITION_FRAMES + 1):
            t = step / (TRANSITION_FRAMES + 1)
            eased = t * t * (3 - 2 * t)
            frames.append(draw_state(data, row, (row + 1) % 4, eased))

    # One palette for every frame keeps static text and the navy gradient stable.
    # Sample all transitions so the palette covers every bar and contour color.
    sheet = Image.new("RGB", (WIDTH * 4, HEIGHT * 3))
    samples = [row * (HOLD_FRAMES + TRANSITION_FRAMES) + offset
               for row in range(4) for offset in (0, 25, 29)]
    for i, frame_index in enumerate(samples):
        sheet.paste(frames[frame_index], ((i % 4) * WIDTH, (i // 4) * HEIGHT))
    palette = sheet.quantize(colors=192, method=Image.Quantize.MEDIANCUT,
                             dither=Image.Dither.NONE)
    quantized = [frame.quantize(palette=palette, dither=Image.Dither.NONE)
                 for frame in frames]
    source_hash = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
    metadata = {
        "source": SOURCE.relative_to(ROOT).as_posix(),
        "source_sha256": source_hash,
        "description": "Hand-set Q/K/V; exact recorded attention weights. "
                       "Row-by-row teaching animation; no training or semantic claim. "
                       "Transitions interpolate bar lengths for presentation only; "
                       "numerical labels are hidden during transitions. "
                       "Percentages are rounded for display.",
        "fps": FPS,
        "duration_ms": len(frames) * (1000 // FPS),
    }
    output = HERE / "attention-preview.gif"
    quantized[0].save(output, save_all=True, append_images=quantized[1:],
                      duration=1000 // FPS, loop=0, optimize=True, disposal=1,
                      comment=json.dumps(metadata, ensure_ascii=False).encode("utf-8"))
    if ARGS.qa_dir:
        ARGS.qa_dir.mkdir(parents=True, exist_ok=True)
        for i, state in enumerate(states):
            state.save(ARGS.qa_dir / f"attention-row-{i + 1}.png")
        states[3].resize((480, 210), Image.Resampling.LANCZOS).save(
            ARGS.qa_dir / "attention-mobile.png")
        frames[25].save(ARGS.qa_dir / "attention-transition.png")
    with Image.open(output) as gif:
        actual_duration = 0
        for i in range(gif.n_frames):
            gif.seek(i)
            actual_duration += gif.info["duration"]
        if actual_duration != metadata["duration_ms"]:
            raise ValueError("Encoded GIF duration differs from the planned duration")
        metadata["encoded_frames"] = gif.n_frames
    metadata.update({"output": output.relative_to(ROOT).as_posix(),
                     "bytes": output.stat().st_size,
                     "sha256": hashlib.sha256(output.read_bytes()).hexdigest(),
                     "size": [WIDTH, HEIGHT]})
    print(json.dumps(metadata, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sans-font", type=Path,
                        default=Path("C:/Windows/Fonts/NotoSansSC-VF.ttf"))
    parser.add_argument("--qa-dir", type=Path,
                        help="Optional directory for four static states and a small preview")
    ARGS = parser.parse_args()
    main()
