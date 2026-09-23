"""Word-align new narration, retain unchanged clips, and mix a continuous V11 score."""
import os
os.environ['HF_HUB_OFFLINE']='1'
import json,re,difflib,subprocess,math
from pathlib import Path
import numpy as np
import soundfile as sf
from faster_whisper import WhisperModel
from scipy.signal import fftconvolve
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'public/audio/v11'
new=json.loads((OUT/'intro-voice.json').read_text(encoding='utf8'))
assert len(new)==5
overview=round((new[3]['start']-.20)*30)
opening=math.ceil((new[-1]['end']+1.8)*30)
lit=opening+5250-960;duration=lit+510;shift=(opening-960)/30
config=dict(fps=30,opening=opening,overviewFrom=overview,overviewSecond=round((new[4]['start']-.15)*30),questionsFrom=round(new[1]['start']*30),literatureFrom=lit,duration=duration)
(ROOT/'src/timeline-v11.json').write_text(json.dumps(config,indent=2),encoding='utf8')
old=json.loads((ROOT/'public/audio/voice.json').read_text(encoding='utf8'))
rows=list(new)
for r in old:
 if 32<=r['start']<175:rows.append(dict(r,start=r['start']+shift,end=r['end']+shift))
for i in range(2):
 r=next(r for r in old if r['id']==f'literature-{i}')
 at=lit/30+[.65,7.05][i]
 rows.append(dict(r,start=at,end=at+r['end']-r['start']))
(OUT/'voice.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8')

model=WhisperModel(str(Path(os.environ['RAINBOW_TTS_ROOT'])/'models/whisper-small'),device='cpu',compute_type='int8',cpu_threads=6)
caps=[];records=[]
for row in new:
 segs,_=model.transcribe(str(ROOT/'public'/row['file']),language='zh',beam_size=5,word_timestamps=True,initial_prompt=row['text'],vad_filter=False)
 words=[dict(text=w.word,start=w.start,end=w.end) for s in segs for w in s.words or []]
 source=[];times=[]
 for w in words:
  chars=re.findall(r'[\w\u4e00-\u9fff]',w['text'])
  for i,c in enumerate(chars):source.append(c);times.append((w['start']+(w['end']-w['start'])*i/max(1,len(chars)),w['start']+(w['end']-w['start'])*(i+1)/max(1,len(chars))))
 target=re.findall(r'[\w\u4e00-\u9fff]',row['text']);mapping={}
 for b in difflib.SequenceMatcher(a=source,b=target,autojunk=False).get_matching_blocks():
  for k in range(b.size):mapping[b.b+k]=times[b.a+k]
 ratio=len(mapping)/len(target)
 print(row['id'],''.join(source),'match',ratio,flush=True)
 assert ratio>.94,(row['id'],source)
 cursor=0
 for piece in filter(None,re.split(r'(?<=[，。？！、])',row['text'])):
  n=len(re.findall(r'[\w\u4e00-\u9fff]',piece));known=[mapping[k] for k in range(cursor,cursor+n) if k in mapping]
  assert known,(row['id'],piece)
  caps.append(dict(start=row['start']+max(0,known[0][0]-.03),end=min(row['end'],row['start']+known[-1][1]+.09),text=piece.rstrip('，。'),alignment='whisper-word-matched'))
  cursor+=n
 records.append(dict(id=row['id'],recognized=''.join(source),matchRatio=ratio,words=words))
oldcaps=json.loads((ROOT/'src/captions.json').read_text(encoding='utf8'))
for c in oldcaps:
 if 32<=c['start']<175:caps.append(dict(c,start=c['start']+shift,end=c['end']+shift))
for r in rows[-2:]:
 original=next(o for o in old if o['id']==r['id'])
 delta=r['start']-original['start']
 for c in oldcaps:
  if original['start']-.1<=c['start']<original['end']:caps.append(dict(c,start=c['start']+delta,end=c['end']+delta))
caps.sort(key=lambda c:c['start'])
for a,b in zip(caps,caps[1:]):
 if a['end']>b['start']:a['end']=b['start']
(ROOT/'src/captions-v11.json').write_text(json.dumps(caps,ensure_ascii=False,indent=2),encoding='utf8')
(ROOT/'research/v11-voice-asr.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf8')
def stamp(t):
 ms=round(t*1000);return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'
(ROOT/'output/v11/AI进化史_V11_字幕.srt').write_text('\n\n'.join(f'{i+1}\n{stamp(c["start"])} --> {stamp(c["end"])}\n{c["text"]}' for i,c in enumerate(caps)),encoding='utf8')
sr=48000;N=round(duration/30*sr);voice=np.zeros(N,dtype=np.float32)
for r in rows:
 a,fs=sf.read(ROOT/'public'/r['file'],dtype='float32');assert fs==sr
 k=round(r['start']*sr);assert k+len(a)<=N
 voice[k:k+len(a)]+=a
sf.write(OUT/'narration.wav',voice,sr,subtype='PCM_24')
music=np.zeros((N,2),dtype=np.float32)
chords=[[146.832,220,293.665,349.228],[130.813,196,261.626,329.628],[116.541,174.614,233.082,293.665],[130.813,196,261.626,349.228]]
for k in range(math.ceil(N/sr/8)):
 at=k*8;count=min(11*sr,N-at*sr);t=np.arange(count,dtype=np.float32)/sr
 for j,freq in enumerate(chords[k%4]):
  env=np.minimum(t/1.8,1)*np.minimum((11-t)/2,1)
  wave=(np.sin(2*np.pi*freq*t)+.22*np.sin(2*np.pi*freq*2.002*t)+.10*np.sin(2*np.pi*freq*3*t))*env*.024
  pan=-.65+j*.43
  music[at*sr:at*sr+count,0]+=wave*np.sqrt((1-pan)/2)
  music[at*sr:at*sr+count,1]+=wave*np.sqrt((1+pan)/2)
duck=np.ones(N,dtype=np.float32)
for r in rows:duck[max(0,int((r['start']-.15)*sr)):min(N,int((r['end']+.3)*sr))]=.36
duck=fftconvolve(duck,np.ones(12001,dtype=np.float32)/12001,mode='same')
fade=np.minimum(np.arange(N)/sr/2,1)*np.minimum((N-np.arange(N))/sr/3,1)
music*=duck[:,None]*fade[:,None]
sf.write(OUT/'score.wav',music,sr,subtype='PCM_24')
sf.write(OUT/'premaster.wav',music+voice[:,None]*.93,sr,subtype='PCM_24')
p=subprocess.run(['ffmpeg','-hide_banner','-i',str(OUT/'premaster.wav'),'-af','loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json','-f','null','-'],capture_output=True,text=True,encoding='utf8')
stats=json.loads(re.search(r'\{\s*"input_i"[\s\S]*?\}',p.stderr).group())
(ROOT/'research/v11-loudness-pass1.json').write_text(json.dumps(stats,indent=2),encoding='utf8')
f=f'loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={stats["input_i"]}:measured_TP={stats["input_tp"]}:measured_LRA={stats["input_lra"]}:measured_thresh={stats["input_thresh"]}:offset={stats["target_offset"]}:linear=true'
subprocess.run(['ffmpeg','-v','error','-y','-i',str(OUT/'premaster.wav'),'-af',f,'-ar',str(sr),'-c:a','pcm_s24le',str(OUT/'master.wav')],check=True)
print('V11 AUDIO COMPLETE',config,flush=True)
