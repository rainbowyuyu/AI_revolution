import React from 'react';
import {Img, staticFile} from 'remotion';
import papers from './papers-v4.json';
import type {Props} from './TeachingV15';

const C = {white: '#f8efdb', gold: '#d9bb8e', cyan: '#91cdd1', muted: '#b6ccd0'};
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (n: number) => {const p = clamp(n); return p * p * p * (p * (p * 6 - 15) + 10);};
const mix = (a: number, b: number, p: number) => a + (b - a) * p;

/** One authentic sheet, one continuous camera, a registered sharp PDF crop. */
export function PaperV8({beat, frame}: Props) {
  const id = beat.id.startsWith('reference-') ? beat.id.slice(10) :
    ({'gan-history': 'gan', dcgan: 'dcgan', 'diffusion-history': 'diffusion2015'} as Record<string, string>)[beat.id] ?? 'ddpm';
  const paper = papers.find(p => p.id === id) ?? papers[0];
  const [x0, y0, x1, y1] = paper.cameraFocus;
  const [rx0, ry0, rx1, ry1] = paper.focusRasterRect;
  const w = paper.pageWidth, h = paper.pageHeight;
  const entry = smooth(frame / 42);
  const retreat = smooth((frame - beat.duration + 54) / 54);
  const fade = smooth((frame - beat.duration + 34) / 34);
  // Push toward the original figure while the first sentence introduces it.
  // By the second sentence's main explanation the camera is settled and readable.
  const secondSentence = beat.clips[1]?.from ?? Math.round(beat.duration * .25);
  const zoomEnd = Math.max(100, Math.min(secondSentence + 45, beat.duration * .40));
  const focus = smooth((frame - 34) / Math.max(60, zoomEnd - 34));
  const finalScale = Math.min(980 / (x1 - x0), 482 / (y1 - y0));
  const scale = mix(518 / h, finalScale, focus) * (1 - .022 * retreat);
  const cx = mix(w / 2, (x0 + x1) / 2, focus);
  const cy = mix(h / 2, (y0 + y1) / 2, focus);
  const focusOpacity = smooth(focus / .36);
  const opacity = entry * (1 - fade);

  return <div style={{position: 'absolute', inset: 0, opacity}}>
    <div style={{position: 'absolute', left: 92, top: 305, width: 1064, height: 555,
      overflow: 'hidden', perspective: 2600,
      maskImage: 'linear-gradient(180deg,transparent,black 4%,black 96%,transparent)'}}>
      <div style={{position: 'absolute', left: 530, top: 277, transformStyle: 'preserve-3d',
        transform: `translateY(${(1 - entry) * 10 + retreat * 5}px) rotateY(${mix(-8, -.65, focus) + retreat * .5}deg) rotateX(${mix(2.2, .15, focus)}deg) rotateZ(${mix(-1.15, -.04, focus)}deg)`}}>
        <div style={{position: 'relative', width: w * scale, height: h * scale, transformOrigin: '0 0',
          transform: `translate(${-cx * scale}px,${-cy * scale}px)`,
          background: '#fff', boxShadow: '1px 2px 0 #aba89f,5px 12px 26px #0008'}}>
          <Img src={staticFile(paper.image)} style={{display: 'block', width: w * scale, height: h * scale,
            filter: `blur(${focus * .34 * scale}px)`}} />
          {/* The focus is rendered directly from PDF at >=2.25x its final size.
              It shares page coordinates and camera transform; no CSS filter is
              ever applied to the sharp crop or its parent. Feathering only
              affects the 12-point outer padding, never the evidence itself. */}
          <Img src={staticFile(paper.focusImage)} style={{position: 'absolute',
            left: rx0 * scale, top: ry0 * scale, width: (rx1 - rx0) * scale, height: (ry1 - ry0) * scale,
            opacity: focusOpacity}} />
        </div>
      </div>
    </div>
    <div style={{position: 'absolute', left: 1230, top: 338, width: 545,
      transform: `translateY(${(1 - entry) * 7 + retreat * 4}px)`}}>
      <div style={{fontFamily: 'NotoSerifSC', fontSize: id === 'diffusion2015' ? 61 : 75,
        color: C.gold, fontWeight: 650, lineHeight: 1.15, letterSpacing: 1}}>{paper.label}</div>
      <div style={{fontFamily: 'Georgia', fontSize: id === 'dcgan' ? 29 : 32,
        lineHeight: 1.43, color: C.white, marginTop: 29, fontWeight: 400}}>{paper.title}</div>
      <div style={{height: 1, width: 132,
        background: 'linear-gradient(90deg,#d9bb8e88,transparent)', margin: '27px 0 25px'}} />
      <div style={{fontFamily: 'Georgia', fontSize: 29, color: C.muted,
        lineHeight: 1.45}}>{paper.authors}</div>
      <div style={{fontFamily: 'Georgia', fontSize: 26, color: C.gold,
        lineHeight: 1.35, marginTop: 13}}>{paper.venue}</div>
    </div>
    {beat.id === 'reference-gan' && <div style={{position: 'absolute', left: 1230, top: 270,
      color: C.cyan, fontSize: 27, letterSpacing: 2, opacity: entry * (1 - fade)}}>接下来 · 回到论文原文</div>}
  </div>;
}
