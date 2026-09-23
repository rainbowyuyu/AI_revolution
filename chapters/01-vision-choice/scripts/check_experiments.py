"""Independent checks that exported evidence matches saved checkpoints and legal play."""
import json,io,pathlib
import numpy as np
import torch
import pyarrow.parquet as pq
from PIL import Image
from train_cnn import Net
import pyspiel
R=pathlib.Path(__file__).resolve().parents[1]
d=pq.read_table(R/'research/experiments/cnn/test.parquet').to_pydict();x=torch.tensor(np.stack([np.array(Image.open(io.BytesIO(a['bytes'])).convert('RGB')).transpose(2,0,1) for a in d['img']]),dtype=torch.float32)/127.5-1
report={};torch.set_num_threads(4);torch.backends.cudnn.deterministic=True;torch.backends.cudnn.benchmark=False;x=x.cuda()
for seed in [17,42,2026]:
 ck=torch.load(R/f'checkpoints/cnn-{seed}.pt',weights_only=True,map_location='cpu');net=Net().cuda();net.load_state_dict(ck['model']);net.eval()
 with torch.no_grad():p=torch.cat([net(b).softmax(1) for b in x.split(512)]).cpu().numpy()
 expected=np.load(R/f'research/experiments/cnn/predictions-{seed}.npz')['probabilities'];error=float(np.max(np.abs(p-expected)));assert error<1e-5,(seed,error)
 report[str(seed)]={'checkpointEpoch':ck['epoch'],'maxProbabilityErrorReloaded':error};print('CHECKPOINT',seed,error,flush=True)
split=np.load(R/'research/experiments/cnn/split.npz');assert len(set(split['train'])&set(split['validation']))==0;assert len(set(split['train'])|set(split['validation']))==50000
search=json.loads((R/'public/experiments/search.json').read_text('utf8'));game=pyspiel.load_game('connect_four');count=0
for run in search['runs']:
 for g in run['games']:
  s=game.new_initial_state()
  for action in g['moves']:assert not s.is_terminal();assert action in s.legal_actions();s.apply_action(action)
  assert s.is_terminal();count+=1
report['legalCompleteGames']=count;report['splitDisjoint']=True
from train_dqn import Net as DQN,evaluate
import gymnasium as gym
control=json.loads((R/'public/experiments/dqn.json').read_text('utf8'))
for run in control['runs']:
 net=DQN();net.load_state_dict(torch.load(R/f'checkpoints/dqn-{run["seed"]}-600.pt',weights_only=True,map_location='cpu')['model'])
 values,_=evaluate(net,range(900000,900100));assert values==run['evaluationReturns'];print('DQN EVAL',run['seed'],'matched 100 episodes',flush=True)
for stage,traces in control['examples'].items():
 for trace in traces:
  env=gym.make('CartPole-v1');state,_=env.reset(seed=trace['seed'])
  for frame in trace['frames']:
   assert np.allclose(state,frame['state'],atol=1e-6);state,reward,terminated,truncated,_=env.step(frame['action']);assert reward==frame['reward'];assert terminated==frame['terminated'];assert truncated==frame['truncated']
  env.close()
report['dqnEvaluationEpisodesReproduced']=300;report['dqnReplaysChecked']=sum(map(len,control['examples'].values()))
(R/'research/experiment-validation.json').write_text(json.dumps(report,indent=2),'utf8');print('EXPERIMENT VALIDATION PASSED',flush=True)
