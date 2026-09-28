import React from 'react';
import {SafeImage} from '../SvgImageV11';

type Props = { progress: number; frame: number; variant?: string; idPrefix?: string; imageSrc?: string };

const GOLD = '#d9bb8e';
const CYAN = '#91cdd1';
const IVORY = '#f8efdb';
const FONT = '"NotoSansSC","PingFang SC",system-ui,sans-serif';

export const GuidanceLesson: React.FC<Props> = ({ progress, frame, variant = 'default', idPrefix = 'gc', imageSrc }) => {
  const t = Math.min(1, Math.max(0, progress));
  const w = 3 * t;
  const O = { x: 140, y: 310 };
  const U = { x: 370, y: 260 };
  const C = { x: 430, y: 200 };
  const E = { x: U.x + w * (C.x - U.x), y: U.y + w * (C.y - U.y) };
  const uid = (s: string) => `${idPrefix}-${s}`;
  const arrow = (a: typeof O, b: typeof O) => {
    const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1;
    const ux = dx / L, uy = dy / L, h = Math.min(16, L * 0.5), s = h * 0.42;
    const bx = b.x - ux * h, by = b.y - uy * h;
    return `M${a.x},${a.y}L${bx},${by}M${b.x},${b.y}L${bx - uy * s},${by + ux * s}L${bx + uy * s},${by - ux * s}Z`;
  };
  let grid = '';
  for (let x = 40; x < 1030; x += 66) grid += `M${x},10V420`;
  for (let y = 40; y < 420; y += 66) grid += `M10,${y}H1030`;
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.05);
  const IX = 770, IY = 95, IS = 250;
  const cx = IX + IS / 2, cy = IY + IS / 2;
  const label = { fontSize: 26, fontFamily: FONT, fontWeight: 500 } as const;

  return (
    <g fontFamily={FONT}>
      <defs>
        <radialGradient id={uid('glow')}>
          <stop offset="0%" stopColor={GOLD} stopOpacity="0.85" />
          <stop offset="48%" stopColor={GOLD} stopOpacity="0.28" />
          <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
        </radialGradient>
      </defs>

      {variant !== 'plain' && <path d={grid} fill="none" stroke={IVORY} strokeWidth="1" opacity="0.07" />}

      {imageSrc && (
        <SafeImage href={imageSrc} x={IX} y={IY} width={IS} height={IS} preserveAspectRatio="xMidYMid meet" />
      )}
      <path d={`M${U.x},${U.y}L${C.x},${C.y}`} fill="none" stroke={CYAN} strokeDasharray="4 6" strokeWidth={1.8} opacity={.55}/>
      <circle cx={cx} cy={cy} r={140 + 18 * t} fill={`url(#${uid('glow')})`} opacity={(0.14 + 0.6 * t) * (0.82 + 0.18 * pulse)} />

      <path d={arrow(O, U)} fill="#b6ccd0" stroke="#b6ccd0" strokeWidth="2.5" strokeLinejoin="round" opacity="0.75" />
      <path d={arrow(O, C)} fill={CYAN} stroke={CYAN} strokeWidth="2.5" strokeLinejoin="round" opacity="0.9" />
      <path d={arrow(O, E)} fill={GOLD} stroke={GOLD} strokeWidth="3.5" strokeLinejoin="round" />
      <circle cx={O.x} cy={O.y} r="5" fill={IVORY} opacity="0.9" />

      <text x="392" y="300" {...label} fill={CYAN}>无条件</text>
      <text x="455" y="236" {...label} fill={CYAN}>有条件</text>
      <text x="570" y="68" {...label} fill={GOLD} opacity={0.25 + 0.75 * t}>引导方向</text>
      <text x="150" y="392" {...label} fill={IVORY} opacity="0.9">{`w = ${w.toFixed(2)}`}</text>
      <text x="895" y="386" {...label} fill={IVORY} opacity="0.85" textAnchor="middle">原理示意</text>
    </g>
  );
};
