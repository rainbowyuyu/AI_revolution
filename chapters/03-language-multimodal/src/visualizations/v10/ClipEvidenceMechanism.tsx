import React from 'react';
import {InputWindow} from './InputWindow';
import {clipEvidence as E} from './clipEvidence';
import {C,Label,Picture,SceneProps,progress,spoken,segment,mix,clamp} from './primitives';
const photos=E.images.map(d=>({id:d.id,src:d.file.replace(/^public\//,''),label:({umbrella_blue_door:'红伞 · 蓝门',red_car:'红车 · 街道',umbrella_grass:'雨伞 · 草地'} as Record<string,string>)[d.id]}));
// Narration also names other candidates. It must not select the active query:
// s14-02 mentions the blue door while still demonstrating the broad umbrella query.
const queryByUnit:Record<string,number>={
 's13-08':0,'s14-01':0,'s14-02':0,'s14-03':1,'s14-04':2,
 's14-05':2,'s14-06':2,'s14-07':2,'s14-08':2,'s14-09':2,
 's14-10':4,'s14-11':4,'s14-12':1,
};

export const ClipEvidenceMechanism:React.FC<SceneProps>=p=>{
 const phase=p.phase,focus=p.focus||'',id=String(p.data?.unitId||''),t=progress(p),f=spoken(p);
 if(phase==='crop'||phase==='letterbox')return <InputWindow {...p}/>;
 // Known film units have explicit query/condition assignments. Focus-only fallback
 // supports isolated mechanism previews without letting spoken result text switch data.
 const wrong=/不存在|倒过来|蓝伞/.test(focus),car=/红车|汽车/.test(focus),full=/完整|蓝门|位置条件/.test(focus);
 const fixed=id?id==='s14-08':/回到第一|重新运行/.test(focus);
 const qi=queryByUnit[id]??(wrong?4:car?2:full?1:0),q=(fixed?E.letterboxQueries:E.queries)[qi];
 const prev=id==='s14-10'?E.letterboxQueries[2]:E.queries[id==='s14-03'?0:id==='s14-04'?1:id==='s14-08'?2:id==='s14-12'?4:qi];
 // The spoken result arrives early: settle during the query introduction, so
 // the exact measured number is already readable when the narration names it.
 const zh=['一张雨伞的照片','红伞靠在蓝门边，刚下过雨','街上的红色汽车','晴天草地上撑开的伞','蓝伞靠在红色门边'][qi],rows=photos.map(photo=>q.ranking.find(r=>r.imageId===photo.id)!),current=photos.map((photo,i)=>mix(prev.ranking.find(r=>r.imageId===photo.id)!.cosine,rows[i].cosine,segment(f,0,.13))),max=Math.max(...current);
 return <g><Label x={48} y={43} size={38} color={C.gold}>{zh}</Label><Label x={48} y={91} size={30} color={C.muted}>{q.query}</Label>
  {photos.map((photo,i)=>{const val=current[i],x=49+i*416,win=Math.abs(val-max)<1e-9,rank=current.filter(v=>v>val).length+1,hot=clamp((val-Math.min(...current))/.12),lift=6*hot;return <g key={photo.id}>
   <path d={`M${x} ${405-lift}l12 12h368V${152-lift}l-12-12`} fill={C.cyan} fillOpacity={.035} stroke={C.line} strokeOpacity={.35}/><Picture src={photo.src} x={x} y={140-lift} w={369} h={265} cover position="right center"/>
   <path d={`M${x} ${421-lift}h369`} stroke={win?C.gold:C.line} strokeWidth={win?4:1.5}/>
   <circle cx={x+30} cy={441} r={25} fill={C.ink} stroke={win?C.gold:C.line} strokeWidth={2}/><Label x={x+30} y={453} anchor="middle" size={30} color={win?C.gold:C.muted}>{rank}</Label><Label x={x+214} y={455} anchor="middle" size={34}>{photo.label}</Label>
   <rect x={x} y={489} width={369} height={22} fill={C.line} fillOpacity={.24}/><rect x={x} y={489} width={369*clamp(val/.4)} height={22} fill={win?C.gold:C.cyan}/><path d={`M${x+369*clamp(val/.4)} 481v39`} stroke={win?C.gold:C.cyan} strokeWidth={2}/><Label x={x+184} y={571} anchor="middle" size={46} color={win?C.gold:C.ivory}>{val.toFixed(3)}</Label>
   </g>})}
  <Label x={650} y={628} anchor="middle" size={31} color={C.muted}>{qi===4?'中央裁剪输入 · 候选都不完全匹配，第一名仍会出现':fixed?'保持模型、查询和候选不变，仅保留整幅输入':'余弦相似度：用于比较候选，不是答对概率'}</Label>
 </g>;
};
