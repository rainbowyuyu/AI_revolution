import React from "react";
import {SafeImage} from '../SvgImageV11';

const S = 220;
const N = 14;
const C = S / N;
const TOP = 84;
const XS = [40, 400, 760];
const CX = [160, 520, 880];
const hash = (i: number, j: number) => 24 + ((((i * 37 + j * 91 + i * j * 13 + (i + 3) * (j + 5) * 7) % 233) + 233) % 233);

type Props = { progress: number; frame: number; variant?: string; idPrefix?: string; imageSrc?: string; noiseSrc?: string; mixedSrc?: string; nextMixedSrc?: string; mixProgress?:number; signalCoefficient?:number; noiseCoefficient?:number };

export function DiffusionLesson({ progress, frame, idPrefix = "dl", imageSrc, noiseSrc, mixedSrc, nextMixedSrc, mixProgress=0, signalCoefficient, noiseCoefficient }: Props) {
  const p = Math.min(1, Math.max(0, progress));
  const a = Math.pow(Math.cos((p * Math.PI) / 2), 2);
  const sa = signalCoefficient ?? Math.sqrt(a);
  const sn = noiseCoefficient ?? Math.sqrt(1 - a);
  const clip = `url(#${idPrefix}-clip)`;

  const noiseRects = () =>
    Array.from({ length: N * N }, (_, k) => {
      const i = k % N;
      const j = (k / N) | 0;
      const v = hash(i, j);
      return <rect key={k} x={i * C} y={j * C} width={C + 0.5} height={C + 0.5} fill={`rgb(${v},${v},${v})`} />;
    });

  return (
    <g fontFamily="NotoSansSC">
      <defs>
        <clipPath id={`${idPrefix}-clip`}>
          <rect width={S} height={S} />
        </clipPath>
      </defs>

      {["原图", "固定噪声", "带噪图"].map((t, i) => (
        <text key={t} x={CX[i]} y={52} fill="#f8efdb" fontSize={26} textAnchor="middle" letterSpacing={2}>
          {t}
        </text>
      ))}

      <g transform={`translate(${XS[0]},${TOP})`}>
        {imageSrc && (
          <SafeImage href={imageSrc} width={S} height={S} preserveAspectRatio="xMidYMid slice" />
        )}
        <rect width={S} height={S} fill="none" stroke="#d9bb8e" strokeWidth={1.5} opacity={0.7} />
      </g>

      <g transform={`translate(${XS[1]},${TOP})`} clipPath={clip}>
        {noiseSrc?<SafeImage href={noiseSrc} width={S} height={S} preserveAspectRatio="xMidYMid meet"/>:noiseRects()}
      </g>

      <g transform={`translate(${XS[2]},${TOP})`}>
        <rect width={S} height={S} fill="#101a2b" />
        {mixedSrc?<><SafeImage href={mixedSrc} width={S} height={S} preserveAspectRatio="xMidYMid meet"/>{nextMixedSrc&&<SafeImage href={nextMixedSrc} width={S} height={S} preserveAspectRatio="xMidYMid meet" opacity={mixProgress}/>}</>:<>{imageSrc&&<SafeImage href={imageSrc} width={S} height={S} opacity={sa}/>}<g opacity={sn}>{noiseRects()}</g></>}
      </g>
      <line x1={436} y1={396} x2={604} y2={396} stroke="#f8efdb" strokeWidth={1} opacity={0.3} />
      <rect x={464} y={396 - sa * 78} width={44} height={sa * 78} rx={3} fill="#d9bb8e" opacity={0.85} />
      <rect x={532} y={396 - sn * 78} width={44} height={sn * 78} rx={3} fill="#91cdd1" opacity={0.85} />
      <text x={520} y={417} fill="#f8efdb" fontSize={25} textAnchor="middle" opacity={0.9}>
        图像 × {sa.toFixed(2)} ＋ 噪声 × {sn.toFixed(2)}
      </text>
    </g>
  );
}
