import React from "react";
import {SafeImage} from '../SvgImageV11';

type Props = { progress: number; frame: number; variant?: string; idPrefix?: string; imageSrc?: string };

const GOLD = "#d9bb8e", CYAN = "#91cdd1", IVORY = "#f8efdb";
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const smooth = (e0: number, e1: number, x: number) => { const t = clamp((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };
const noise = (n: number) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };
const proj = (x: number, y: number, z: number, ox: number, oy: number): [number, number] =>
  [ox + x * 1.15 - z * 0.5, oy + y * 0.62 + (x + z) * 0.26];

export function LatentLesson({ progress, frame, variant = "default", idPrefix = "ll", imageSrc }: Props) {
  const accent = variant === "cyan" ? CYAN : GOLD;
  const s = smooth(0.2, 0.8, progress);
  const reveal = smooth(0.12, 0.92, progress);
  const drift = Math.PI*.5*clamp(progress);
  const LX = 30, LY = 90, IMG = 220, RX = 760, RY = 90, CELL = 16, N = 8, ox = 430, oy = 118;
  const faces: { d: number; pts: string; v: number }[] = [];
  [0, 30, 60].forEach((z, gi) => {
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const x0 = i * CELL, y0 = j * CELL;
        const q = (dx: number, dy: number) => proj(x0 + dx, y0 + dy, z, ox, oy).map(n => n.toFixed(1)).join(",");
        const low = 0.5 + 0.5 * Math.sin(i * 0.7 - drift + gi * 0.9) * Math.cos(j * 0.7 + drift * 0.6);
        const v = noise(i * 13.13 + j * 57.7 + gi * 7.3) * (1 - s) + low * s;
        faces.push({ d: x0 + y0 * 0.5 + z + gi, pts: `${q(0, 0)} ${q(CELL, 0)} ${q(CELL, CELL)} ${q(0, CELL)}`, v });
      }
    }
  });
  faces.sort((a, b) => a.d - b.d);
  const bx = RX + IMG * reveal;
  return (
    <g>
      <defs>
        <linearGradient id={`${idPrefix}-enc`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={GOLD} stopOpacity="0" />
          <stop offset="1" stopColor={CYAN} stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id={`${idPrefix}-dec`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={CYAN} stopOpacity="0.3" />
          <stop offset="1" stopColor={GOLD} stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${idPrefix}-sq`}><rect x={LX} y={LY} width={IMG} height={IMG} /></clipPath>
        <clipPath id={`${idPrefix}-out`}><rect x={RX} y={RY} width={IMG * reveal} height={IMG} /></clipPath>
      </defs>

      <path d="M265 90 L395 142 L395 264 L265 310 Z" fill={`url(#${idPrefix}-enc)`} opacity={0.48} />
      <path d="M600 142 L755 90 L755 310 L600 264 Z" fill={`url(#${idPrefix}-dec)`} opacity={0.48} />

      <rect x={LX} y={LY} width={IMG} height={IMG} fill="#0b1a2b" opacity={0.5} rx={4} />
      {imageSrc && <SafeImage href={imageSrc} x={LX} y={LY} width={IMG} height={IMG} preserveAspectRatio="xMidYMid slice" opacity={0.95} />}
      <rect x={LX} y={LY} width={IMG} height={IMG} fill="none" stroke={IVORY} strokeOpacity={0.18} rx={4} />

      {faces.map((f, k) => (
        <polygon key={k} points={f.pts} fill={accent} fillOpacity={0.12 + 0.7 * f.v} stroke={CYAN} strokeOpacity={0.22} strokeWidth={0.5} />
      ))}

      <g clipPath={`url(#${idPrefix}-out)`}>
        <rect x={RX} y={RY} width={IMG} height={IMG} fill="#0e2135" opacity={0.6} />
        {imageSrc && <SafeImage href={imageSrc} x={RX} y={RY} width={IMG} height={IMG} preserveAspectRatio="xMidYMid slice" opacity={0.95} />}
      </g>
      <rect x={RX} y={RY} width={IMG} height={IMG} fill="none" stroke={IVORY} strokeOpacity={0.18} rx={4} />
      <line x1={bx} y1={RY - 12} x2={bx} y2={RY + IMG + 12} stroke={GOLD} strokeWidth={6} opacity={0.12} />
      <line x1={bx} y1={RY - 12} x2={bx} y2={RY + IMG + 12} stroke={GOLD} strokeWidth={1.4} opacity={.75*Math.sin(Math.PI*reveal)} />

      <text x={LX + IMG / 2} y={362} fill={IVORY} fontSize={26} textAnchor="middle" opacity={0.85}>像素</text>
      <text x={485} y={362} fill={IVORY} fontSize={26} textAnchor="middle" opacity={0.85}>潜表示</text>
      <text x={RX + IMG / 2} y={362} fill={IVORY} fontSize={26} textAnchor="middle" opacity={0.85}>解码</text>
    </g>
  );
}
