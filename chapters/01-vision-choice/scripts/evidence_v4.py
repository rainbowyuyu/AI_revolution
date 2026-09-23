"""Export measured teaching data; never modify the training checkpoints."""
import pathlib,json,io,hashlib,copy,urllib.request,datetime,concurrent.futures
import numpy as np
import torch
from PIL import Image
import pyarrow.parquet as pq
from train_cnn import Net,R
torch.set_num_threads(4)
OUT=R/'public/experiments/v4';OUT.mkdir(exist_ok=True)
def save(p,x):p.write_text(json.dumps(x,ensure_ascii=False,separators=(',',':')),'utf8')
def sources():
 urls=[('pytorch-cnn','https://docs.pytorch.org/tutorials/beginner/blitz/cifar10_tutorial.html'),('pytorch-dqn','https://docs.pytorch.org/tutorials/intermediate/reinforcement_q_learning.html'),('cs231n','https://cs231n.github.io/convolutional-networks/'),('cartpole','https://gymnasium.farama.org/environments/classic_control/cart_pole/')]
 folder=R/'research/v4-sources';folder.mkdir(exist_ok=True)
 def fetch(row):
  name,url=row
  try:
   body=urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=50).read();(folder/(name+'.html')).write_bytes(body)
   return dict(name=name,url=url,bytes=len(body),sha256=hashlib.sha256(body).hexdigest(),retrieved=datetime.datetime.now().isoformat())
  except Exception as e:return dict(name=name,url=url,error=str(e))
 with concurrent.futures.ThreadPoolExecutor(4) as pool:rows=list(pool.map(fetch,urls))
 save(folder/'retrieval.json',rows);print('SOURCES',rows,flush=True)
