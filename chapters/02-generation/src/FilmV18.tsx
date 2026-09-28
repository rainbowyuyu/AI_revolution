import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {FilmV16} from './FilmV16';

// V18 keeps the checked visuals and subtitle timing; one new audio master only.
export function FilmV18({audio=true,clean=false}:{audio?:boolean;clean?:boolean}) {
  return <AbsoluteFill>
    <FilmV16 audio={false} clean={clean}/>
    {audio&&<Audio src={staticFile('audio/v18/master.wav')}/>}
  </AbsoluteFill>;
}
