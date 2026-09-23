"""Download the exact parquet inputs recorded for Chapter 01, then check SHA-256."""
import argparse,hashlib,json,urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--output-dir',type=Path);a=p.parse_args()
 base=ROOT/'chapters/01-vision-choice/research/experiments/cnn'
 out=a.output_dir or base;out.mkdir(parents=True,exist_ok=True)
 rows=json.loads((base/'mirror-provenance.json').read_text(encoding='utf8'))
 for r in rows:
  dest=out/(r['split']+'.parquet');tmp=dest.with_suffix('.parquet.parts')
  if dest.exists():
   if hashlib.sha256(dest.read_bytes()).hexdigest()!=r['sha256']:raise RuntimeError('Existing data checksum mismatch: '+dest.name)
  else:
   with urllib.request.urlopen(r['url'],timeout=120) as response,tmp.open('wb') as f:
    while chunk:=response.read(1024*1024):f.write(chunk)
   if hashlib.sha256(tmp.read_bytes()).hexdigest()!=r['sha256']:raise RuntimeError('Download checksum mismatch: '+tmp.name)
   tmp.replace(dest)
  print('VERIFIED',dest.name)
 (out/'mirror-provenance.json').write_text(json.dumps(rows,indent=2),encoding='utf8')
if __name__=='__main__':main()
