"""Inventory V18 external inputs; never records local roots, URLs or voice sources."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(name: str):
    return json.loads((ROOT / 'src' / name).read_text(encoding='utf-8-sig'))


def referenced_assets() -> tuple[set[str], set[str]]:
    """Resolve data paths and the bounded dynamic paths in the retained source tree."""
    media = read('media-v15.json')
    videos = {row['video'] for row in media['shots'] if row['ready']}
    videos.update(row['video'] for row in media['bridges']
                  if row['ready'] and row['method'] not in
                  {'continuous-source', 'procedural-occlusion'})
    files = {row['image'] for row in media['shots'] if not row['ready']}
    files.update({'audio/v18/master.wav', 'fonts/NotoSansSC.ttf', 'fonts/NotoSerifSC.ttf'})
    for paper in read('papers-v4.json'):
        files.update([paper['image'], paper['focusImage']])
    files.update(row['file'] for row in read('noise-v15.json'))
    # Static paths in TSX. V16 audio is deliberately disabled by the V18 wrapper.
    for path in (ROOT / 'src').rglob('*.tsx'):
        text = path.read_text(encoding='utf-8')
        for value in re.findall(r'''["']((?:character|visual-v15)/[^"'\n]+\.(?:png|jpg|mp4))["']''', text):
            (videos if value.endswith('.mp4') else files).add(value)
    # Dynamic character paths in ScenesV15, VisualV15 and OpusMotionV15.
    videos.update('character/v15/' + name for name in
                  ['look-back.mp4', 'tongue.mp4', 'stand-to-sit.mp4'])
    videos.add(read('action-study-v15.json')['video'])
    files.update('character/v15/' + name for name in
                 ['ref-front-three-quarter.png', 'ref-sitting.png', 'ref-relaxed-ears.png'])
    files.update(f'visual-v15/temporal-{index}.jpg' for index in range(5))
    return files | videos, videos


def sha256(path: Path) -> str:
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-public', required=True, type=Path,
                        help='Directory containing authorized original public assets')
    parser.add_argument('--trim-cache', action='store_true',
                        help='Remove unused historical mappings from frame-cache-v15.json')
    args = parser.parse_args()
    paths, videos = referenced_assets()
    missing = [path for path in sorted(paths) if not (args.source_public / path).is_file()]
    if missing:
        raise SystemExit('Missing source assets:\n' + '\n'.join(missing))
    assets = [{'path': path, 'bytes': (args.source_public / path).stat().st_size,
               'sha256': sha256(args.source_public / path)} for path in sorted(paths)]
    target = ROOT / 'assets/video-manifest.json'
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps({'schemaVersion': 1, 'root': 'public', 'assets': assets},
                                ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    if args.trim_cache:
        cache = read('frame-cache-v15.json')
        hashes = {row['path']: row['sha256'] for row in assets}
        cache = {path: {**row, 'sha256': hashes[path]}
                 for path, row in cache.items() if path in videos}
        (ROOT / 'src/frame-cache-v15.json').write_text(
            json.dumps(cache, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Inventoried {len(assets)} external assets; {sum(row["bytes"] for row in assets):,} bytes')


if __name__ == '__main__':
    main()
