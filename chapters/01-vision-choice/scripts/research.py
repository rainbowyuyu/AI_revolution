"""Download pinned primary sources; retain originals and hashes."""
import concurrent.futures,hashlib,json,pathlib,time,urllib.request
R=pathlib.Path(__file__).resolve().parents[1]
P='65e2e1a1c1520a6ccb1adc7fb2a55ce78ccdc598';S='48401890ee9857e611678302371378175a8e4c6b'
sources=[
 ('cnn-tutorial',f'https://raw.githubusercontent.com/pytorch/tutorials/{P}/beginner_source/blitz/cifar10_tutorial.py','upstream/cifar10_tutorial.py'),
 ('dqn-tutorial',f'https://raw.githubusercontent.com/pytorch/tutorials/{P}/intermediate_source/reinforcement_q_learning.py','upstream/reinforcement_q_learning.py'),
 ('pytorch-license',f'https://raw.githubusercontent.com/pytorch/tutorials/{P}/LICENSE','upstream/pytorch-LICENSE'),
 ('mcts',f'https://raw.githubusercontent.com/google-deepmind/open_spiel/{S}/open_spiel/python/algorithms/mcts.py','upstream/mcts.py'),
 ('connect-four',f'https://raw.githubusercontent.com/google-deepmind/open_spiel/{S}/open_spiel/games/connect_four/connect_four.cc','upstream/connect_four.cc'),
 ('spiel-license',f'https://raw.githubusercontent.com/google-deepmind/open_spiel/{S}/LICENSE','upstream/spiel-LICENSE'),
 ('lenet','https://yann.lecun.com/exdb/publis/pdf/lecun-98.pdf','pdfs/lenet.pdf'),
 ('dqn','https://www.cs.toronto.edu/~vmnih/docs/dqn.pdf','pdfs/dqn.pdf'),
 ('alphago','https://storage.googleapis.com/deepmind-media/alphago/AlphaGoNaturePaper.pdf','pdfs/alphago.pdf'),
 ('alphago-zero','https://discovery.ucl.ac.uk/id/eprint/10045895/1/agz_unformatted_nature.pdf','pdfs/alphago-zero.pdf'),
]
def fetch(row):
 id,url,dest=row;p=R/'research'/dest;p.parent.mkdir(parents=True,exist_ok=True)
 for attempt in range(3):
  try:
   if not p.exists():
    req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 rainbow educational research'})
    with urllib.request.urlopen(req,timeout=45) as f:data=f.read()
    if p.suffix=='.pdf' and not data.startswith(b'%PDF'):raise ValueError('Not a PDF')
    p.write_bytes(data)
   return {'id':id,'url':url,'file':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'retrieved':time.strftime('%Y-%m-%d'),'status':'verified-download'}
  except Exception as e:
   if attempt==2:return {'id':id,'url':url,'status':'failed','error':type(e).__name__+': '+str(e)}
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:rows=list(pool.map(fetch,sources))
(R/'research/sources.json').write_text(json.dumps({'commits':{'pytorch/tutorials':P,'google-deepmind/open_spiel':S},'sources':rows},ensure_ascii=False,indent=2),'utf8')
for r in rows:print(r['id'],r['status'],flush=True)
