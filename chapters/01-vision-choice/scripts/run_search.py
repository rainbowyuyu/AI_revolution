"""Pinned OpenSpiel MCTS, actual connect-four rules and matched-seed evaluation."""
import concurrent.futures,importlib.util,json,pathlib,time
import numpy as np
import pyspiel
R=pathlib.Path(__file__).resolve().parents[1];OUT=R/'research/experiments/search';OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('pinned_mcts',R/'research/upstream/mcts.py');mcts=importlib.util.module_from_spec(spec);spec.loader.exec_module(mcts)
def save(p,x):p.write_text(json.dumps(x,ensure_ascii=False,separators=(',',':')),'utf8')
def tree(node,depth=2):
 return {'action':node.action,'player':node.player,'visits':node.explore_count,'totalReward':node.total_reward,'meanValue':node.total_reward/max(1,node.explore_count),'children':[tree(c,depth-1) for c in node.children] if depth else []}
def budget_run(budget):
 file=OUT/f'budget-{budget}.json'
 if file.exists():return json.loads(file.read_text('utf8'))
 game=pyspiel.load_game('connect_four');games=[];start=time.time()
 for pair in range(30):
  for side in [0,1]:
   rng=np.random.RandomState(3000+pair);erng=np.random.RandomState(8000+pair*2+side)
   bot=mcts.MCTSBot(game,1.41421356,budget,mcts.RandomRolloutEvaluator(1,erng),solve=False,random_state=erng)
   state=game.new_initial_state();moves=[];snapshots=[];elapsed=0
   while not state.is_terminal():
    if state.current_player()==side:
     at=time.perf_counter();root=bot.mcts_search(state);elapsed+=time.perf_counter()-at;action=root.best_child().action
     if pair==0:snapshots.append({'ply':len(moves),'tree':tree(root)})
    else:action=int(rng.choice(state.legal_actions()))
    assert action in state.legal_actions();moves.append(int(action));state.apply_action(action)
   games.append({'pair':pair,'mctsPlayer':side,'moves':moves,'returns':state.returns(),'searchSeconds':elapsed,'trees':snapshots})
  if (pair+1)%5==0:print('SEARCH',budget,pair+1,'pairs',flush=True);save(OUT/f'progress-{budget}.json',{'games':games})
 scores=[g['returns'][g['mctsPlayer']] for g in games];result={'budget':budget,'games':games,'wins':scores.count(1),'draws':scores.count(0),'losses':scores.count(-1),'seconds':time.time()-start,'meanSearchSecondsPerGame':float(np.mean([g['searchSeconds'] for g in games]))};save(file,result);return result
def checks():
 game=pyspiel.load_game('connect_four');records=[]
 # Alternating columns make a vertical immediate win for player 0.
 state=game.new_initial_state()
 for a in [0,1,0,1,0,2]:state.apply_action(a)
 win=state.clone();win.apply_action(0);assert win.is_terminal() and win.returns()==[1.,-1.];records.append('immediate vertical win and terminal returns')
 full=game.new_initial_state()
 for a in [0,0,0,0,0,0]:full.apply_action(a)
 assert 0 not in full.legal_actions();records.append('full column excluded')
 defend=game.new_initial_state()
 for a in [1,0,2,0,1,0]:defend.apply_action(a)
 for a in [1,2,3,4,5,6]:
  child=defend.clone();child.apply_action(a);child.apply_action(0);assert child.is_terminal() and child.returns()[1]==1
 records.append('six alternatives lose immediately; column zero is the necessary block')
 for name,s in [('win',state),('block',defend)]:
  rng=np.random.RandomState(42);bot=mcts.MCTSBot(game,1.41421356,1024,mcts.RandomRolloutEvaluator(1,rng),solve=False,random_state=rng);root=bot.mcts_search(s)
  records.append({'case':name,'history':s.history(),'chosen':root.best_child().action,'tree':tree(root,3)})
 return records
if __name__=='__main__':
 tests=checks();save(OUT/'rules-checks.json',tests)
 with concurrent.futures.ProcessPoolExecutor(max_workers=3) as pool:runs=list(pool.map(budget_run,[64,256,1024]))
 result={'source':'google-deepmind/open_spiel pinned Python MCTS and installed pyspiel 2.0.2 connect_four','algorithm':'UCT, random rollouts, solve=False, no neural network','rows':6,'columns':7,'runs':runs,'checks':tests};save(R/'public/experiments/search.json',result);print('SEARCH COMPLETE',flush=True)
