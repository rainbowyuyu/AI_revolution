import React from 'react';
import {Img} from 'remotion';
/** Unlike an SVG image element, Img blocks capture until the image is decoded. */
export function SafeImage({href,x=0,y=0,width,height,opacity=1,transform,preserveAspectRatio='xMidYMid meet'}:{href:string;x?:number|string;y?:number|string;width:number|string;height:number|string;opacity?:number|string;transform?:string;preserveAspectRatio?:string}){
 return <g transform={transform} opacity={opacity}><foreignObject x={x} y={y} width={width} height={height}><Img src={href} style={{width:'100%',height:'100%',display:'block',objectFit:preserveAspectRatio.includes('slice')?'cover':preserveAspectRatio==='none'?'fill':'contain'}}/></foreignObject></g>;
}
