"""Resumable local Qwen3 voice; source text and cache fingerprint are saved."""
import os
os.environ['HF_HUB_OFFLINE']='1';os.environ['TOKENIZERS_PARALLELISM']='false'
import hashlib,json,pathlib,re,time,sys
import numpy as np
import soundfile as sf
import torch
from qwen_tts import Qwen3TTSModel
from story import build
R=pathlib.Path(__file__).resolve().parents[1];T=pathlib.Path(os.environ['RAINBOW_TTS_ROOT']);OUT=R/'public/audio';torch.set_num_threads(4)
def chunks(text):
 pieces=re.split(r'(?<=[。？！；])',text);out=[];buf=''
 for p in pieces:
  if len(buf+p)>85 and buf:out.append(buf);buf=''
  buf+=p
 if buf:out.append(buf)
 return out

if __name__ == '__main__':
 raise SystemExit('Use audio_v8.py voice for the opening; see repository docs/AUDIO.md for body regeneration.')
