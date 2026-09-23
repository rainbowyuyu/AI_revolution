import React from 'react';
import {Field} from './Field';
export const Opening=({f}:{f:number})=><Field kind="opening" f={f}/>;
export const Vision=({f}:{f:number})=><Field kind="vision" f={f}/>;
export const Generation=({f}:{f:number})=><Field kind="generation" f={f}/>;
export const Language=({f}:{f:number})=><Field kind="language" f={f}/>;
export const Space=({f}:{f:number})=><Field kind="space" f={f}/>;
export const Reasoning=({f}:{f:number})=><Field kind="reasoning" f={f}/>;
export const Physical=({f}:{f:number})=><Field kind="physical" f={f}/>;
// V2 ending is composed in Film.tsx; no chapter directory is rendered.
export const Ending=({f}:{f:number})=><Field kind="ending" f={f}/>;
