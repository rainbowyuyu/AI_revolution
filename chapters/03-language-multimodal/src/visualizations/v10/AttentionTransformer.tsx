import React from 'react';
import {SceneProps} from './primitives';
import {CoreTransformer} from './CoreTransformer';
import {CoreAttention} from './CoreAttention';

export const AttentionMechanism:React.FC<SceneProps>=(p)=>
 p.phase==='weighted'&&p.focus==='回到图形'
  ?<CoreTransformer {...p} phase="residual"/>
  :<CoreAttention {...p}/>;

export const TransformerMechanism:React.FC<SceneProps>=(p)=><CoreTransformer {...p}/>;