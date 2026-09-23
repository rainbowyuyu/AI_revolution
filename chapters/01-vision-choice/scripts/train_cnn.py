"""PyTorch tutorial architecture, official CIFAR-10, three reproducible runs."""
import hashlib,json,pathlib,pickle,random,tarfile,time,urllib.request,io
import numpy as np
import torch
from torch import nn
from PIL import Image
R=pathlib.Path(__file__).resolve().parents[1];OUT=R/'research/experiments/cnn';OUT.mkdir(parents=True,exist_ok=True)
torch.set_num_threads(4);device=torch.device('cuda' if torch.cuda.is_available() else 'cpu')
class Net(nn.Module):
 def __init__(self):
  super().__init__();self.conv1=nn.Conv2d(3,6,5);self.conv2=nn.Conv2d(6,16,5);self.pool=nn.MaxPool2d(2,2);self.fc1=nn.Linear(400,120);self.fc2=nn.Linear(120,84);self.fc3=nn.Linear(84,10)
 def forward(self,x):
  x=self.pool(torch.relu(self.conv1(x)));x=self.pool(torch.relu(self.conv2(x)));x=x.flatten(1);return self.fc3(torch.relu(self.fc2(torch.relu(self.fc1(x)))))
def save(p,v):p.write_text(json.dumps(v,ensure_ascii=False,indent=2),'utf8')
def main():
 if (OUT/'mirror-provenance.json').exists():
  import pyarrow.parquet as pq
  provenance=json.loads((OUT/'mirror-provenance.json').read_text('utf8'))
  def load_mirror(name):
   p=OUT/(name+'.parquet');row=next(x for x in provenance if x['split']==name);assert hashlib.sha256(p.read_bytes()).hexdigest()==row['sha256']
   table=pq.read_table(p).to_pydict();images=np.stack([np.asarray(Image.open(io.BytesIO(x['bytes'])).convert('RGB')).transpose(2,0,1) for x in table['img']]);return images,np.array(table['label'],dtype=np.int64)
  raw,y=load_mirror('train');test,ty=load_mirror('test');dataset_note='Official CIFAR-10 splits, uoft-cs Hugging Face parquet mirror, SHA-256 verified; see mirror-provenance.json'
 else:
  archive=OUT/'cifar-10-verified.tar.gz' if (OUT/'cifar-10-verified.tar.gz').exists() else OUT/'cifar-10-python.tar.gz'
  if not archive.exists():
   print('Downloading official CIFAR-10',flush=True);urllib.request.urlretrieve('https://www.cs.toronto.edu/~kriz/cifar-10-python.tar.gz',archive)
  assert hashlib.md5(archive.read_bytes()).hexdigest()=='c58f30108f718f92721af3b95e74349a','Dataset checksum mismatch'
  with tarfile.open(archive) as tf:
   def load(name):
    d=pickle.load(tf.extractfile('cifar-10-batches-py/'+name),encoding='bytes');return d[b'data'].reshape(-1,3,32,32),np.array(d[b'labels'])
   parts=[load('data_batch_'+str(i)) for i in range(1,6)];raw=np.concatenate([p[0] for p in parts]);y=np.concatenate([p[1] for p in parts]);test,ty=load('test_batch')
  dataset_note='Official CIFAR-10 archive; verified MD5 c58f30108f718f92721af3b95e74349a'
 assert raw.shape==(50000,3,32,32) and test.shape==(10000,3,32,32)
 split=np.random.default_rng(2026).permutation(50000);tr,va=split[:45000],split[45000:]
 np.savez_compressed(OUT/'split.npz',train=tr,validation=va)
 X=torch.from_numpy(raw.copy()).to(device,dtype=torch.float32)/127.5-1;Y=torch.from_numpy(y).to(device)
 XT=torch.from_numpy(test.copy()).to(device,dtype=torch.float32)/127.5-1;YT=torch.from_numpy(ty).to(device)
 def metrics(net,x,y):
  net.eval();loss=0.;correct=0;ps=[]
  with torch.no_grad():
   for i in range(0,len(y),512):
    z=net(x[i:i+512]);loss+=nn.functional.cross_entropy(z,y[i:i+512],reduction='sum').item();correct+=(z.argmax(1)==y[i:i+512]).sum().item();ps.append(z.softmax(1).cpu().numpy())
  return loss/len(y),correct/len(y),np.concatenate(ps)
 runs=[]
 for seed in [17,42,2026]:
  result=OUT/f'run-{seed}.json';ck=R/'checkpoints'/f'cnn-{seed}.pt'
  if result.exists():runs.append(json.loads(result.read_text('utf8')));continue
  random.seed(seed);np.random.seed(seed);torch.manual_seed(seed);torch.cuda.manual_seed_all(seed);torch.backends.cudnn.deterministic=True;torch.backends.cudnn.benchmark=False
  net=Net().to(device);opt=torch.optim.SGD(net.parameters(),lr=.001,momentum=.9);history=[];best=float('inf');start=time.time()
  for epoch in range(20):
   net.train();ids=torch.tensor(tr,device=device)[torch.randperm(len(tr),device=device)];loss=0.;correct=0
   for batch in ids.split(64):
    opt.zero_grad();z=net(X[batch]);l=nn.functional.cross_entropy(z,Y[batch]);l.backward();opt.step();loss+=l.item()*len(batch);correct+=(z.argmax(1)==Y[batch]).sum().item()
   vl,acc,_=metrics(net,X[va],Y[va]);row={'epoch':epoch+1,'trainLoss':loss/len(tr),'trainAccuracy':correct/len(tr),'validationLoss':vl,'validationAccuracy':acc};history.append(row)
   if vl<best:best=vl;torch.save({'model':net.state_dict(),'seed':seed,'epoch':epoch+1},ck)
   save(OUT/f'progress-{seed}.json',history);print('CNN',seed,epoch+1,round(acc,4),flush=True)
  saved=torch.load(ck,weights_only=True);net.load_state_dict(saved['model']);tl,ta,probs=metrics(net,XT,YT);pred=probs.argmax(1);conf=np.zeros((10,10),int);np.add.at(conf,(ty,pred),1)
  run={'seed':seed,'bestEpoch':saved['epoch'],'history':history,'testLoss':tl,'testAccuracy':ta,'confusion':conf.tolist(),'seconds':time.time()-start,'checkpoint':str(ck.relative_to(R))};save(result,run);np.savez_compressed(OUT/f'predictions-{seed}.npz',probabilities=probs,labels=ty);runs.append(run)
 # Fixed first seed is the illustrated model, not the best performing seed.
 net=Net().to(device);net.load_state_dict(torch.load(R/'checkpoints/cnn-17.pt',weights_only=True)['model']);net.eval()
 probs=np.load(OUT/'predictions-17.npz')['probabilities'];pred=probs.argmax(1)
 ids=[]
 for label in [3,5]:
  for correct in [True,False]:
   matches=np.where((ty==label)&((pred==ty)==correct))[0]
   if len(matches):ids.append((int(matches[0]),'first-correct' if correct else 'first-incorrect'))
 ids.append((int(np.argmin(probs.max(1))),'lowest-confidence'))
 samples=[]
 for idx,rule in ids:
  Image.fromarray(test[idx].transpose(1,2,0)).save(R/'public/experiments'/f'cifar-{idx}.png')
  x=XT[idx:idx+1]
  with torch.no_grad():maps=net.conv1(x).relu()[0].cpu().numpy();occ=x.clone();occ[:,:,10:22,10:22]=0;op=net(occ).softmax(1)[0].cpu().tolist()
  for k,m in enumerate(maps):
   a=((m-m.min())/(np.ptp(m)+1e-8)*255).astype('uint8');Image.fromarray(a).save(R/'public/experiments'/f'feature-{idx}-{k}.png')
  samples.append({'index':idx,'selection':rule,'label':int(ty[idx]),'predicted':int(pred[idx]),'probabilities':probs[idx].tolist(),'occlusionProbabilities':op,'image':f'experiments/cifar-{idx}.png','features':[f'experiments/feature-{idx}-{k}.png' for k in range(6)]})
 result={'source':'PyTorch official CIFAR-10 tutorial; custom three-seed experiment','classes':['飞机','汽车','鸟','猫','鹿','狗','蛙','马','船','卡车'],'trainCount':45000,'validationCount':5000,'testCount':10000,'seeds':[17,42,2026],'runs':runs,'meanAccuracy':float(np.mean([r['testAccuracy'] for r in runs])),'stdAccuracy':float(np.std([r['testAccuracy'] for r in runs],ddof=1)),'samples':samples,'device':str(device),'torch':torch.__version__,'datasetProvenance':dataset_note}
 save(R/'public/experiments/cnn.json',result);save(OUT/'summary.json',result);print('CNN COMPLETE',result['meanAccuracy'],flush=True)
if __name__=='__main__':main()
