"""CartPole DQN adapted from the pinned PyTorch tutorial; all trajectories are real."""
import collections,json,math,pathlib,random,time
import gymnasium as gym
import numpy as np
import torch
from torch import nn
R=pathlib.Path(__file__).resolve().parents[1];OUT=R/'research/experiments/dqn';OUT.mkdir(parents=True,exist_ok=True)
torch.set_num_threads(1)
class Net(nn.Module):
 def __init__(self):super().__init__();self.layers=nn.Sequential(nn.Linear(4,128),nn.ReLU(),nn.Linear(128,128),nn.ReLU(),nn.Linear(128,2))
 def forward(self,x):return self.layers(x)
def save(p,x):p.write_text(json.dumps(x,ensure_ascii=False,separators=(',',':')),'utf8')
def evaluate(net,seeds,random_policy=False,record=False):
 env=gym.make('CartPole-v1');returns=[];traces=[]
 for seed in seeds:
  state,_=env.reset(seed=int(seed));env.action_space.seed(int(seed));trace=[]
  for t in range(500):
   with torch.no_grad():q=net(torch.tensor(state)).numpy()
   action=int(env.action_space.sample()) if random_policy else int(np.argmax(q));nxt,reward,terminal,truncated,_=env.step(action)
   if record:trace.append({'state':[round(float(x),6) for x in state],'action':action,'reward':reward,'q':[round(float(x),5) for x in q],'terminated':terminal,'truncated':truncated})
   state=nxt
   if terminal or truncated:break
  returns.append(t+1)
  if record:traces.append({'seed':int(seed),'return':t+1,'frames':trace})
 env.close();return returns,traces
def main():
 runs=[]
 for seed in [17,42,2026]:
  result=OUT/f'run-{seed}.json'
  if result.exists():runs.append(json.loads(result.read_text('utf8')));continue
  random.seed(seed);np.random.seed(seed);torch.manual_seed(seed)
  net=Net();target=Net();target.load_state_dict(net.state_dict());opt=torch.optim.AdamW(net.parameters(),lr=3e-4,amsgrad=True)
  env=gym.make('CartPole-v1');env.action_space.seed(seed);memory=collections.deque(maxlen=10000);steps=0;history=[];start=time.time()
  for ep in range(600):
   state,_=env.reset(seed=seed*10000+ep);losses=[]
   for t in range(500):
    eps=.01+(.9-.01)*math.exp(-steps/2500);steps+=1
    if random.random()<eps:action=env.action_space.sample()
    else:
     with torch.no_grad():action=int(net(torch.tensor(state)).argmax())
    nxt,reward,terminal,truncated,_=env.step(int(action));memory.append((state.copy(),action,reward,nxt.copy(),terminal));state=nxt
    if len(memory)>=128:
     batch=random.sample(memory,128);s,a,r,ns,term=zip(*batch);s=torch.tensor(np.array(s));ns=torch.tensor(np.array(ns));a=torch.tensor(a);r=torch.tensor(r);term=torch.tensor(term)
     actual=net(s).gather(1,a[:,None]).squeeze(1)
     with torch.no_grad():desired=r+.99*target(ns).max(1).values*(~term)
     loss=nn.functional.smooth_l1_loss(actual,desired);opt.zero_grad();loss.backward();nn.utils.clip_grad_value_(net.parameters(),100);opt.step();losses.append(loss.item())
     with torch.no_grad():
      for tp,p in zip(target.parameters(),net.parameters()):tp.lerp_(p,.005)
    if terminal or truncated:break
   history.append({'episode':ep+1,'return':t+1,'epsilon':eps,'loss':float(np.mean(losses)) if losses else None})
   if ep+1 in [1,50,200,600]:torch.save({'model':net.state_dict(),'seed':seed,'episode':ep+1},R/'checkpoints'/f'dqn-{seed}-{ep+1}.pt')
   if (ep+1)%25==0:save(OUT/f'progress-{seed}.json',history);print('DQN',seed,ep+1,'recent',round(np.mean([x['return'] for x in history[-25:]]),1),flush=True)
  returns,_=evaluate(net,range(900000,900100));run={'seed':seed,'history':history,'evaluationReturns':returns,'meanReturn':float(np.mean(returns)),'stdReturn':float(np.std(returns,ddof=1)),'seconds':time.time()-start};save(result,run);runs.append(run);env.close()
 trace_net=Net();examples={}
 for stage in [1,50,200,600]:
  trace_net.load_state_dict(torch.load(R/'checkpoints'/f'dqn-17-{stage}.pt',weights_only=True)['model']);_,tr=evaluate(trace_net,[900000,900001,900002],record=True);examples[str(stage)]=tr
 random_returns,_=evaluate(trace_net,range(900000,900100),random_policy=True);_,tr=evaluate(trace_net,[900000],random_policy=True,record=True);examples['random']=tr
 # Deterministic illustrative failure: first failing evaluation in seed order.
 for run in runs:
  failing=[900000+i for i,n in enumerate(run['evaluationReturns']) if n<500]
  if failing:
   trace_net.load_state_dict(torch.load(R/'checkpoints'/f'dqn-{run["seed"]}-600.pt',weights_only=True)['model']);_,tr=evaluate(trace_net,failing[:1],record=True);examples['failure']=tr;break
 result={'source':'PyTorch official DQN tutorial; CPU training, three fixed seeds','observation':['cartPosition','cartVelocity','poleAngle','poleAngularVelocity'],'stateInputsNotPixels':True,'env':'CartPole-v1','maxEpisodeSteps':500,'gamma':.99,'batchSize':128,'lr':.0003,'tau':.005,'epsilonStart':.9,'epsilonEnd':.01,'epsilonDecay':2500,'runs':runs,'randomBaseline':{'returns':random_returns,'mean':float(np.mean(random_returns))},'examples':examples,'terminationPolicy':'Only terminated masks bootstrap; time-limit truncation ends episode but bootstraps.'}
 save(R/'public/experiments/dqn.json',result);save(OUT/'summary.json',result);print('DQN COMPLETE',flush=True)
if __name__=='__main__':main()
