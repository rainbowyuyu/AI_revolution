"""Export readable narration and subtitles from the current recorded timelines."""
import json,csv,io,shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def read(p):return json.loads(p.read_text(encoding='utf8'))
def stamp(frame,fps=30):
 ms=round(frame/fps*1000);s,ms=divmod(ms,1000);m,s=divmod(s,60);h,m=divmod(m,60)
 return f'{h:02}:{m:02}:{s:02},{ms:03}'
def main():
 ch=ROOT/'chapters/01-vision-choice';out=ch/'supplements';out.mkdir(exist_ok=True)
 tl=read(ch/'src/timeline-v9.json')
 (out/'中文字幕_V9.srt').write_text('\n\n'.join(f'{i+1}\n{stamp(c["from"])} --> {stamp(c["to"])}\n{c["text"]}' for i,c in enumerate(tl['captions']))+'\n',encoding='utf8')
 rows=read(ch/'research/voice-v8-opening.json')+read(ch/'research/voice-timeline-v8.json')
 (out/'口播与实测记录.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 (out/'口播.md').write_text('# 第一章当前口播\n\n来源：V8 片头与主体语音记录，当前 V9 沿用该声音。\n\n'+'\n\n'.join(r['text'] for r in rows)+'\n',encoding='utf8')
 stream=io.StringIO();w=csv.writer(stream,lineterminator="\n");w.writerow(['id','section','title','visual','from_frame','to_frame','duration_frames'])
 for b in tl['beats']:w.writerow([b.get(k,'') for k in ['id','section','title','visual','from','to','duration']])
 (out/'镜头索引_V9.csv').write_text(stream.getvalue(),encoding='utf-8-sig')
 (out/'README.md').write_text('# 当前随片补充材料\n\n中文字幕_V9.srt 和镜头索引来自 src/timeline-v9.json；口播来自当前使用的 V8 语音记录。重新导出：在仓库根目录运行 python tools/export_supplements.py。\n\n这是已有时间线的导出，不做新的 ASR 对齐。完整实验和来源见本章 README。\n',encoding='utf8')
 ov=ROOT/'overview';out=ov/'supplements';out.mkdir(exist_ok=True)
 shutil.copyfile(ov/'docs/evidence/AI进化史_V11_字幕.srt',out/'中文字幕_V11.srt')
 voice=read(ov/'public/audio/v11/voice.json')
 (out/'口播与实测记录.json').write_text(json.dumps(voice,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 (out/'口播.md').write_text('# 总览 V11 口播\n\n'+'\n\n'.join(r['text'] for r in voice)+'\n',encoding='utf8')
 print('Exported current chapter/overview supplements')
if __name__=='__main__':main()
