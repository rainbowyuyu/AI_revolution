"""Optionally rebuild JPEG caches from restored originals; requires FFmpeg on PATH."""
from __future__ import annotations

import argparse
import json
import shutil
import subprocess
from pathlib import Path

from prepare_assets import ROOT, digest, safe_child


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--ffmpeg', default='ffmpeg')
    args = parser.parse_args()
    executable = shutil.which(args.ffmpeg)
    if not executable:
        raise SystemExit('FFmpeg not found. Install it separately and retry.')
    mapping = json.loads((ROOT / 'src/frame-cache-v15.json').read_text(encoding='utf-8'))
    for video, row in mapping.items():
        source = safe_child(ROOT / 'public', video)
        if not source.is_file() or digest(source) != row['sha256']:
            raise SystemExit(f'Original video missing or changed: {video}')
        directory = safe_child(ROOT / 'public', row['directory'])
        expected = [directory / f'{index:06d}.jpg' for index in range(1, row['frames'] + 1)]
        if directory.exists():
            if all(path.is_file() for path in expected):
                print(f'Existing cache retained: {row["directory"]}')
                continue
            raise SystemExit(f'Partial cache left unchanged: {row["directory"]}; use a fresh directory')
        directory.mkdir(parents=True)
        subprocess.run([executable, '-hide_banner', '-loglevel', 'error', '-nostdin', '-n',
                        '-i', str(source), '-vf', 'fps=30', '-q:v', '2',
                        '-frames:v', str(row['frames']), str(directory / '%06d.jpg')], check=True)
        if not all(path.is_file() for path in expected):
            raise SystemExit(f'Cache has fewer than {row["frames"]} frames: {video}')
    print('Caches ready. To use them, set USE_FRAME_CACHE = true in src/FrameVideoV15.tsx.')
    print('Re-encoded JPEGs may differ from the historical render; this is not pixel-identical restoration.')


if __name__ == '__main__':
    main()
