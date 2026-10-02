"""Reproduce BPE, causal attention, trigram prediction, and sampling traces.

Migrated from the exact production experiment. All numbers are computed here;
the frozen results directory is never an output location. These small examples
are not a trained Transformer or a commercial tokenizer.
"""
import argparse
import json
import math
from collections import Counter, defaultdict
import numpy as np
from common import new_output_dir, write_json


def compute_results():
    results = {}
    def save(name, data):
        results[name] = data
    # Learn a tiny character BPE, and save every actual merge.
    corpus=['雨后的红伞靠在蓝色门边。','红伞靠在门边。','蓝色的门旁放着红伞。','红伞挡住了细雨。','雨后的地面映着蓝色门。']*3
    words=[list(x) for x in corpus]; merges=[]
    for step in range(14):
     counts=Counter(p for w in words for p in zip(w,w[1:])); pair=sorted(counts,key=lambda p:(-counts[p],p))[0]
     if counts[pair]<2:break
     before=[w[:] for w in words]
     def merge(w):
      out=[];i=0
      while i<len(w):
       if i+1<len(w) and (w[i],w[i+1])==pair:out.append(''.join(pair));i+=2
       else:out.append(w[i]);i+=1
      return out
     words=[merge(w) for w in words]
     merges.append({'step':step,'pair':list(pair),'count':counts[pair],'exampleBefore':before[0],'exampleAfter':words[0]})
    bpe_vocab=sorted(set(ch for x in corpus for ch in x)|set(''.join(m['pair']) for m in merges))
    def encode(s):
     w=list(s)
     for m in merges:
      p=m['pair'];out=[];i=0
      while i<len(w):
       if i+1<len(w) and w[i:i+2]==p:out.append(''.join(p));i+=2
       else:out.append(w[i]);i+=1
      w=out
     return {'text':s,'tokens':w,'ids':[bpe_vocab.index(t) for t in w],'roundTrip':''.join(w)==s}
    save('tokenization',{'type':'character_BPE_teaching_implementation','corpus':corpus,'merges':merges,'vocabulary':bpe_vocab,'examples':[encode(x) for x in ['雨后的红伞靠在蓝色门边。','蓝色的门旁放着红伞。']],'note':'Small corpus learned merges, not a commercial model tokenizer.'})
    # Exact causal scaled dot-product attention numerical demonstration.
    q=np.array([[1.,0.],[0.,1.],[1.,1.],[2.,1.]])
    k=np.array([[1.,1.],[2.,0.],[0.,2.],[1.,-1.]])
    v=np.array([[1.,0.],[0.,1.],[2.,1.],[-1.,2.]])
    scores=q@k.T/math.sqrt(2); mask=np.triu(np.ones((4,4),bool),1)
    masked=np.where(mask,-np.inf,scores); e=np.exp(masked-np.max(masked,axis=1,keepdims=True)); weights=e/e.sum(axis=1,keepdims=True); result=weights@v
    save('causal_attention',{'tokens':['红伞','靠在','蓝色','门边'],'Q':q.tolist(),'K':k.tolist(),'V':v.tolist(),'scores':scores.tolist(),'maskedScores':[[None if not np.isfinite(x) else float(x) for x in row] for row in masked],'weights':weights.tolist(),'output':result.tolist(),'futureWeightsZero':bool(np.all(weights[mask]==0)),'rowSums':weights.sum(axis=1).tolist(),'note':'Hand chosen Q/K/V; exact computed outputs; weights are not learned semantic explanations.'})
    # Count-based autoregressive baseline. Characters are tokens in this experiment.
    subjects=['红伞','蓝伞','黄伞','黑伞']; locations=['门边','窗边','墙边','桌边']; endings=['地面还有雨水。','空气十分清新。','远处亮起灯光。','微风轻轻吹过。']
    all_sents=[f'雨后的{s}靠在{loc}，{end}' for s in subjects for loc in locations for end in endings]
    train=[s for i,s in enumerate(all_sents) if i%5!=0]; test=[s for i,s in enumerate(all_sents) if i%5==0]
    vocab=sorted(set(''.join(train))|{'<EOS>'}); alpha=.1
    counts=[defaultdict(Counter) for _ in range(3)]
    for sent in train:
     seq=list(sent)+['<EOS>']
     for i,nxt in enumerate(seq):
      for n in range(3):
       if i>=n:counts[n][tuple(seq[i-n:i])][nxt]+=1

    def dist(prefix,order=2,temperature=1):
     toks=list(prefix);n=min(order,len(toks))
     while n and tuple(toks[-n:]) not in counts[n]:n-=1
     ctx=tuple(toks[-n:]) if n else ();c=counts[n][ctx]
     probs=np.array([(c[t]+alpha)/(sum(c.values())+alpha*len(vocab)) for t in vocab]);probs=probs**(1/temperature);probs/=probs.sum()
     inds=sorted(range(len(vocab)),key=lambda i:(-probs[i],vocab[i]))
     return {'context':''.join(ctx),'orderUsed':n,'count':sum(c.values()),'distribution':[{'token':vocab[i],'probability':float(probs[i]),'count':c[vocab[i]]} for i in inds]}
    def score(order):
     logs=[]
     for sent in test:
      for i,t in enumerate(list(sent)+['<EOS>']):
       p={x['token']:x['probability'] for x in dist(sent[:i],order)['distribution']}[t];logs.append(-math.log(p))
     return {'meanNLL':float(np.mean(logs)),'perplexity':float(np.exp(np.mean(logs))),'predictedTokens':len(logs)}
    def generate(seed,temp):
     rng=np.random.default_rng(seed);s='雨后的红伞'
     for _ in range(36):
      d=dist(s,2,temp)['distribution'];t=d[int(rng.choice(len(d),p=[v['probability'] for v in d]))]['token']
      if t=='<EOS>':break
      s+=t
     return s
    save('next_token',{'method':'character_trigram_with_backoff','maxContextCharacters':2,'smoothing':alpha,'train':train,'test':test,'vocabulary':vocab,'trainCount':len(train),'testCount':len(test),'split':'enumerated combinations, index mod 5 == 0 held out','metrics':{'unigram':score(0),'trigram':score(2)},'contexts':[{'prefix':p,**dist(p)} for p in ['雨后的红','雨后的红伞','雨后的红伞靠','雨后的红伞靠在','雨后的红伞靠在门','雨后的红伞靠在门边，','雨后的青色木门']],'temperatureExamples':[{'temperature':t,'distribution':dist('雨后的红伞靠在',2,t)['distribution'][:8],'seed':12,'text':generate(12,t)} for t in [.5,1,1.5]],'note':'Synthetic controlled corpus, count baseline; not a Transformer, not an open-world language benchmark.'})
    results['sampling_trace'] = sampling_trace(results['next_token'])
    return results


