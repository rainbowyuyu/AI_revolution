"""Numerical checks only: they do not certify pronunciation or human intelligibility."""
import pathlib,json,re,difflib
import numpy as np,soundfile as sf
from scipy.signal import correlate,correlation_lags
R=pathlib.Path(__file__).resolve().parents[1]
def read(p):return json.loads((R/p).read_text('utf8'))
cfg=read('src/timeline-v7.json');rows=read('research/voice-timeline-v7.json');out=[]
for c in rows:
 raw,sr=sf.read(R/'public'/c['raw']);clean,cs=sf.read(R/'public'/c['file']);assert sr==cs
 assert len(clean)>=len(raw)+round(sr*.34)
 n=min(len(raw),sr*4);cr=correlate(clean[:n],raw[:n],method='fft');lags=correlation_lags(n,n);mask=np.abs(lags)<sr*.07;lag=int(lags[mask][np.argmax(cr[mask])])
 a=raw[max(0,-lag):min(len(raw),len(clean)-lag)];b=clean[max(0,lag):min(len(clean),len(raw)+lag)]
 hop=sr//20;count=min(len(a),len(b))//hop;ar=np.sqrt(np.mean(a[:count*hop].reshape(count,hop)**2,axis=1));br=np.sqrt(np.mean(b[:count*hop].reshape(count,hop)**2,axis=1));quiet=(ar>1e-5)&(ar<.003)
 reduction=float(np.median(20*np.log10(np.maximum(br[quiet],1e-10)/ar[quiet]))) if quiet.any() else None
 asr=read(f"research/asr/{c['fingerprint']}.json");tail=float(np.sqrt(np.mean(clean[-int(sr*.1):]**2)));assert tail<.0001
 out.append(dict(id=c['id'],repaired=c['repair'],latencyMs=lag/sr*1000,tail100msRMS=tail,quietWindowChangeDB=reduction,asrHeard=asr['heard'],expected=c['text'],durationSeconds=len(clean)/cs))
for a,b in zip(rows,rows[1:]):assert a['end']<=b['start']
for b in cfg['beats']:
 clips=[c for c in rows if c['beat']==b['id']];assert min(c['start'] for c in clips)>=b['from']/30;assert max(c['end'] for c in clips)<b['to']/30
 assert all(a[0]<z[0] and a[1]<=z[1] for a,z in zip(b['anchors'],b['anchors'][1:]))
caps=cfg['captions'];assert all(a['from']<a['to']<=b['from'] for a,b in zip(caps,caps[1:]));assert caps[-1]['to']<cfg['outroFrom']
master=sf.info(R/'public/audio/v7/master.wav');assert master.frames==cfg['duration']*1600 and master.samplerate==48000
changes=[c['quietWindowChangeDB'] for c in out if c['quietWindowChangeDB'] is not None]
result=dict(clips=len(out),repaired=sum(c['repaired'] for c in out),masterFrames=master.frames,videoFrames=cfg['duration'],captionIntervals='ordered and within narration region',clipIntervals='all complete within scene; no duration truncation',medianQuietWindowChangeDB=float(np.median(changes)),medianFilterLatencyMs=float(np.median([c['latencyMs'] for c in out])),limitations='Low-energy windows are not clean-reference SNR. Whisper homophones and numerals do not prove pronunciation quality. No claim of complete human listening.',details=out)
(R/'research/audio-v7-validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),'utf8');print('V7 AUDIO TIMING / TAIL CHECKS PASSED',result['medianQuietWindowChangeDB'],result['medianFilterLatencyMs'],flush=True)
