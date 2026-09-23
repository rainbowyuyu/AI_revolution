"""Extract review frames and technical evidence from an existing movie."""
import argparse
import json
import math
import re
import subprocess
from fractions import Fraction
from pathlib import Path

from PIL import Image, ImageDraw


def run(args):
    return subprocess.run(args, capture_output=True, text=True, encoding='utf-8', errors='replace')


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--video', type=Path, required=True)
    p.add_argument('--times', type=float, nargs='*', default=[])
    p.add_argument('--seams', type=float, nargs='*', default=[])
    p.add_argument('--out-dir', type=Path, required=True)
    p.add_argument('--decode', action='store_true')
    p.add_argument('--loudness', action='store_true')
    p.add_argument('--overwrite', action='store_true')
    a = p.parse_args()
    if (a.out_dir / 'inspection.json').exists() and not a.overwrite:
        p.error('Inspection exists; choose another directory or use --overwrite.')
    probe = run(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(a.video)])
    if probe.returncode:
        p.error(probe.stderr)
    info = json.loads(probe.stdout)
    v = next((s for s in info['streams'] if s['codec_type'] == 'video'), None)
    if v is None:
        p.error('No video stream.')
    duration = float(v.get('duration', info['format'].get('duration', 0)))
    fps = float(Fraction(v['avg_frame_rate']))
    if duration <= 0 or fps <= 0:
        p.error('Cannot establish a positive duration and frame rate.')
    if any(not math.isfinite(t) or t < 0 or t >= duration for t in a.times + a.seams):
        p.error('Review times must be finite and inside the movie duration.')
    samples = a.times + [min(duration - 1 / fps, max(0, t + dt)) for t in a.seams for dt in [-.5, -.2, 0, .2, .5]]
    if not samples:
        samples = [duration * (i + .5) / 8 for i in range(8)]
    samples = sorted(set(round(t, 6) for t in samples))
    a.out_dir.mkdir(parents=True, exist_ok=True)
    report = {
        'video': str(a.video.resolve()), 'width': v['width'], 'height': v['height'],
        'fps': v['avg_frame_rate'], 'duration': duration, 'frames': v.get('nb_frames'),
        'audioPresent': any(s['codec_type'] == 'audio' for s in info['streams']),
        'samples': [], 'decode': {'status': 'not requested'}, 'loudness': {'status': 'not requested'},
        'visualReview': 'Not automatically assessed. View the movie and the contact sheet.'
    }
    sheet = Image.new('RGB', (4 * 480, math.ceil(len(samples) / 4) * 296), '#060e15')
    draw = ImageDraw.Draw(sheet)
    ok = True
    for i, t in enumerate(samples):
        dest = a.out_dir / f'frame-{i:03d}-{t:.3f}s.jpg'
        result = run(['ffmpeg', '-v', 'error', '-y', '-ss', str(t), '-i', str(a.video), '-frames:v', '1', '-q:v', '2', str(dest)])
        if result.returncode or not dest.exists():
            p.error('Frame extraction failed: ' + result.stderr)
        with Image.open(dest) as im:
            im.thumbnail((480, 270))
            x, y = (i % 4) * 480, (i // 4) * 296
            sheet.paste(im, (x + (480 - im.width) // 2, y + (270 - im.height) // 2))
            draw.text((x + 12, y + 276), f'{t:.3f}s', fill='#e1cfb2')
        report['samples'].append({'seconds': t, 'file': dest.name})
    sheet.save(a.out_dir / 'contact-sheet.jpg', quality=92)
    if a.decode:
        r = run(['ffmpeg', '-v', 'error', '-xerror', '-i', str(a.video), '-f', 'null', '-'])
        passed = r.returncode == 0 and not r.stderr.strip()
        report['decode'] = {'status': 'passed' if passed else 'failed', 'log': r.stderr}
        ok = ok and passed
    if a.loudness:
        if report['audioPresent']:
            r = run(['ffmpeg', '-hide_banner', '-i', str(a.video), '-map', '0:a:0', '-af', 'loudnorm=I=-14:TP=-1:print_format=json', '-f', 'null', '-'])
            match = re.search(r'\{\s*"input_i"[\s\S]*?\}', r.stderr)
            if r.returncode == 0 and match:
                stats = json.loads(match.group())
                passed = abs(float(stats['input_i']) + 14) <= 1 and float(stats['input_tp']) <= -1
                report['loudness'] = {'status': 'within suggested targets' if passed else 'outside suggested targets', 'stats': stats}
                ok = ok and passed
            else:
                report['loudness'] = {'status': 'failed', 'log': r.stderr}
                ok = False
        else:
            report['loudness'] = {'status': 'no audio stream'}
            ok = False
    (a.out_dir / 'inspection.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print('Inspection evidence:', a.out_dir)
    raise SystemExit(0 if ok else 1)


if __name__ == '__main__':
    main()
