"""Register explicitly selected media in the external manifest; never scan private directories."""
import argparse,json
from pathlib import Path
from assets import ROOT,digest,within

def main():
 p=argparse.ArgumentParser(description=__doc__)
 p.add_argument('--project',required=True)
 p.add_argument('--source-project',help='Name of this project directory inside the media backup')
 p.add_argument('--kind',required=True,choices=['media','papers','fonts','audio','voice-clips','pdf-original'])
 p.add_argument('files',nargs='+',help='Paths relative to the selected project')
 a=p.parse_args();project=within(ROOT,a.project)
 if not (project/'README.md').is_file():p.error('Project README not found')
 source=a.source_project or {'overview':'ai_evolution_trailer','chapters/01-vision-choice':'ai_evolution_ch01_vision_choice'}.get(a.project,project.name)
 if '/' in source or '\\' in source or source in ['.','..']:p.error('source-project must be a directory name')
 manifest=ROOT/'assets/manifest.json';doc=json.loads(manifest.read_text(encoding='utf8'))
 rows={r['path']:r for r in doc['assets']}
 for rel in a.files:
  f=within(project,rel)
  if not f.is_file():p.error('File not found: '+rel)
  key=f.relative_to(ROOT).as_posix()
  rows[key]=dict(project=project.relative_to(ROOT).as_posix(),path=key,sourceProject=source,sourcePath=f.relative_to(project).as_posix(),bytes=f.stat().st_size,sha256=digest(f),kind=a.kind)
 doc['assets']=sorted(rows.values(),key=lambda r:r['path'])
 manifest.write_text(json.dumps(doc,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 print('Registered',len(a.files),'assets')
if __name__=='__main__':main()
