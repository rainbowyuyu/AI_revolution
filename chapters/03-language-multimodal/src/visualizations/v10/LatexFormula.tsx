import React from 'react';
import assets from './latex-assets-v8.json';

/** Real LaTeX outlines: no font loading, baseline reflow, or Unicode substitutes. */
export function LatexFormula({id,x,y,size=32,anchor='middle',color='#f5f0e8',opacity=1,maxWidth=1120}:{id:string;x:number;y:number;size?:number;anchor?:'start'|'middle'|'end';color?:string;opacity?:number;maxWidth?:number}){
 const formula=(assets as Record<string,{tex:string;viewBox:number[];inner:string}>)[id];
 if(!formula)throw new Error(`Uncompiled LaTeX formula: ${id}`);
 const [vx,vy,w,h]=formula.viewBox,scale=Math.min(size/10,maxWidth/w),width=w*scale,height=h*scale;
 const left=x-(anchor==='middle'?width/2:anchor==='end'?width:0);
 return <svg x={left} y={y-height/2} width={width} height={height} viewBox={`${vx} ${vy} ${w} ${h}`} aria-label={formula.tex} role="img" style={{color,overflow:'visible'}} opacity={opacity}>
  <g fill="currentColor" dangerouslySetInnerHTML={{__html:formula.inner}}/>
 </svg>;
}
