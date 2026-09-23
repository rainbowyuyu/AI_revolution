"""Render an authentic PDF page and a verifiable focal region; no network calls."""
import argparse
import hashlib
import json
import math
from pathlib import Path

import fitz


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--pdf', type=Path, required=True)
    p.add_argument('--page', type=int, required=True, help='Physical PDF page, 1-based')
    p.add_argument('--rect', type=float, nargs=4, required=True, metavar=('X0', 'Y0', 'X1', 'Y1'))
    p.add_argument('--verify-text', required=True, help='Expected text inside the focus region')
    p.add_argument('--scale', type=float, default=3)
    p.add_argument('--out-dir', type=Path, required=True)
    p.add_argument('--overwrite', action='store_true')
    a = p.parse_args()
    if not math.isfinite(a.scale) or not 0 < a.scale <= 6:
        p.error('Scale must be finite and in (0, 6].')
    if not a.verify_text.strip() or not all(math.isfinite(v) for v in a.rect):
        p.error('Provide real verification text and finite coordinates.')
    with fitz.open(a.pdf) as doc:
        if not doc.is_pdf or doc.needs_pass:
            p.error('Expected an unencrypted PDF.')
        if not 1 <= a.page <= doc.page_count:
            p.error(f'Page must be between 1 and {doc.page_count}.')
        page = doc[a.page - 1]
        if page.rotation:
            p.error('Rotated PDF: transform coordinates explicitly before using this helper.')
        rect = fitz.Rect(a.rect)
        if rect.is_empty or not page.rect.contains(rect):
            p.error('Focus rectangle is empty or outside the page.')
        matches = page.search_for(a.verify_text)
        hits = [r for r in matches if rect.intersects(r)]
        if not hits:
            p.error('Verification text not found in focus region; inspect the source manually.')
        files = ['page.png', 'focus.png', 'locator-review.png', 'focus.json']
        if not a.overwrite and any((a.out_dir / n).exists() for n in files):
            p.error('Output exists. Choose a new directory or use --overwrite.')
        a.out_dir.mkdir(parents=True, exist_ok=True)
        matrix = fitz.Matrix(a.scale, a.scale)
        page.get_pixmap(matrix=matrix, alpha=False).save(a.out_dir / 'page.png')
        page.get_pixmap(matrix=matrix, clip=rect, alpha=False).save(a.out_dir / 'focus.png')
        # Annotations exist only in memory and only on the review image.
        page.draw_rect(rect, color=(1, 0, 0), width=1.5, overlay=True)
        page.get_pixmap(matrix=matrix, alpha=False).save(a.out_dir / 'locator-review.png')
        result = {
            'pdf': str(a.pdf.resolve()), 'sha256': hashlib.sha256(a.pdf.read_bytes()).hexdigest(),
            'page': a.page, 'pageWidth': page.rect.width, 'pageHeight': page.rect.height,
            'focus': list(rect), 'verifiedText': a.verify_text,
            'textMatchesInFocus': [list(r) for r in hits], 'renderScale': a.scale,
            'image': 'page.png', 'reviewOnly': 'locator-review.png',
            'note': 'Original PDF is unchanged. Visual inspection is still required.'
        }
        (a.out_dir / 'focus.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print('Rendered authentic page and focal region:', a.out_dir)


if __name__ == '__main__':
    main()
