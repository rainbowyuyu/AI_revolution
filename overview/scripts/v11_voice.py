"""Generate only V11 opening narration; preserve all V10 audio assets."""
import os
os.environ['HF_HUB_OFFLINE']='1'
os.environ['TOKENIZERS_PARALLELISM']='false'
import hashlib,json,subprocess
from pathlib import Path
import numpy as np
import soundfile as sf
import torch
from qwen_tts import Qwen3TTSModel

ROOT=Path(__file__).resolve().parents[1]
TTS=Path(os.environ['RAINBOW_TTS_ROOT'])
OUT=ROOT/'public/audio/v11';OUT.mkdir(parents=True,exist_ok=True)
texts=[
 '我想用一组可视化视频，把人工智能的历史拆开讲清楚。',
 '它是怎么发展起来的？到底是什么？我们又能用它做什么？',
 '从认出一只猫，到生成一个世界，再到让机器人采取行动。',
 '这个系列分成六章。先看机器怎样看见与选择，怎样创造内容，再看语言如何连接图像和声音。',
 '接着，从照片走进三维空间，从回答问题走向推理和使用工具，最后预测世界、采取行动。',
]
torch.set_num_threads(4)
model=Qwen3TTSModel.from_pretrained(str(TTS/'models/Qwen3-TTS-0.6B'),device_map='cuda:0',dtype=torch.bfloat16,attn_implementation='sdpa')
ref=json.loads((TTS/'work/clone-reference.json').read_text(encoding='utf8'))
prompt=model.create_voice_clone_prompt(ref_audio=str(TTS/'work/clone-reference.wav'),ref_text=ref['text'])
rows=[];start=.45
for i,text in enumerate(texts):
 seed=11201+i
 key=hashlib.sha256((text+str(seed)).encode()+(TTS/'work/clone-reference.wav').read_bytes()).hexdigest()[:12]
 raw=OUT/f'intro-{i}-{key}-raw.wav'
 if not raw.exists():
  torch.manual_seed(seed)
  wav,sr=model.generate_voice_clone(text=text,language='Chinese',voice_clone_prompt=prompt,non_streaming_mode=True,temperature=.6,top_p=.9,repetition_penalty=1.08,max_new_tokens=420)
  sf.write(raw,wav[0],sr,subtype='PCM_24')
 a,sr=sf.read(raw);block=int(sr*.02)
 rms=np.array([np.sqrt(np.mean(a[k:k+block]**2)) for k in range(0,len(a),block)])
 v=np.where(rms>max(.003,float(rms.max())*.03))[0]
 assert len(v)
 a=a[max(0,int(v[0]*block-.1*sr)):min(len(a),int((v[-1]+1)*block+.32*sr))]
 trim=OUT/f'intro-{i}-trim.wav';sf.write(trim,a,sr,subtype='PCM_24')
 dest=OUT/f'intro-{i}.wav'
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(trim),'-af','highpass=f=70,afftdn=nf=-40,equalizer=f=280:t=q:w=0.8:g=-1.5,acompressor=threshold=0.18:ratio=1.8:attack=16:release=120,afade=t=in:d=0.01','-ar','48000','-ac','1','-c:a','pcm_s24le',str(dest)],check=True)
 duration=sf.info(dest).duration
 rows.append(dict(id=f'v11-intro-{i}',text=text,start=start,end=start+duration,file=f'audio/v11/intro-{i}.wav',seed=seed,raw=raw.name))
 start+=duration+.34
 print('GENERATED',i,duration,flush=True)
(OUT/'intro-voice.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8')
print('V11 VOICE COMPLETE',flush=True)
