"""Offline checks of repository metadata, evidence, paths and publication hygiene."""
import ast,json,math,re,subprocess
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
 chapter=ROOT/'chapters/01-vision-choice'
 cnn=json.loads((chapter/'public/experiments/cnn.json').read_text(encoding='utf8'))
 for s in cnn['samples']:
  if abs(sum(s['probabilities'])-1)>1e-5:errors.append('CNN probabilities do not sum to one')
  if not (chapter/'public'/s['image']).exists():errors.append('Missing CIFAR sample')
 search=json.loads((chapter/'public/experiments/search.json').read_text(encoding='utf8'))
 for r in search['runs']:
  if len(r['games'])!=60 or r['wins']+r['draws']+r['losses']!=60:errors.append('Search result count mismatch')
 for m in json.loads((ROOT/'assets/manifest.json').read_text(encoding='utf8'))['assets']:
  if not (ROOT/m['path']).resolve().is_relative_to(ROOT):errors.append('Asset path escapes repository')
 print(json.dumps(dict(files=count,errors=errors,checks=['JSON/Python syntax','credential patterns (values suppressed)','chapter registry','CNN distributions','MCTS game counts','asset path bounds']),ensure_ascii=False,indent=2))
 if errors:raise SystemExit(1)
if __name__=='__main__':main()
