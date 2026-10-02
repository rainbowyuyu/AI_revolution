import React from 'react';
import timeline from '../../v10/timeline.json';
import {AlignmentMechanism,MultimodalMechanism} from './AlignmentMultimodal';
import {AttentionMechanism,TransformerMechanism} from './AttentionTransformer';
import {ProbabilityMechanism,ClipMechanism} from './ProbabilityClip';
import {ClipEvidenceMechanism} from './ClipEvidenceMechanism';
import {TokenMechanism,EmbeddingMechanism} from './TokenEmbedding';
import {C,Label,Picture,Vector,Transfer,Arrow,SceneProps,clamp,segment,mix,progress,spoken,palette} from './primitives';
import {OverviewScene} from './OverviewScene';
import {visualLayoutKey} from './layoutKey';
export type TeachingVisualProps=SceneProps&{scene:string;width?:number;height?:number};
const units=timeline.units;
function timedProps(p:SceneProps):SceneProps{
 // New editions inject their measured stage clock; never recalculate it from
 // the older film's sentence offsets after narrated inserts have been added.
 if(typeof p.data?.stageProgress==='number')return p;
 const id=String(p.data?.unitId||''),i=units.findIndex(u=>u.id===id);if(i<0)return p;
 const u=units[i];
 // A new composition gets its own stage. Within a composition, semantic phases
 // remain separate unless they explicitly describe the same continuous operation.
 const stageKey=(v:typeof u)=>{
  const phase=v.visual==='sft'&&['loss','behavior'].includes(v.phase)?'learning':v.phase;
  return `${v.section}|${v.visual}|${phase}|${visualLayoutKey(v.visual,v.phase,v.focus,v.id)}`;
 };
 const key=stageKey(u);let lo=i,hi=i;
 while(lo>0&&stageKey(units[lo-1])===key)lo--;
 while(hi+1<units.length&&stageKey(units[hi+1])===key)hi++;
 const section=timeline.sections.find(s=>s.id===u.section)!;
 return {...p,data:{...p.data,stageProgress:clamp((p.frame+section.from-units[lo].from)/Math.max(1,units[hi].to-units[lo].from-15))}};
}
export const TeachingVisual:React.FC<TeachingVisualProps>=({scene,width=1300,height=650,...raw})=>{
 const p=timedProps(raw);let node:React.ReactNode;
 switch(scene){case'token':node=<TokenMechanism {...p}/>;break;case'embedding':node=<EmbeddingMechanism {...p}/>;break;case'attention':node=<AttentionMechanism {...p}/>;break;case'transformer':node=<TransformerMechanism {...p}/>;break;case'next-token':node=<ProbabilityMechanism {...p}/>;break;case'clip':node=['ranking','failure','crop','letterbox'].includes(p.phase||'')?<ClipEvidenceMechanism {...p}/>:<ClipMechanism {...p}/>;break;case'sft':case'preference':node=<AlignmentMechanism {...p} mode={scene}/>;break;case'multimodal':node=<MultimodalMechanism {...p}/>;break;default:node=<OverviewScene {...p}/>;}
 return <svg width={width} height={height} viewBox="0 0 1300 650" role="img" aria-label={`${scene} 动态机制演示`} style={{overflow:'visible'}}>{node}</svg>;
};
