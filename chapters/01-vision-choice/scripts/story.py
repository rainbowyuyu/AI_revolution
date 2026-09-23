"""Build V4 host narration from one editable script and measured results."""
import json,pathlib,re
R=pathlib.Path(__file__).resolve().parents[1]

def build():
 rows=json.loads((R/'scripts/story_structure.json').read_text('utf8'))
 revised=(R/'scripts/story_v4.txt').read_text('utf8').strip().splitlines()
 assert len(revised)==len(rows),(len(revised),len(rows))
 for row,text in zip(rows,revised):row['voice']=text
 values={}
 for name in ['cnn','dqn','search']:
  p=R/f'public/experiments/{name}.json'
  if not p.exists():continue
  d=json.loads(p.read_text('utf8'))
  if name=='cnn':values.update(cnn_mean=f"百分之{d['meanAccuracy']*100:.1f}",cnn_std=f"{d['stdAccuracy']*100:.2f}")
  if name=='dqn':values.update(random_return=f"{d['randomBaseline']['mean']:.1f}",dqn_means='、'.join(f"{x['meanReturn']:.1f}" for x in d['runs']))
  if name=='search':values['search_scores']='，'.join(f"{x['wins']}胜{x['draws']}平{x['losses']}负" for x in d['runs'])
 for row in rows:
  missing=[k for k in re.findall(r'\{(\w+)\}',row['voice']) if k not in values];row['ready']=not missing
  if not missing:row['voice']=row['voice'].format(**values)
 (R/'research/story.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),'utf8')
 print('Beats',len(rows),'characters',sum(len(r['voice']) for r in rows),'ready',sum(r['ready'] for r in rows))
 return rows
if __name__=='__main__':build()
