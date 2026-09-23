import React,{useEffect,useState} from 'react';
import {delayRender,continueRender,cancelRender,staticFile} from 'remotion';
import layerData from '../public/experiments/v4/cnn-layers.json';
import experiments from './experiments.json';
const paths=new Set<string>();
function collect(v:unknown):void{if(typeof v==='string'&&v.startsWith('experiments/')&&v.endsWith('.png'))paths.add(v);else if(v&&typeof v==='object')Object.values(v).forEach(collect);}
collect(experiments.cnn?.samples);collect(layerData.samples[0]);collect(layerData.update.image);
export function FontGate({children}:{children:React.ReactNode}){
 const [handle]=useState(()=>delayRender('Loading bundled OFL font'));
 const [ready,setReady]=useState(false);
 useEffect(()=>{const fonts=['NotoSansSC','NotoSerifSC'].map(async name=>{const font=new FontFace(name,`url(${staticFile('fonts/'+name+'.ttf')})`,{weight:'100 900'});const loaded=await font.load();(document.fonts as unknown as {add:(font:FontFace)=>void}).add(loaded)});const textures=[...paths].map(src=>new Promise<void>((resolve,reject)=>{const img=new window.Image();img.onload=()=>img.decode().then(resolve,reject);img.onerror=()=>reject(new Error('Failed to preload experiment image: '+src));img.src=staticFile(src);}));Promise.all([...fonts,...textures]).then(()=>setReady(true)).catch(cancelRender)},[]);
 useEffect(()=>{if(ready)continueRender(handle)},[ready,handle]);
 return ready?<>{children}</>:null;
}
