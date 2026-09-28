"""Build the repository's landing-page artwork from existing, attributable assets.

Requires Python 3.10+, Pillow and NumPy. No model or network calls are made.
Fonts are located locally; pass --sans-font and --serif-font on other systems.
Experimental animation uses saved sampling frames directly, without interpolation.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFont, ImageOps

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
NAVY = (5, 14, 23)
IVORY = (247, 237, 215)
GOLD = (217, 187, 136)
TEAL = (135, 189, 187)
MUTED = (144, 161, 173)
SOURCES: dict[str, dict[str, str]] = {}


def source(key: str, names: list[str]) -> Path:
    """Resolve current chapter-local assets, then the original publication layout."""
    for name in names:
        p = ROOT / name
        if p.exists():
            SOURCES[key] = {"path": p.relative_to(ROOT).as_posix(),
                            "sha256": hashlib.sha256(p.read_bytes()).hexdigest()}
            return p
    # A directory reorganization may keep the original asset's unique filename.
    basename = Path(names[0]).name
    matches = [p for p in ROOT.rglob(basename)
               if "node_modules" not in p.parts and ".git" not in p.parts
               and HERE not in p.parents]
    if len(matches) == 1:
        p = matches[0]
        SOURCES[key] = {"path": p.relative_to(ROOT).as_posix(),
                        "sha256": hashlib.sha256(p.read_bytes()).hexdigest()}
        return p
    raise FileNotFoundError(f"Cannot uniquely find {key}: {names}")


def font(size: int, serif: bool = False, bold: bool = False) -> ImageFont.FreeTypeFont:
    p = ARGS.serif_font if serif else ARGS.sans_font
    f = ImageFont.truetype(str(p), size)
    if hasattr(f, "get_variation_axes"):
        try:
            axes = f.get_variation_axes()
            f.set_variation_by_axes([(650 if bold else 400) if a["name"] == b"Weight" else a["default"] for a in axes])
        except (OSError, ValueError):
            pass
    return f


def txt(image: Image.Image, xy: tuple[int, int], value: str, size: int,
        color=IVORY, serif=False, bold=False, anchor=None) -> None:
    ImageDraw.Draw(image).text(xy, value, font=font(size, serif, bold), fill=color, anchor=anchor)


def canvas(w: int, h: int) -> Image.Image:
    yy, xx = np.mgrid[0:h, 0:w]
    glow = np.exp(-(((xx - w * .79)/(w * .5))**2 + ((yy-h*.28)/(h*.85))**2) * 2)
    c = np.empty((h, w, 3), dtype=np.uint8)
    for i, base in enumerate(NAVY):
        c[:, :, i] = base + glow * (4, 12, 15)[i]
    return Image.fromarray(c)


def logo(path: Path, height: int) -> Image.Image:
    svg = path.read_text(encoding="utf-8")
    data = re.search(r'<path d="([^"]+)"', svg).group(1)
    scale = height / 410 * 4
    mask = Image.new("1", (round(347 * scale), round(410 * scale)))
    for subpath in re.split(r"[Mm]", data)[1:]:
        points = [(float(x) * scale, float(y) * scale)
                  for x, y in re.findall(r"(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)", subpath)]
        if len(points) < 3:
            continue
        part = Image.new("1", mask.size)
        ImageDraw.Draw(part).polygon(points, fill=1)
        mask = ImageChops.logical_xor(mask, part)
    alpha = mask.convert("L").resize((round(347 * height/410), height), Image.Resampling.LANCZOS)
    out = Image.new("RGBA", alpha.size, GOLD)
    out.putalpha(alpha)
    return out


def make_hero(art: Path, brand: Path) -> None:
    image = canvas(1600, 560)
    scene = ImageOps.fit(Image.open(art).convert("RGB"), (1096, 617), centering=(.5, .5))
    layer = Image.new("RGB", image.size, NAVY)
    layer.paste(scene, (550, -32))
    alpha = np.zeros((560, 1600), dtype=np.uint8)
    alpha[:] = (np.clip((np.arange(1600)-570)/350, 0, 1) * 255).astype(np.uint8)
    image = Image.composite(layer, image, Image.fromarray(alpha))
    mark = logo(brand, 50)
    image.paste(mark, (74, 49), mark)
    txt(image, (135, 50), "rainbow鱼", 30, GOLD, serif=True)
    txt(image, (76, 152), "AI 进化史", 110, IVORY, serif=True, bold=True)
    txt(image, (81, 309), "从认出一只猫，到走进物理世界", 35, IVORY)
    d = ImageDraw.Draw(image)
    d.line((83, 404, 154, 404), fill=GOLD, width=2)
    txt(image, (83, 433), "六章可视化拆解  /  真实实验  /  关键论文", 24, TEAL)
    image.save(HERE / "hero.png", optimize=True)


def make_cards() -> None:
    for key, filename, chapter_path in [
        ("overview", "总览_横版16x9_1920x1080.jpg", "overview"),
        ("chapter-01", "第一章_横版16x9_1920x1080.jpg", "chapters/01-vision-choice"),
        ("chapter-02", "第二章_踏雪_横版16x9_1920x1080.jpg", "chapters/02-generation"),
    ]:
        p = source(key, [f"{chapter_path}/publication/2026-09-23/covers/{filename}",
                         f"{chapter_path}/publication/2026-09-29/covers/{filename}",
                         f"publication/2026-09-23/covers/{filename}",
                         f"publication/2026-09-29-ch02/covers/{filename}"])
        im = ImageOps.fit(Image.open(p).convert("RGB"), (960, 540), method=Image.Resampling.LANCZOS)
        im.save(HERE / f"{key}.jpg", quality=87, optimize=True, subsampling=0)


def icon(d: ImageDraw.ImageDraw, kind: int, cx: int, cy: int, color) -> None:
    """Purpose-specific line icons, kept secondary to readable chapter names."""
    if kind == 0:
        d.arc((cx-27,cy-22,cx+27,cy+22), 195, 345, fill=color, width=3)
        d.arc((cx-27,cy-22,cx+27,cy+22), 15, 165, fill=color, width=3)
        d.ellipse((cx-9,cy-9,cx+9,cy+9), outline=color, width=3)
    elif kind == 1:
        for y in range(3):
            for x in range(3):
                s = 5 if x+y < 2 else 9
                px,py = cx+(x-1)*18,cy+(y-1)*18
                d.rectangle((px-s/2,py-s/2,px+s/2,py+s/2), fill=color)
    elif kind == 2:
        d.rounded_rectangle((cx-27,cy-20,cx+27,cy+15), radius=8, outline=color,width=3)
        d.line((cx-12,cy+15,cx-18,cy+25,cx+2,cy+15),fill=color,width=3)
        for x in (-13,0,13): d.ellipse((cx+x-2,cy-3,cx+x+2,cy+1),fill=color)
    elif kind == 3:
        pts=[(cx,cy-25),(cx+24,cy-12),(cx+24,cy+14),(cx,cy+27),(cx-24,cy+14),(cx-24,cy-12),(cx,cy-25)]
        d.line(pts,fill=color,width=3)
        d.line((cx-24,cy-12,cx,cy+1,cx+24,cy-12),fill=color,width=3)
        d.line((cx,cy+1,cx,cy+27),fill=color,width=3)
    elif kind == 4:
        for p in [(cx,cy-21),(cx-24,cy+21),(cx+24,cy+21)]:
            d.ellipse((p[0]-6,p[1]-6,p[0]+6,p[1]+6),outline=color,width=3)
        d.line((cx,cy-15,cx,cy+1,cx-24,cy+15),fill=color,width=3)
        d.line((cx,cy+1,cx+24,cy+15),fill=color,width=3)
    else:
        d.line((cx-26,cy+24,cx-13,cy+24,cx-13,cy+10,cx+4,cy-11,cx+22,cy-20),fill=color,width=4)
        d.ellipse((cx-19,cy+4,cx-7,cy+16),fill=NAVY,outline=color,width=3)
        d.ellipse((cx-2,cy-17,cx+10,cy-5),fill=NAVY,outline=color,width=3)
        d.line((cx+20,cy-27,cx+29,cy-20,cx+22,cy-11),fill=color,width=3)


def make_roadmap() -> None:
    image = canvas(1600, 350)
    d = ImageDraw.Draw(image)
    names=["看见与选择","从识别到创造","语言连接万物","走进三维世界","从回答到完成","预测，然后行动"]
    topics=["CNN · DQN · MCTS","GAN · DDPM · DDIM","Transformer · 多模态","NeRF · 3DGS · 4DGS","推理 · Agent · 工具","世界模型 · VLA"]
    xs=[140+i*264 for i in range(6)]
    # The line records the teaching route; it does not assert direct inheritance.
    d.line((xs[0],161,xs[-1],161),fill=(53,77,89),width=2)
    for i,x in enumerate(xs):
        col=GOLD if i<2 else TEAL
        icon(d,i,x,75,col)
        d.ellipse((x-7,154,x+7,168),fill=col)
        txt(image,(x,119),f"0{i+1}",21,col,anchor="mm")
        txt(image,(x,207),names[i],29,IVORY,bold=True,anchor="mm")
        txt(image,(x,255),topics[i],19,MUTED,anchor="mm")
        txt(image,(x,304),"资料已整理" if i<2 else "后续规划",18,col,anchor="mm")
    image.save(HERE/"roadmap.png",optimize=True)


def make_denoising() -> None:
    folder=ROOT/"chapters/02-generation/results/digits"
    frames=[]
    # A shared palette prevents background/text colors from flickering as the
    # amount of image noise changes. Half is reserved for true grayscale data.
    palette=None
    for t in range(200,-1,-5):
        p=folder/f"ddpm-t{t:03d}.png"
        SOURCES[f"ddpm-t{t:03d}"]={"path":p.relative_to(ROOT).as_posix(),
                                   "sha256":hashlib.sha256(p.read_bytes()).hexdigest()}
        image=canvas(960,360)
        txt(image,(42,40),"从噪声",35,IVORY,serif=True)
        txt(image,(42,90),"到手写数字",35,IVORY,serif=True)
        txt(image,(45,165),"DDPM / MNIST",18,TEAL)
        txt(image,(45,202),f"t = {t:03d}",42,GOLD)
        d=ImageDraw.Draw(image)
        d.rounded_rectangle((47,278,258,282),radius=2,fill=(36,56,70))
        if t<200:d.rounded_rectangle((47,278,47+(200-t)/200*211,282),radius=2,fill=GOLD)
        txt(image,(45,306),"真实采样 · 固定 8 个样本",18,MUTED)
        if palette is None:
            palette=image.quantize(colors=64,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE)
            colors=palette.getpalette()[:192]
            colors += [v for level in range(64) for v in [round(level*255/63)]*3]
            colors += [0]*(768-len(colors))
            palette.putpalette(colors)
        # Crop the same original grid positions at every t: rows 1–2, columns 1–4.
        # No digit is redrawn, sharpened, cross-faded or interpolated.
        sample=Image.open(p).convert("RGB").crop((0,0,512,256))
        image.paste(sample,(398,52))
        frames.append(image.quantize(palette=palette, dither=Image.Dither.NONE))
    durations=[160]*len(frames)
    durations[0]=500
    durations[-1]=1600
    frames[0].save(HERE/"mnist-denoising.gif",save_all=True,append_images=frames[1:],
                   duration=durations,loop=0,optimize=True,disposal=1)


def main() -> None:
    art=source("hero-artwork",["overview/publication/2026-09-23/artwork/overview-landscape.png",
                                "publication/2026-09-23/artwork/overview-landscape.png"])
    brand=source("brand",["shared/publication/2026-09-23-history/rainbow-vector.svg",
                           "publication/2026-09-23/rainbow-vector.svg"])
    make_hero(art,brand)
    make_cards()
    make_roadmap()
    make_denoising()
    outputs={name:{"bytes":(HERE/name).stat().st_size,"sha256":hashlib.sha256((HERE/name).read_bytes()).hexdigest()}
             for name in ["hero.png","roadmap.png","overview.jpg","chapter-01.jpg","chapter-02.jpg","mnist-denoising.gif"]}
    (HERE/"sources.json").write_text(json.dumps({
        "description":"Repository homepage derivatives; no new model generation.",
        "experiment":"MNIST DDPM, trained seed 42, generation seed 10042; fixed 8 examples in grid rows 1–2 and columns 1–4; every saved t=200..0 frame in increments of 5, no interpolation.",
        "sources":SOURCES,"outputs":outputs},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(outputs,ensure_ascii=False,indent=2))


if __name__=="__main__":
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sans-font",type=Path,default=Path("C:/Windows/Fonts/NotoSansSC-VF.ttf"))
    parser.add_argument("--serif-font",type=Path,default=Path("C:/Windows/Fonts/NotoSerifSC-VF.ttf"))
    ARGS=parser.parse_args()
    main()
