import React from 'react';
import {SafeImage} from '../SvgImageV11';

const MX = 0.262, MY = 0.255;

export function TemporalLesson({
  progress = 0, frame = 1, idPrefix = 'tl', imageSrc, images,
}: {
  progress: number; frame: number; variant?: string; idPrefix?: string; imageSrc?: string; images?:string[];
}) {
  const id = idPrefix;

  const ps = Array.from({ length: 5 }, (_, i) => {
    const t = i / 4;
    const w = 158 - t * 14, h = w;
    const cx = 112 + i * 202 - t * 8, cy = 213 + t * 6;
    return { x: cx - w / 2, y: cy - h / 2, w, h, cx };
  });

  const mk = ps.map(p => [p.x + MX * p.w, p.y + MY * p.h] as [number, number]);
  const p01 = Math.min(Math.max(progress, 0), 1);
  const scanX = 10 + p01 * 1020;
  const tilt = (p01 * 2.4).toFixed(2);
  const fi = Math.round(p01*4);

  return (
    <g transform={`rotate(${tilt},520,220)`}>
      {/* Correspondence polyline — drawn first, sits behind planes */}
      {!images&&<polyline
        points={mk.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')}
        fill="none" stroke="#91cdd1" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.5"
      />}

      {ps.map((p, i) => {
        const active = i === fi;
        const [mx, my] = mk[i];
        return (
          <g key={i}>
            <defs>
              <clipPath id={`${id}k${i}`}>
                <rect x={p.x} y={p.y} width={p.w} height={p.h} />
              </clipPath>
            </defs>
            {imageSrc
              ? <SafeImage href={images?.[i]??imageSrc} x={p.x} y={p.y} width={p.w} height={p.h} preserveAspectRatio="xMidYMid meet"
                  opacity={active ? 1 : 0.68} />
              : <rect x={p.x} y={p.y} width={p.w} height={p.h} fill="#152038" opacity="0.88" />
            }
            <rect x={p.x} y={p.y} width={p.w} height={p.h}
              fill="none" stroke={active ? '#d9bb8e' : '#91cdd1'}
              strokeWidth={active ? 2 : 1} opacity="0.9" />
            {/* Marker pinned at normalized [.262,.255] of each plane */}
            {!images&&<circle cx={mx} cy={my} r={active ? 5.5 : 3.5}
              fill={active ? '#d9bb8e' : '#f8efdb'} stroke="#152038" strokeWidth="1" opacity="0.95" />}
            <text x={p.cx} y={p.y + p.h + 26}
              textAnchor="middle" fill="#f8efdb" fontSize="26" fontFamily="NotoSansSC">
              {images?`${.5+i*2} 秒`:`帧${i+1}`}
            </text>
          </g>
        );
      })}

      {/* Scan line sweeps left→right with progress */}
      <line x1={scanX} y1={14} x2={scanX} y2={416} stroke="#d9bb8e" strokeWidth="6" opacity="0.1" />
      <line x1={scanX} y1={14} x2={scanX} y2={416} stroke="#d9bb8e" strokeWidth="1.5" opacity="0.8" />
    </g>
  );
}
