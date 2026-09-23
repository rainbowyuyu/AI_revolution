"""Run fresh experiments in an isolated output directory; preserve published evidence."""
import argparse,shutil,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];CH=ROOT/'chapters/01-vision-choice'
def main():
 p=argparse.ArgumentParser(description=__doc__)
 p.add_argument('experiment',choices=['cnn','dqn','search'])
 p.add_argument('--run-dir',required=True,type=Path)
 p.add_argument('--dataset-dir',type=Path,help='Required for CNN: verified train/test parquet plus provenance')
 a=p.parse_args();dest=a.run_dir.resolve()
 if dest.exists() and any(dest.iterdir()):p.error('run-dir must be new or empty to avoid stale results')
 if dest==CH or CH in dest.parents:p.error('Choose runs/ or another location outside the published chapter')
 if a.experiment=='cnn':
  if not a.dataset_dir:p.error('CNN requires --dataset-dir; run tools/fetch_cifar10.py first')
  for name in ['train.parquet','test.parquet','mirror-provenance.json']:
   if not (a.dataset_dir/name).is_file():p.error('Dataset file missing: '+str(a.dataset_dir/name))
 for d in ['scripts','checkpoints','public/experiments','research/experiments','research/upstream']:(dest/d).mkdir(parents=True,exist_ok=True)
 script={'cnn':'train_cnn.py','dqn':'train_dqn.py','search':'run_search.py'}[a.experiment]
 shutil.copy2(CH/'scripts'/script,dest/'scripts'/script)
 if a.experiment=='search':
  shutil.copytree(CH/'research/upstream',dest/'research/upstream',dirs_exist_ok=True)
 if a.experiment=='cnn':
  if not a.dataset_dir:p.error('CNN requires --dataset-dir; run tools/fetch_cifar10.py first')
  out=dest/'research/experiments/cnn';out.mkdir()
  for name in ['train.parquet','test.parquet','mirror-provenance.json']:
   src=a.dataset_dir/name
   if not src.is_file():p.error('Dataset file missing: '+str(src))
   shutil.copy2(src,out/name)
 subprocess.run([sys.executable,str(dest/'scripts'/script)],cwd=dest,check=True)
 print('RESULTS',dest)
if __name__=='__main__':main()
