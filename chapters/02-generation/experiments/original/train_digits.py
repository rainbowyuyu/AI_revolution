"""Small MNIST GAN and DDPM: save raw learned images, checkpoints and DDPM reverse trajectory."""
from pathlib import Path
import gzip, hashlib, json, math, struct, time
import numpy as np
import requests
import torch
from torch import nn
from PIL import Image

R=Path(__file__).resolve().parents[1];torch.set_num_threads(3)
DEVICE='cuda' if torch.cuda.is_available() else 'cpu'
DATA=R/'research/mnist';DATA.mkdir(exist_ok=True)
OUT=R/'public/experiments/digits';OUT.mkdir(exist_ok=True)

def get_data():
    p=DATA/'train-images-idx3-ubyte.gz'
    url='https://storage.googleapis.com/cvdf-datasets/mnist/train-images-idx3-ubyte.gz'
    if not p.exists():
        r=requests.get(url,timeout=120);r.raise_for_status();p.write_bytes(r.content)
    buf=gzip.decompress(p.read_bytes());magic,n,h,w=struct.unpack('>IIII',buf[:16]);assert (magic,h,w)==(2051,28,28)
    a=np.frombuffer(buf[16:],dtype=np.uint8).copy().reshape(n,1,28,28)
    return torch.tensor(a[:55000],dtype=torch.float32,device=DEVICE)/127.5-1,torch.tensor(a[55000:],dtype=torch.float32,device=DEVICE)/127.5-1,dict(url=url,sha256=hashlib.sha256(p.read_bytes()).hexdigest(),train=55000,validation=5000,split='fixed official training order; official test set not used')

