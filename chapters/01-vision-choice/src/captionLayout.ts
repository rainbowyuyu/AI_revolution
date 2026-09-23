/** Keep captions inside the lower safe area instead of relying on browser wrapping. */
export function captionLines(text: string, maxChars = 24): string[] {
  const clean = text.replace(/\s+/g, '').trim();
  if (!clean) return [];
  if (clean.length <= maxChars) return [clean];

  // Keep captions to two balanced rows. A balanced split avoids the old
  // 30-character first row followed by a tiny second row, which was easy to
  // cover with the lower safe-area mask.
  const target = Math.ceil(clean.length / 2);
  let cut = Math.min(maxChars, Math.max(8, target));
  for (let i = cut; i >= Math.max(8, cut - 8); i--) {
    if ('，。！？；：、'.includes(clean[i - 1])) {
      cut = i;
      break;
    }
  }
  if (clean.length - cut > maxChars && clean.length <= maxChars * 2 + 8) {
    cut = Math.ceil(clean.length / 2);
  }
  return [clean.slice(0, cut), clean.slice(cut)].filter(Boolean);
}

export function captionStyle(lineCount: number) {
  const count = Math.max(1, lineCount);
  return {
    top: 946 - (count - 1) * 48,
    fontSize: count === 1 ? 46 : 40,
    lineHeight: 1.28,
  };
}
