"""Prepare actual title pages and compact bibliography for the overview tableau."""
import json,hashlib,shutil
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import fitz
import requests

ROOT=Path(__file__).resolve().parents[1]
pdfs=ROOT/'research/pdfs/v11';pdfs.mkdir(parents=True,exist_ok=True)
out=ROOT/'public/papers/v11';out.mkdir(parents=True,exist_ok=True)
papers=json.loads((ROOT/'src/literature.json').read_text(encoding='utf8'))
extra=[
 dict(id='clip',short='CLIP',title='Learning Transferable Visual Models From Natural Language Supervision',authors='Alec Radford 等',year='2021',venue='ICML',pdfUrl='https://arxiv.org/pdf/2103.00020'),
 dict(id='3dgs',short='3D Gaussian Splatting',title='3D Gaussian Splatting for Real-Time Radiance Field Rendering',authors='Bernhard Kerbl 等',year='2023',venue='SIGGRAPH',pdfUrl='https://arxiv.org/pdf/2308.04079'),
 dict(id='react',short='ReAct',title='ReAct: Synergizing Reasoning and Acting in Language Models',authors='Shunyu Yao 等',year='2023',venue='ICLR',pdfUrl='https://arxiv.org/pdf/2210.03629'),
 dict(id='diffusion-policy',short='Diffusion Policy',title='Diffusion Policy: Visuomotor Policy Learning via Action Diffusion',authors='Cheng Chi 等',year='2023',venue='RSS',pdfUrl='https://arxiv.org/pdf/2303.04137'),
]
def prepare(p):
 dest=pdfs/(p['id']+'.pdf')
 original=ROOT/'research/pdfs'/(p['id']+'.pdf')
 if original.exists():shutil.copy2(original,dest)
 if not dest.exists():
  r=requests.get(p['pdfUrl'],timeout=90);r.raise_for_status()
  assert r.content[:4]==b'%PDF',p['id']
  dest.write_bytes(r.content)
 doc=fitz.open(dest);page=doc[0];text=page.get_text()
 assert len(text)>100,p['id']
 page.get_pixmap(matrix=fitz.Matrix(2,2),alpha=False).save(out/(p['id']+'.png'))
 (pdfs/(p['id']+'-first-page.txt')).write_text(text,encoding='utf8')
 p=dict(p,image='papers/v11/'+p['id']+'.png',page=1,pageWidth=page.rect.width,pageHeight=page.rect.height,sha256=hashlib.sha256(dest.read_bytes()).hexdigest())
 print('PAGE',p['id'],text[:95].replace('\n',' '),flush=True)
 return p
with ThreadPoolExecutor(max_workers=4) as pool:
 result=list(pool.map(prepare,papers+extra))
(ROOT/'src/literature-v11.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8')
(ROOT/'research/v11-papers.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8')
