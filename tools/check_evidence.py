"""Standard-library audit of published metrics and Connect Four moves, without retraining."""
import json, math, statistics
from pathlib import Path
R=Path(__file__).resolve().parents[1]/'chapters/01-vision-choice'
def read(rel):return json.loads((R/rel).read_text(encoding='utf8'))

def game_return(moves):
 board=[[] for _ in range(7)]; winner=None
 for ply,c in enumerate(moves):
  assert winner is None, 'Move after a terminal win'
  assert isinstance(c,int) and 0<=c<7 and len(board[c])<6, 'Illegal column'
  player=ply%2;r=len(board[c]);board[c].append(player)
  def cell(x,y):return board[x][y] if 0<=x<7 and 0<=y<len(board[x]) else -1
  for dx,dy in [(1,0),(0,1),(1,1),(1,-1)]:
   count=1
   for sign in [-1,1]:
    step=1
    while cell(c+dx*step*sign,r+dy*step*sign)==player:count+=1;step+=1
   if count>=4:winner=player
 assert winner is not None or len(moves)==42,'Incomplete game'
 return [0.,0.] if winner is None else [1. if i==winner else -1. for i in range(2)]

def main():
 data={k:read('public/experiments/'+k+'.json') for k in ['cnn','dqn','search']}
 assert data==read('src/experiments.json'),'Render aggregate differs from source results'
 cnn=data['cnn'];accuracies=[r['testAccuracy'] for r in cnn['runs']]
 assert [r['seed'] for r in cnn['runs']]==[17,42,2026]
 assert math.isclose(statistics.mean(accuracies),cnn['meanAccuracy'],abs_tol=1e-8)
 assert math.isclose(statistics.stdev(accuracies),cnn['stdAccuracy'],abs_tol=1e-8)
 for r in cnn['runs']:
  matrix=r['confusion'];total=sum(map(sum,matrix));correct=sum(matrix[i][i] for i in range(10))
  assert total==10000
  assert math.isclose(correct/total,r['testAccuracy'],abs_tol=1e-8)
 for r in data['dqn']['runs']:
  values=r['evaluationReturns'];assert len(values)==100
  assert all(0<=v<=500 for v in values)
  assert math.isclose(statistics.mean(values),r['meanReturn'],abs_tol=1e-8)
 count=0
 for run in data['search']['runs']:
  results=[]
  for game in run['games']:
   actual=game_return(game['moves']);assert actual==game['returns']
   results.append(actual[game['mctsPlayer']]);count+=1
  assert len(results)==60
  assert [results.count(v) for v in [1.,0.,-1.]]==[run['wins'],run['draws'],run['losses']]
 print(json.dumps({'cnnSeeds':3,'dqnEvaluationEpisodes':300,'legalCompleteGames':count,'renderAggregateMatches':True,'scope':'Saved evidence only; no retraining or checkpoint inference'},indent=2))
if __name__=='__main__':main()
