"""Offline checks of repository metadata, evidence, paths and publication hygiene."""
import ast,json,math,re,subprocess
from urllib.parse import unquote
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def main():
 errors=[];count=0
 try:paths=subprocess.check_output(['git','ls-files','-z','--cached','--others','--exclude-standard'],cwd=ROOT,text=True,encoding='utf8').split('\0')
 except subprocess.CalledProcessError:paths=[str(p.relative_to(ROOT)) for p in ROOT.rglob('*') if p.is_file() and not any(x in p.parts for x in ['node_modules','.git','__pycache__'])]
 secret=re.compile(r'\b(?:sk-[A-Za-z0-9]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})|-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----')
 for rel in set(paths):
  p=ROOT/rel
  if not p.is_file():continue
  if p.stat().st_size>45*1024**2:errors.append(rel+': exceeds source repository size limit')
  if p.suffix.lower() in ['.md','.py','.json','.ts','.tsx','.mjs','.txt','.csv','.srt','.yaml','.yml']:
   try:s=p.read_text(encoding='utf-8-sig')
   except UnicodeError:errors.append(rel+': not UTF-8');continue
   if secret.search(s):errors.append(rel+': potential credential; value suppressed')
   try:
    if p.suffix=='.json':json.loads(s)
    elif p.suffix=='.py':ast.parse(s,filename=rel)
   except Exception as e:errors.append(rel+': '+type(e).__name__)
  count+=1
 series=json.loads((ROOT/'series.json').read_text(encoding='utf8'))
 for p in [series['overview'],*series['chapters']]:
  if not (ROOT/p['path']/'README.md').exists():errors.append(p['path']+': missing chapter README')
 ch02=ROOT/'chapters/02-generation'
 registered=next(c for c in series['chapters'] if c['id']=='02')
 meta=json.loads((ch02/'chapter.json').read_text(encoding='utf8'))
 timeline=json.loads((ch02/'supplements/timeline.json').read_text(encoding='utf8'))
 for key in ('status','version','composition','fps','frames'):
  if meta.get(key)!=registered.get(key):errors.append('Chapter 02 registry mismatch: '+key)
 if meta.get('fps')!=timeline['fps'] or meta.get('frames')!=timeline['durationFrames']:errors.append('Chapter 02 timeline metadata mismatch')
 for rel in meta.get('materials',{}).values():
  if not (ch02/rel).resolve().is_relative_to(ch02) or not (ch02/rel).is_file():errors.append('Chapter 02 material path invalid: '+rel)
 end=0
 for scene in timeline['scenes']:
  if scene['startFrame']!=end or scene['durationFrames']<=0:errors.append('Chapter 02 timeline gap or overlap')
  end=scene['startFrame']+scene['durationFrames']
 if end!=meta['frames']:errors.append('Chapter 02 timeline does not cover declared duration')
 ch03=ROOT/'chapters/03-language-multimodal'
 registered03=next(c for c in series['chapters'] if c['id']=='03')
 meta03=json.loads((ch03/'chapter.json').read_text(encoding='utf8'))
 timeline03=json.loads((ch03/'supplements/timeline.json').read_text(encoding='utf8'))
 for key in ('status','version','composition','fps','frames'):
  if meta03.get(key)!=registered03.get(key):errors.append('Chapter 03 registry mismatch: '+key)
 if meta03['fps']!=timeline03['fps'] or meta03['frames']!=timeline03['durationFrames']:errors.append('Chapter 03 timeline metadata mismatch')
 for rel in meta03.get('materials',{}).values():
  if not (ch03/rel).resolve().is_relative_to(ch03) or not (ch03/rel).is_file():errors.append('Chapter 03 material path invalid: '+rel)
 end03=0
 for section in timeline03['sections']:
  if section['from']!=end03 or section['to']<=section['from']:errors.append('Chapter 03 section gap or overlap')
  end03=section['to']
 if end03!=meta03['frames']:errors.append('Chapter 03 sections do not cover duration')
 unit_ids={u['id'] for u in timeline03['units']}
 if len(unit_ids)!=len(timeline03['units']):errors.append('Chapter 03 duplicate unit ID')
 section_ids={s['id'] for s in timeline03['sections']}
 for unit in timeline03['units']:
  if unit['section'] not in section_ids or not 0<=unit['from']<unit['to']<=meta03['frames']:errors.append('Chapter 03 invalid unit bounds')
 caption_end=0
 for caption in timeline03['captions']:
  if not caption_end<=caption['from']<caption['to']<=meta03['frames']:errors.append('Chapter 03 subtitle overlap/bounds')
  caption_end=caption['to']
 # Check only the newly maintained chapter and root entry, not third-party URLs.
 for doc in [ROOT/'README.md',*ch03.rglob('*.md')]:
  if any(part in ('node_modules','runs') for part in doc.parts):continue
  content=doc.read_text(encoding='utf-8-sig')
  links=re.findall(r'!?\[[^\]]*\]\(([^\s)]+)',content)+re.findall(r'(?:src|href)="([^"]+)"',content)
  for link in links:
   if link.startswith(('https:','http:','mailto:','#','data:')):continue
   local=unquote(link.split('#',1)[0])
   if local and not (doc.parent/local).exists():errors.append(str(doc.relative_to(ROOT))+': broken local link '+local)
 public=(ch02/'public').resolve()
 for asset in json.loads((ch02/'assets/video-manifest.json').read_text(encoding='utf8'))['assets']:
  if not (public/asset['path']).resolve().is_relative_to(public):errors.append('Chapter 02 asset escapes public directory')
  if not re.fullmatch(r'[0-9a-f]{64}',asset['sha256']) or asset['bytes']<=0:errors.append('Chapter 02 asset metadata invalid')
 chapter=ROOT/'chapters/01-vision-choice'
 cnn=json.loads((chapter/'public/experiments/cnn.json').read_text(encoding='utf8'))
 for s in cnn['samples']:
  if abs(sum(s['probabilities'])-1)>1e-5:errors.append('CNN probabilities do not sum to one')
  if not (chapter/'public'/s['image']).exists():errors.append('Missing CIFAR sample')
 search=json.loads((chapter/'public/experiments/search.json').read_text(encoding='utf8'))
 for r in search['runs']:
  if len(r['games'])!=60 or r['wins']+r['draws']+r['losses']!=60:errors.append('Search result count mismatch')
 for m in json.loads((ROOT/'shared/assets/manifest.json').read_text(encoding='utf8'))['assets']:
  if not (ROOT/m['path']).resolve().is_relative_to(ROOT):errors.append('Asset path escapes repository')
 print(json.dumps(dict(files=count,errors=errors,checks=['JSON/Python syntax','credential patterns (values suppressed)','chapter registry','CNN distributions','MCTS game counts','asset path bounds','Chapter 02 registry/materials/timeline','Chapter 03 registry/materials/timeline/subtitles/local links']),ensure_ascii=False,indent=2))
 if errors:raise SystemExit(1)
if __name__=='__main__':main()
