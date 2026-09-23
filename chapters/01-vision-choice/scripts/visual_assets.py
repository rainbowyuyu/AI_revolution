"""Deterministic RGB teaching views derived only from the saved experiment image."""
import pathlib,json
from PIL import Image
import numpy as np
R=pathlib.Path(__file__).resolve().parents[1];p=R/'public/experiments/cnn.json';data=json.loads(p.read_text('utf8'))
for sample in data['samples']:
 a=np.array(Image.open(R/'public'/sample['image']).convert('RGB'));sample['rgbPixel']=a[16,16].tolist();sample['channels']=[]
 for c in range(3):
  b=np.zeros_like(a);b[:,:,c]=a[:,:,c];file=f'experiments/channel-{sample["index"]}-{c}.png';Image.fromarray(b).save(R/'public'/file);sample['channels'].append(file)
p.write_text(json.dumps(data,ensure_ascii=False,indent=2),'utf8')
