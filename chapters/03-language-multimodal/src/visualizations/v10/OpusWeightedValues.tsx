// Claude-generated geometry; Codex adaptation documented in research/v5/claude-core.
import React from 'react';
import { C, Label, Arrow, SceneProps, progress, segment, mix, palette } from './primitives';
import { attentionEvidence as A } from './evidence';

type P2 = [number, number];
type An = 'start' | 'middle' | 'end';
const cl = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const f2 = (n: number) => n.toFixed(2);

const TOK: string[] = [C.gold, C.cyan, C.rose, palette[3]];
const NAME: string[] = A.tokens as string[];
const V: P2[] = A.V as P2[];
const WT: number[] = A.weights[3] as number[];
const SUM: P2 = A.output[3] as P2;
const WV: P2[] = V.map((v, i) => [v[0] * WT[i], v[1] * WT[i]] as P2);
const CH: P2[] = [[0, 0]];
WV.forEach((w) => { const q = CH[CH.length - 1]; CH.push([q[0] + w[0], q[1] + w[1]]); });

const S = 240, KY = 0.62, KZ = 0.28;
const T1: number[][] = [[16, 40], [0, -28], [22, -8], [-18, -14]];
const W1: number[][] = [[16, 70], [0, -56], [22, 20], [-18, 14]];
const AN1: An[] = ['start', 'middle', 'start', 'end'];
const T2: number[][] = [[0, 34], [26, 4], [-64, -22], [4, 40]];
const AN2: An[] = ['middle', 'start', 'start', 'start'];