def sampling_trace(e):
    vocab=e['vocabulary'];counts=[defaultdict(Counter) for _ in range(3)]
    for sentence in e['train']:
        seq=list(sentence)+['<EOS>']
        for i,nxt in enumerate(seq):
            for n in range(3):
                if i>=n: counts[n][tuple(seq[i-n:i])][nxt]+=1
    traces=[]
    for saved in e['temperatureExamples']:
        rng=np.random.default_rng(saved['seed']);text='雨后的红伞';steps=[];temperature=saved['temperature']
        for _ in range(36):
            chars=list(text);n=min(2,len(chars))
            while n and tuple(chars[-n:]) not in counts[n]:n-=1
            context=tuple(chars[-n:]) if n else ();c=counts[n][context]
            probs=np.array([(c[t]+.1)/(sum(c.values())+.1*len(vocab)) for t in vocab]);probs=probs**(1/temperature);probs/=probs.sum()
            inds=sorted(range(len(vocab)),key=lambda i:(-probs[i],vocab[i]))
            distribution=[{'token':vocab[i],'probability':float(probs[i]),'count':c[vocab[i]]} for i in inds]
            u=float(rng.random());j=int(np.searchsorted(np.cumsum([r['probability'] for r in distribution]),u,side='right'));token=distribution[j]['token']
            steps.append({'prefix':text,'context':''.join(context),'distribution':distribution,'u':u,'chosen':token,'chosenIndex':j})
            if token=='<EOS>':break
            text+=token
        assert text==saved['text'],(temperature,text,saved['text'])
        traces.append({'seed':saved['seed'],'temperature':temperature,'text':text,'steps':steps})
    output={'method':'exact replay of run_mechanisms.py: NumPy default_rng(seed=12), categorical inverse CDF','traces':traces}
    return output


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out-dir', help='Empty output directory; default: repository runs/ch03-mechanisms-<UTC>.')
    args = parser.parse_args()
    output = new_output_dir(args.out_dir, 'mechanisms')
    results = compute_results()
    from run_formula_examples import compute_formula_examples
    results['formula_examples'] = compute_formula_examples(results['causal_attention'])
    for name, data in results.items():
        write_json(output / f'{name}.json', data)
    print(json.dumps({'output': str(output), 'files': sorted(results),
                      'metrics': results['next_token']['metrics']}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
