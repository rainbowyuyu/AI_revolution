import React from 'react';
import timeline from '../../v10/timeline.json';
import {clipEvidence as E} from './clipEvidence';
import {C,Label,Picture,SceneProps,segment,spoken,mix,palette,clamp} from './primitives';
import {TokenBlock} from './AppliedObjects';

/** A conceptual assembly of the demonstrated components, using real retrieval scores. */
export const AssistantWalkthrough:React.FC<SceneProps>=p=>{
 const id=String(p.data?.unitId||''),f=spoken(p),describing=['s20-04','s20-06'].includes(id),checking=id==='s20-06';
 const slide=describing?(checking?1:segment(f,0,.25)):0;
 const photos=E.images.map((d,i)=>({src:d.file.replace(/^public\//,''),id:d.id,label:['红伞 · 蓝门','红车 · 街道','雨伞 · 草地'][i],score:E.queries[1].ranking.find(r=>r.imageId===d.id)!.cosine}));
 const selected={x:mix(45,48,slide),y:mix(138,104,slide),w:mix(367,617,slide),h:mix(239,347,slide)};
 return <g>
  <Label x={48} y={49} size={38} color={C.gold}>{checking?'把答案放回照片旁边':describing?'找到照片，再利用图像生成回答':'找出红伞靠在蓝门边的照片，用一句话说明'}</Label>
  {photos.map((photo,i)=>{
   const a=i===0?1:1-slide,x=i===0?selected.x:45+i*421,y=i===0?selected.y:138;
   const w=i===0?selected.w:367,h=i===0?selected.h:239;
   return <g key={photo.id} opacity={a}>
    <path d={`M${x+9} ${y+8}h${w}v${h}h-${w}Z`} fill="#000" opacity={.36}/>
    <Picture src={photo.src} x={x} y={y} w={w} h={h} cover position="right center"/>
    <path d={`M${x} ${y+h}h${w}`} stroke={i?C.line:C.gold} strokeWidth={i?2:3}/>
    <g opacity={1-slide}>
     <Label x={x+w/2} y={431} anchor="middle" size={34}>{photo.label}</Label>
     <rect x={x} y={470} width={367} height={26} rx={3} fill={C.line} fillOpacity={.22}/>
     <rect x={x} y={470} width={367*photo.score/.4} height={26} rx={3} fill={i?C.cyan:C.gold}/>
     <Label x={x+w/2} y={550} anchor="middle" size={43} color={i?C.cyan:C.gold}>{photo.score.toFixed(3)}</Label>
    </g>
   </g>;
  })}
  {describing&&<g opacity={slide}>
   {['红伞','靠在','蓝色','门边'].map((word,i)=>{
    const a=checking?1:segment(f,.23+i*.13,.38+i*.13),x=748+i%2*225,y=178+Math.floor(i/2)*136;
    return <g key={word} transform={`translate(${x} ${y+(1-a)*16})`} opacity={a}>
     <Label x={0} y={0} size={49} color={palette[i]}>{word}</Label>
     <path d={`M0 23h${(word.length===2?98:147)*a}`} stroke={palette[i]} strokeWidth={3}/>
    </g>;
   })}
   {checking?<g>
    <rect x={selected.x+selected.w*.665} y={selected.y+selected.h*.12} width={selected.w*.2} height={selected.h*.81} rx={5} fill="none" stroke={C.gold} strokeWidth={2.5} strokeDasharray={`${900*segment(f,.08,.4)} 900`}/>
    <path d={`M${selected.x+selected.w*.89} ${selected.y+selected.h*.14}v${selected.h*.74*segment(f,.4,.79)}`} stroke={C.cyan} strokeWidth={4}/>
    <Label x={364} y={521} anchor="middle" size={34} color={C.gold}>物体、颜色、位置，对回同一幅图</Label>
   </g>:<g>
    <path d="M696 180v213" stroke={C.line} strokeWidth={2}/>
    <Label x={967} y={460} anchor="middle" size={33} color={C.muted}>预测 → 选择 → 接回输入</Label>
   </g>}
  </g>}
  <Label x={650} y={621} anchor="middle" size={34} color={C.muted}>{checking?'一个任务，串起检索与回答':describing?'图像和要求一起参与后续词元的生成':'图文编码 → 比较相似度 → 保留候选'}</Label>
 </g>;
};