def cnn():
 model=Net().cpu();checkpoint=R/'checkpoints/cnn-17.pt';model.load_state_dict(torch.load(checkpoint,map_location='cpu',weights_only=True)['model']);model.eval()
 d=json.loads((R/'public/experiments/cnn.json').read_text('utf8'));test=pq.read_table(R/'research/experiments/cnn/test.parquet').to_pydict()
 def tensor(item):return torch.from_numpy(np.asarray(Image.open(io.BytesIO(item['bytes'])).convert('RGB')).copy()).permute(2,0,1).float()/127.5-1
 def layer(a,name):
  a=a.detach()[0].numpy();paths=[]
  for ch,m in enumerate(a):
   gray=(m-m.min())/(np.ptp(m)+1e-9);rgb=np.stack([13+gray*132,30+gray*180,41+gray*171],-1).astype('uint8');path=f'experiments/v4/{name}-{ch}.png';Image.fromarray(rgb).save(R/'public'/path);paths.append(path)
  return dict(shape=list(a.shape),images=paths,values=a.tolist(),range=[float(a.min()),float(a.max())])
 samples=[]
 for s in d['samples']:
  x=tensor(test['img'][s['index']])[None]
  with torch.no_grad():
   c1=model.conv1(x);r1=c1.relu();p1=model.pool(r1);c2=model.conv2(p1);r2=c2.relu();p2=model.pool(r2);prob=model(x).softmax(1)[0]
  delta=float(np.max(np.abs(prob.numpy()-s['probabilities'])))
  assert delta<.001,(s['index'],delta) # CPU vs saved GPU floating-point inference
  layers={k:layer(a,f'{s["index"]}-{k}') for k,a in [('conv1',c1),('relu1',r1),('pool1',p1),('conv2',c2),('relu2',r2),('pool2',p2)]}
  y=z=10;k=model.conv1.weight[0].detach();patch=x[0,:,y:y+5,z:z+5];products=(patch*k);expected=products.sum()+model.conv1.bias[0].detach();assert abs(expected.item()-c1[0,0,y,z].item())<1e-5
  pool_choices=[(float(r1[0,0,yy:yy+2,xx:xx+2].max()-r1[0,0,yy:yy+2,xx:xx+2].min()),yy,xx) for yy in range(0,28,2) for xx in range(0,28,2)]
  _,py,px=max(pool_choices)
  samples.append(dict(index=s['index'],probabilities=prob.tolist(),gpuProbabilityMaxDelta=delta,layers=layers,convolution=dict(x=z,y=y,input=patch.tolist(),kernel=k.tolist(),products=products.tolist(),bias=float(model.conv1.bias[0].detach()),sum=float(expected),output=float(c1[0,0,y,z])),poolOrigin=[px,py],poolSelection='largest within-window range in channel 0, explanatory example',poolPatch=r1[0,0,py:py+2,px:px+2].tolist(),poolResult=float(p1[0,0,py//2,px//2])))
 # A fresh, explicitly identified extra training update on the TRAIN partition.
 train=pq.read_table(R/'research/experiments/cnn/train.parquet').to_pydict();ids=np.load(R/'research/experiments/cnn/split.npz')['train'][:64];xb=torch.stack([tensor(train['img'][int(i)]) for i in ids]);yb=torch.tensor([train['label'][int(i)] for i in ids]);opt=torch.optim.SGD(model.parameters(),lr=.001,momentum=.9)
 before=model(xb);loss=torch.nn.functional.cross_entropy(before,yb);w0=model.conv1.weight.detach().clone();opt.zero_grad();loss.backward();grad=model.conv1.weight.grad.detach().clone();opt.step()
 with torch.no_grad():after=model(xb);afterloss=torch.nn.functional.cross_entropy(after,yb)
 update=dict(note='Additional teaching update on fixed training batch; optimizer initialized afresh; not an original historical training step',indices=ids.tolist(),labels=yb.tolist(),before=before.detach().softmax(1).tolist(),after=after.softmax(1).tolist(),lossBefore=float(loss.detach()),lossAfter=float(afterloss),weightsBefore=w0[0].tolist(),gradients=grad[0].tolist(),weightsAfter=model.conv1.weight.detach()[0].tolist(),learningRate=.001)
 Image.open(io.BytesIO(train['img'][int(ids[0])]['bytes'])).save(OUT/'training-example.png');update['image']='experiments/v4/training-example.png'
 result=dict(checkpoint='checkpoints/cnn-17.pt',sha256=hashlib.sha256(checkpoint.read_bytes()).hexdigest(),samples=samples,update=update)
 save(OUT/'cnn-layers.json',result);print('CNN REAL LAYERS',len(samples),'UPDATE',update['lossBefore'],update['lossAfter'],flush=True)
def search():
 from run_search import mcts,tree
 import pyspiel
 game=pyspiel.load_game('connect_four');state=game.new_initial_state();history=[1,0,2,0,1,0]
 for a in history:state.apply_action(a)
 class Recorder(mcts.RandomRolloutEvaluator):
  def evaluate(self,s):
   s=s.clone();self.moves=[]
   while not s.is_terminal():
    a=int(self._random_state.choice(s.legal_actions()));self.moves.append(a);s.apply_action(a)
   self.returns=s.returns();return np.array(self.returns)
 rng=np.random.RandomState(42);ev=Recorder(1,rng);bot=mcts.MCTSBot(game,1.41421356,1024,ev,solve=False,random_state=rng);root=mcts.SearchNode(None,state.current_player(),1);records=[]
 def rootstats():return [dict(action=i,visits=next((c.explore_count for c in root.children if c.action==i),0),total=next((c.total_reward for c in root.children if c.action==i),0)) for i in range(7)]
 for step in range(1024):
  before=rootstats();path,working=bot._apply_tree_policy(root,state);actions=[int(n.action) for n in path[1:]]
  if working.is_terminal():returns=working.returns();path[-1].outcome=returns;rollout=[]
  else:returns=ev.evaluate(working);rollout=ev.moves.copy()
  pathbefore=[dict(action=n.action,player=n.player,visits=n.explore_count,total=n.total_reward) for n in path]
  for n in reversed(path):n.total_reward+=returns[n.player];n.explore_count+=1
  records.append(dict(iteration=step+1,path=actions,rollout=rollout,returns=list(returns),before=before,after=rootstats(),nodesBefore=pathbefore,nodesAfter=[dict(action=n.action,player=n.player,visits=n.explore_count,total=n.total_reward) for n in path]))
  check=state.clone()
  for a in actions+rollout:assert not check.is_terminal() and a in check.legal_actions();check.apply_action(a)
  assert check.is_terminal() and list(returns)==check.returns()
 rng=np.random.RandomState(42);reference=mcts.MCTSBot(game,1.41421356,1024,mcts.RandomRolloutEvaluator(1,rng),solve=False,random_state=rng).mcts_search(state)
 assert tree(root,3)==tree(reference,3),'instrumentation changed algorithm'
 save(OUT/'search-trace.json',dict(history=history,records=records,chosen=root.best_child().action,verification='1024 iterations; exact equality of depth-3 tree with unmodified pinned OpenSpiel, all rollout moves legal',tree=tree(root,3)))
 print('SEARCH 1024 EXACT VERIFIED',flush=True)
def dqn():
 import gymnasium as gym
 from train_dqn import Net as QNet
 d=json.loads((R/'public/experiments/dqn.json').read_text('utf8'));trace=d['examples']['600'][0];model=QNet();model.load_state_dict(torch.load(R/'checkpoints/dqn-17-600.pt',map_location='cpu',weights_only=True)['model']);model.eval()
 rows=trace['frames'];samples=[]
 # Adjacent recorded states are actual successors except the final terminal/truncated row.
 for i,row in enumerate(rows[:-1]):
  s=torch.tensor(row['state'],dtype=torch.float32);ns=torch.tensor(rows[i+1]['state'],dtype=torch.float32)
  with torch.no_grad():q=model(s);nq=model(ns);target=row['reward']+.99*float(nq.max())*(not row['terminated'])
  samples.append(dict(step=i,state=row['state'],nextState=rows[i+1]['state'],action=row['action'],reward=row['reward'],terminated=row['terminated'],q=q.tolist(),nextQ=nq.tolist(),target=target))
 batch=samples[:128];s=torch.tensor([x['state'] for x in batch]);ns=torch.tensor([x['nextState'] for x in batch]);actions=torch.tensor([x['action'] for x in batch]);targetnet=copy.deepcopy(model)
 opt=torch.optim.AdamW(model.parameters(),lr=.0003,amsgrad=True);q=model(s).gather(1,actions[:,None]).squeeze(1)
 with torch.no_grad():targets=1+.99*targetnet(ns).max(1).values
 loss=torch.nn.functional.smooth_l1_loss(q,targets);opt.zero_grad();loss.backward();torch.nn.utils.clip_grad_value_(model.parameters(),100);opt.step()
 with torch.no_grad():after=model(s).gather(1,actions[:,None]).squeeze(1)
 save(OUT/'dqn-update.json',dict(note='Fresh teaching minibatch from actual recorded trajectory; copied target and newly initialized optimizer, not historical training step',samples=samples,update=dict(before=q.detach().tolist(),targets=targets.tolist(),after=after.tolist(),lossBefore=float(loss.detach()),lossAfter=float(torch.nn.functional.smooth_l1_loss(after,targets)))))
 print('DQN MEASURED UPDATE',flush=True)
def replay():
 import gymnasium as gym
 from train_dqn import Net as QNet
 d=json.loads((R/'public/experiments/dqn.json').read_text('utf8'));out={};checks=0
 for key,traces in d['examples'].items():
  out[key]=[];seed=42 if key=='failure' else 17;stage=600 if key in ['random','failure'] else int(key)
  net=QNet();net.load_state_dict(torch.load(R/f'checkpoints/dqn-{seed}-{stage}.pt',map_location='cpu',weights_only=True)['model'])
  for trace in traces:
   env=gym.make('CartPole-v1');state,_=env.reset(seed=trace['seed']);frames=[]
   for i,row in enumerate(trace['frames']):
    assert np.max(np.abs(np.array(row['state'])-state))<.0000006
    with torch.no_grad():q=net(torch.tensor(state)).tolist()
    assert np.max(np.abs(np.array(row['q'])-q))<.00002
    ns,r,term,trunc,_=env.step(row['action']);assert r==row['reward'] and term==row['terminated'] and trunc==row['truncated']
    frames.append(row|dict(nextState=[float(x) for x in ns]));state=ns;checks+=1
   with torch.no_grad():q=net(torch.tensor(state)).tolist()
   frames.append(dict(state=[float(x) for x in state],q=q,action=frames[-1]['action'],reward=0,terminated=term,truncated=trunc,postActionEndpoint=True))
   out[key].append(trace|dict(frames=frames));env.close()
 save(OUT/'dqn-replay.json',out);print('REPLAY VERIFIED',checks,'steps; actual final post-action states added',flush=True)
if __name__=='__main__':
 sources();cnn();search();dqn();replay()
