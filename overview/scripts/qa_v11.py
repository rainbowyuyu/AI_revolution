"""Check the rendered V11 and extract contextual previews; no source mutations."""
import json,re,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'output/v11'
MOVIE=ROOT/'output/AI进化史_V11_预览1080p.mp4'
config=json.loads((ROOT/'src/timeline-v11.json').read_text(encoding='utf8'))
def run(args):return subprocess.run([str(a) for a in args],capture_output=True,text=True,encoding='utf8',check=True)
info=json.loads(run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',MOVIE]).stdout)
v=next(x for x in info['streams'] if x['codec_type']=='video')
a=next(x for x in info['streams'] if x['codec_type']=='audio')
assert (v['width'],v['height'],v['r_frame_rate'],int(v['nb_frames']))==(1920,1080,'30/1',config['duration']),v
assert abs(float(v['duration'])-config['duration']/30)<.04
assert abs(float(a['duration'])-float(v['duration']))<.1
caps=json.loads((ROOT/'src/captions-v11.json').read_text(encoding='utf8'))
assert all(0<=c['start']<c['end']<=config['duration']/30 for c in caps)
assert all(a['end']<=b['start']+.001 for a,b in zip(caps,caps[1:]))
rows=json.loads((ROOT/'public/audio/v11/voice.json').read_text(encoding='utf8'))
assert all(r['end']<config['duration']/30 for r in rows)
decode=run(['ffmpeg','-v','error','-i',MOVIE,'-f','null','-'])
assert not decode.stderr.strip(),decode.stderr
print('FULL DECODE PASS',flush=True)
loud=run(['ffmpeg','-hide_banner','-i',MOVIE,'-af','loudnorm=I=-14:TP=-1:LRA=11:print_format=json','-f','null','-'])
stats=json.loads(re.search(r'\{\s*"input_i"[\s\S]*?\}',loud.stderr).group())
assert float(stats['input_tp'])<=-1,stats
report=dict(video=info,fullDecode=True,captionsNonoverlapping=True,loudness=stats,voiceTailSeconds=config['duration']/30-max(r['end'] for r in rows),visualReview='Key rendered frames inspected; continuous playback still requires human review.',listeningReview='ASR matched all new narration; no claim of human full listening.')
(OUT/'qa-v11.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
for name,start,length in [('片头',0,config['opening']/30+3),('文献汇总',config['literatureFrom']/30-2,(config['duration']-config['literatureFrom'])/30+2)]:
 dest=OUT/f'V11_{name}预览1080p.mp4'
 run(['ffmpeg','-v','error','-y','-ss',start,'-i',MOVIE,'-t',length,'-c:v','libx264','-preset','fast','-crf','20','-c:a','aac','-b:a','256k','-movflags','+faststart',dest])
 print('PREVIEW',name,flush=True)
print('V11 QA COMPLETE',stats['input_i'],stats['input_tp'],flush=True)