def save_grid(x,name,cols=8):
    a=((x.detach().cpu().clamp(-1,1)+1)*127.5).byte().numpy()[:,0];n=len(a);rows=math.ceil(n/cols)
    canvas=Image.new('RGB',(cols*32,rows*32),'#050b11')
    for i,p in enumerate(a):canvas.paste(Image.fromarray(p).convert('RGB'),((i%cols)*32+2,(i//cols)*32+2))
    canvas.resize((cols*128,rows*128),Image.Resampling.NEAREST).save(OUT/name)

class Block(nn.Module):
    def __init__(self,a,b):super().__init__();self.net=nn.Sequential(nn.Conv2d(a,b,3,padding=1),nn.GroupNorm(4,b),nn.SiLU(),nn.Conv2d(b,b,3,padding=1),nn.GroupNorm(4,b),nn.SiLU())
    def forward(self,x):return self.net(x)

class TinyUNet(nn.Module):
    def __init__(self):
        super().__init__();self.d1=Block(3,24);self.d2=Block(24,48);self.mid=Block(48,48);self.up=Block(72,24);self.out=nn.Conv2d(24,1,1)
    def forward(self,x,t):
        v=t.float()[:,None,None,None]/200
        a=self.d1(torch.cat([x,v.expand(-1,1,28,28),(v*math.pi).sin().expand(-1,1,28,28)],1))
        b=self.mid(self.d2(nn.functional.avg_pool2d(a,2)))
        c=self.up(torch.cat([a,nn.functional.interpolate(b,scale_factor=2,mode='nearest')],1))
        return self.out(c)

def run():
    torch.manual_seed(42);x,val,source=get_data();save_grid(x[:32],'training-examples.png')
    result=dict(seed=42,device=DEVICE,data=source,scope='Small MNIST teaching models; not photorealistic dog generation',gan=[],ddpm=[])
    g=nn.Sequential(nn.Linear(64,256),nn.LeakyReLU(.2),nn.Linear(256,512),nn.LeakyReLU(.2),nn.Linear(512,784),nn.Tanh()).to(DEVICE)
    d=nn.Sequential(nn.Linear(784,256),nn.LeakyReLU(.2),nn.Linear(256,128),nn.LeakyReLU(.2),nn.Linear(128,1)).to(DEVICE)
    go=torch.optim.Adam(g.parameters(),lr=.0002,betas=(.5,.999));do=torch.optim.Adam(d.parameters(),lr=.0002,betas=(.5,.999));loss=nn.BCEWithLogitsLoss();fixed=torch.randn(32,64,device=DEVICE)
    at=time.time()
    for step in range(3001):
        if step in [0,100,300,600,1000,1500,2000,3000]:
            with torch.no_grad():save_grid(g(fixed).reshape(-1,1,28,28),f'gan-{step:04}.png')
            print('IMAGE GAN',step,round(time.time()-at,1),flush=True)
        if step==3000:break
        real=x[torch.randint(len(x),(128,),device=DEVICE)].flatten(1);z=torch.randn(128,64,device=DEVICE);fake=g(z)
        ld=loss(d(real),torch.ones(128,1,device=DEVICE))+loss(d(fake.detach()),torch.zeros(128,1,device=DEVICE))
        do.zero_grad();ld.backward();do.step()
        for p in d.parameters():p.requires_grad_(False)
        lg=loss(d(g(torch.randn(128,64,device=DEVICE))),torch.ones(128,1,device=DEVICE));go.zero_grad();lg.backward();go.step()
        for p in d.parameters():p.requires_grad_(True)
        if step%50==0:result['gan'].append(dict(step=step,g_loss=float(lg.detach()),d_loss=float(ld.detach())))
    torch.save(dict(generator=g.state_dict(),discriminator=d.state_dict(),steps=3000),R/'checkpoints/digits-gan-42.pt')
    del g,d,go,do;torch.cuda.empty_cache()
    net=TinyUNet().to(DEVICE);optim=torch.optim.Adam(net.parameters(),lr=.0005);beta=torch.linspace(.0001,.04,200,device=DEVICE);alpha=1-beta;abar=alpha.cumprod(0)
    at=time.time()
    for step in range(3000):
        batch=x[torch.randint(len(x),(64,),device=DEVICE)];t=torch.randint(200,(64,),device=DEVICE);noise=torch.randn_like(batch)
        noisy=abar[t,None,None,None].sqrt()*batch+(1-abar[t,None,None,None]).sqrt()*noise
        pred=net(noisy,t);l=(pred-noise).square().mean();optim.zero_grad();l.backward();optim.step()
        if step%50==0:result['ddpm'].append(dict(step=step,noise_mse=float(l.detach())))
        if step%250==0:print('IMAGE DDPM',step,round(time.time()-at,1),flush=True)
    torch.save(dict(model=net.state_dict(),beta=beta,steps=3000),R/'checkpoints/digits-ddpm-42.pt')
    torch.manual_seed(10042);sample=torch.randn(32,1,28,28,device=DEVICE);save_grid(sample,'ddpm-t200.png')
    with torch.no_grad():
        for t in reversed(range(200)):
            eps=net(sample,torch.full((32,),t,device=DEVICE));mean=(sample-beta[t]/(1-abar[t]).sqrt()*eps)/alpha[t].sqrt()
            variance=beta[t]*(1-(abar[t-1] if t else torch.tensor(1.,device=DEVICE)))/(1-abar[t])
            sample=mean+variance.sqrt()*torch.randn_like(sample) if t else mean
            if t%5==0:save_grid(sample,f'ddpm-t{t:03}.png')
        tv=torch.randint(200,(512,),device=DEVICE);nv=torch.randn_like(val[:512]);xt=abar[tv,None,None,None].sqrt()*val[:512]+(1-abar[tv,None,None,None]).sqrt()*nv
        result['validation_noise_mse']=float((net(xt,tv)-nv).square().mean())
    result.update(gan_steps=3000,ddpm_steps=3000,ddpm_timesteps=200,code_sha256=hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),torch=torch.__version__)
    (R/'public/experiments/digits.json').write_text(json.dumps(result,indent=2),encoding='utf8');print('IMAGE EXPERIMENTS COMPLETE',flush=True)

if __name__=='__main__':run()
