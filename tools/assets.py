"""Audit/restore external media from an original project tree, with SHA-256 checks."""
import argparse,hashlib,json,shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def digest(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for chunk in iter(lambda:f.read(8*1024*1024),b''):h.update(chunk)
 return h.hexdigest()
def within(root,rel):
 p=(root/rel).resolve()
 if not p.is_relative_to(root.resolve()):raise ValueError('Path outside root: '+rel)
 return p
def main():
 p=argparse.ArgumentParser(description=__doc__)
 p.add_argument('command',choices=['status','restore'])
 p.add_argument('--project',help='Project path registered in the asset manifest')
 p.add_argument('--source-root',type=Path,help='Folder containing ai_evolution_trailer and ai_evolution_ch01_vision_choice')
 p.add_argument('--include-voice-clips',action='store_true')
 p.add_argument('--verify',action='store_true',help='Hash existing files instead of only checking presence and size')
 a=p.parse_args()
 if a.command=='restore' and not a.source_root:p.error('restore requires --source-root')
 rows=json.loads((ROOT/'assets/manifest.json').read_text(encoding='utf8'))['assets']
 if a.project and a.project not in {r['project'] for r in rows}:p.error('Unknown project in asset manifest')
 rows=[r for r in rows if (not a.project or r['project']==a.project) and (a.include_voice_clips or r['kind']!='voice-clips')]
 missing=[];bad=[];restored=0
 for r in rows:
  dest=within(ROOT,r['path'])
  if dest.exists():
   if dest.stat().st_size!=r['bytes'] or (a.verify and digest(dest)!=r['sha256']):bad.append(r['path'])
   continue
  if a.command=='restore':
   src=within(a.source_root, r['sourceProject']+'/'+r['sourcePath'])
   if not src.is_file():missing.append(r['path']);continue
   if digest(src)!=r['sha256']:bad.append(r['path']);continue
   dest.parent.mkdir(parents=True,exist_ok=True)
   tmp=dest.with_suffix(dest.suffix+'.tmp');shutil.copyfile(src,tmp);tmp.replace(dest);restored+=1
  else:missing.append(r['path'])
 print(json.dumps(dict(considered=len(rows),restored=restored,missingCount=len(missing),mismatchCount=len(bad),missing=missing[:12],mismatches=bad[:12]),ensure_ascii=False,indent=2))
 if bad or missing:raise SystemExit(1)
if __name__=='__main__':main()
