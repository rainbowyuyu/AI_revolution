"""Restore bundled experiment images and optionally verified V18 external media."""
from __future__ import annotations

import argparse
import hashlib
import json
import shutil
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parents[1]


def digest(path: Path) -> str:
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def safe_child(root: Path, relative: str) -> Path:
    item = PurePosixPath(relative)
    if item.is_absolute() or '..' in item.parts or '\\' in relative or ':' in relative:
        raise ValueError(f'Unsafe asset path: {relative}')
    target = root.joinpath(*item.parts).resolve()
    if not target.is_relative_to(root.resolve()):
        raise ValueError(f'Asset escapes root: {relative}')
    return target


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-public', type=Path,
                        help='Copy assets from an authorized original public directory')
    parser.add_argument('--check-external', action='store_true',
                        help='Verify every external file by size and SHA-256; fail if unavailable')
    args = parser.parse_args()
    restored = 0
    for source in sorted((ROOT / 'results/digits').glob('*.png')):
        destination = ROOT / 'public/experiments/digits' / source.name
        destination.parent.mkdir(parents=True, exist_ok=True)
        if destination.exists() and digest(destination) != digest(source):
            raise SystemExit(f'Refusing to overwrite changed local asset: {destination.relative_to(ROOT)}')
        if not destination.exists():
            shutil.copy2(source, destination)
        restored += 1
    print(f'Bundled experiment images ready: {restored}')
    if not args.source_public and not args.check_external:
        print('External audio/video/fonts/paper images are still required; see docs/视频工程.md.')
        return
    manifest = json.loads((ROOT / 'assets/video-manifest.json').read_text(encoding='utf-8'))
    failures = []
    for row in manifest['assets']:
        destination = safe_child(ROOT / 'public', row['path'])
        if args.source_public and not destination.exists():
            source = safe_child(args.source_public, row['path'])
            if not source.is_file() or source.stat().st_size != row['bytes'] or digest(source) != row['sha256']:
                failures.append('Source missing or mismatched: ' + row['path'])
                continue
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, destination)
        if not destination.is_file():
            failures.append('Missing: ' + row['path'])
        elif destination.stat().st_size != row['bytes'] or digest(destination) != row['sha256']:
            failures.append('Mismatch (left unchanged): ' + row['path'])
    if failures:
        print('\n'.join(failures))
        raise SystemExit(f'{len(failures)} external assets unavailable or changed')
    print(f'Verified {len(manifest["assets"])} external assets by size and SHA-256')


if __name__ == '__main__':
    main()
