"""Reproduce the actual local computation visualized in chapter five."""
import json,math,pathlib,random
root=pathlib.Path(__file__).resolve().parents[1]
rng=random.Random(20260921);inside=0;points=[];samples=[]
for i in range(1,10001):
    x,y=rng.random(),rng.random()
    within=(x-.5)**2+(y-.5)**2<=.25
    inside+=within
    points.append([round(x,7),round(y,7),int(within)])
    if i%100==0:samples.append({'n':i,'inside':inside,'estimate':4*inside/i,'error':abs(4*inside/i-math.pi)})
result={'seed':20260921,'description':'Actual local Python Monte Carlo run; visualization replays sampled results, not model reasoning.','points':points,'samples':samples}
(root/'src/experiment.json').write_text(json.dumps(result,separators=(',',':')),'utf8')
print(json.dumps(samples[-1],indent=2))
