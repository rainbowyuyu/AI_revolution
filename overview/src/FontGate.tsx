import React,{useEffect,useState} from 'react';
import {delayRender,continueRender,cancelRender,staticFile} from 'remotion';
export function FontGate({children}:{children:React.ReactNode}){
 const [handle]=useState(()=>delayRender('Loading bundled OFL font'));
 const [ready,setReady]=useState(false);
 useEffect(()=>{Promise.all(['NotoSansSC','NotoSerifSC'].map(async name=>{const font=new FontFace(name,`url(${staticFile('fonts/'+name+'.ttf')})`,{weight:'100 900'});const loaded=await font.load();(document.fonts as unknown as {add:(font:FontFace)=>void}).add(loaded)})).then(()=>setReady(true)).catch(cancelRender)},[]);
 useEffect(()=>{if(ready)continueRender(handle)},[ready,handle]);
 return ready?<>{children}</>:null;
}
