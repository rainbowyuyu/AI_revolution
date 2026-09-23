import React,{useEffect,useState} from 'react';
import {delayRender,continueRender,cancelRender} from 'remotion';
function LoadedImage(props:React.SVGProps<SVGImageElement>){
 const [handle]=useState(()=>delayRender('Waiting for experiment SVG image '+String(props.href)));
 useEffect(()=>()=>continueRender(handle),[handle]);
 return <image {...props} onLoad={()=>continueRender(handle)} onError={()=>cancelRender(new Error('Experiment SVG image failed: '+String(props.href)))}/>;
}
export const SvgImage=(props:React.SVGProps<SVGImageElement>)=><LoadedImage key={String(props.href)} {...props}/>;