export function OpusWeightedValues(p: SceneProps) {
  // Codex adapter: honor the existing stage-wide SceneProps timing contract.
  const uF = cl(progress(p));
  const act2 = uF >= 0.36;
  const a1 = act2 ? 1 : segment(uF, 0.02, 0.36);
  const a2 = segment(uF, 0.36, 0.79);

  const push = segment(a1, 0.26, 0.52);
  const Z = 1 + 0.9 * push;
  const ox = mix(392, 520, push), oy = mix(494, 452, push);
  const th = 0.075 * Math.sin(6.2831855 * (0.5 * uF) - 0.7);
  const cs = Math.cos(th), sn = Math.sin(th);
  const pr = (x: number, y: number): P2 => [ox + Z * x * cs * S, oy - Z * (y * KY + x * sn * KZ) * S];
  const O = pr(0, 0), FT = pr(SUM[0], SUM[1]);
  const grow = (i: number) => segment(a1, 0.05 + 0.035 * i, 0.25 + 0.035 * i);
  const morph = (i: number) => segment(a1, 0.30 + 0.035 * i, 0.50 + 0.035 * i);
  const gOp = (i: number) => mix(0.30, 0.05, morph(i)) * (1 - 0.92 * push);
  const sumK = segment(a2, 0.72, 0.92);
  const sumOp = segment(a2, 0.72, 0.92);
  const resLb = segment(a2, 0.84, 0.98);
  const ST = pr(SUM[0] * sumK, SUM[1] * sumK);
  const hdr = act2 ? '向量相加' : '加权内容';

  const grid: React.ReactNode[] = [];
  for (let g = -1; g <= 2.51; g += 0.5) {
    const a = pr(g, -0.9), b = pr(g, 2.8);
    grid.push(<line key={'gx' + g} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={C.line} strokeWidth={1} opacity={0.16} />);
  }
  for (let g = -0.5; g <= 2.51; g += 0.5) {
    const a = pr(-1.4, g), b = pr(2.9, g);
    grid.push(<line key={'gy' + g} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={C.line} strokeWidth={1} opacity={0.16} />);
  }
  const quad = [pr(-1.4, -0.9), pr(2.9, -0.9), pr(2.9, 2.8), pr(-1.4, 2.8)].map((q) => q[0] + ',' + q[1]).join(' ');

  return (
    <g>
      <defs><clipPath id="opus-weighted-plane"><rect x="50" y="90" width="1195" height="490"/></clipPath></defs>
      <g clipPath="url(#opus-weighted-plane)"><polygon points={quad} fill={C.line} opacity={0.07} />{grid}</g>
      <circle cx={O[0]} cy={O[1]} r={4.5} fill={C.ivory} />
      <circle cx={O[0]} cy={O[1]} r={17} fill="none" stroke={C.ivory} strokeWidth={1} opacity={0.2} />

      {V.map((v, i) => {
        const q = pr(v[0] * grow(i), v[1] * grow(i));
        return <line key={'gh' + i} x1={O[0]} y1={O[1]} x2={q[0]} y2={q[1]} stroke={TOK[i]} strokeWidth={1.6} strokeDasharray="8 8" opacity={gOp(i)} />;
      })}

      {!act2 && WV.map((w, i) => {
        const k = morph(i), t = pr(w[0], w[1]);
        const body = pr(mix(V[i][0], w[0], k) * grow(i), mix(V[i][1], w[1], k) * grow(i));
        return (
          <g key={'wv' + i}>
            {sumK > 0 && <line x1={t[0]} y1={t[1]} x2={ST[0]} y2={ST[1]} stroke={TOK[i]} strokeWidth={1} strokeDasharray="4 7" opacity={0.3 * sumK} />}
            <Arrow a={O} b={body} color={TOK[i]} width={mix(2, 5, k)} opacity={mix(0.35, 1, k)} />
          </g>
        );
      })}

      {act2 && WV.map((w, i) => {
        if (i === 0) return null;
        const t = pr(w[0], w[1]);
        return <line key={'sh' + i} x1={O[0]} y1={O[1]} x2={t[0]} y2={t[1]} stroke={TOK[i]} strokeWidth={1.6} strokeDasharray="8 8" opacity={0.42 * segment(a2, 0.04, 0.16)} />;
      })}

      {act2 && WV.map((w, i) => {
        const mv = segment(a2, 0.22 + 0.13 * i, 0.40 + 0.13 * i);
        const px = mix(0, CH[i][0], mv), py = mix(0, CH[i][1], mv);
        const op = 1;
        const b0 = pr(px, py), b1 = pr(px + w[0], py + w[1]);
        return (
          <g key={'ch' + i}>
            <circle cx={b0[0]} cy={b0[1]} r={4} fill={TOK[i]} opacity={op} />
            <Arrow a={b0} b={b1} color={TOK[i]} width={5} opacity={op} />
          </g>
        );
      })}

      {sumOp > 0.002 && <Arrow a={O} b={ST} color={C.ivory} width={6.5} opacity={sumOp} />}
      {sumK > 0.5 && <circle cx={FT[0]} cy={FT[1]} r={13} fill="none" stroke={C.ivory} strokeWidth={1.5} opacity={0.45 * resLb} />}

      {!act2 && WV.map((w, i) => {
        const k = morph(i), q = pr(mix(V[i][0], w[0], k) * grow(i), mix(V[i][1], w[1], k) * grow(i));
        return (
          <g key={'lb' + i}>
            <g opacity={cl(0.4 + 0.6 * k)}>
              <Label x={q[0] + T1[i][0]} y={q[1] + T1[i][1]} size={30} color={TOK[i]} anchor={AN1[i]}>{NAME[i]}</Label>
            </g>
            <g opacity={segment(a1, 0.46 + 0.04 * i, 0.60 + 0.04 * i)}>
              <Label x={q[0] + W1[i][0]} y={q[1] + W1[i][1]} size={24} color={C.muted} anchor={AN1[i]}>{'×' + f2(WT[i])}</Label>
            </g>
          </g>
        );
      })}

      {act2 && WV.map((_, i) => {
        const a0 = pr(CH[i][0], CH[i][1]), b0 = pr(CH[i + 1][0], CH[i + 1][1]);
        return (
          <g key={'lb2' + i} opacity={segment(a2, 0.30 + 0.13 * i, 0.44 + 0.13 * i)}>
            <Label x={(a0[0] + b0[0]) / 2 + T2[i][0]} y={(a0[1] + b0[1]) / 2 + T2[i][1]} size={28} color={TOK[i]} anchor={AN2[i]}>{NAME[i]}</Label>
          </g>
        );
      })}

      <g opacity={resLb}>
        <Label x={FT[0] + 30} y={FT[1] - 46} size={30} color={C.ivory} anchor="start">新的信息向量</Label>
        <Label x={FT[0] + 30} y={FT[1] - 18} size={24} color={C.gold} anchor="start">{'[' + SUM[0].toFixed(3) + ', ' + SUM[1].toFixed(3) + ']'}</Label>
      </g>

      <Label x={64} y={62} size={32} color={C.gold} anchor="start">{hdr}</Label>

      <Label x={64} y={566} size={24} color={C.muted} anchor="start">
        {act2 ? '按权重缩短，首尾相接' : '每个内容向量乘上自己的权重'}
      </Label>
    </g>
  );
}
