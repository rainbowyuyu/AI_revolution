"""Portable MNIST GAN/DDPM training, adapted from original/train_digits.py.

Full defaults preserve the original 3,000-update configuration.
New runs require an empty directory; --smoke checks execution, not quality.
"""
from pathlib import Path
import argparse, gzip, hashlib, json, math, struct, time
import urllib.request
import numpy as np
import torch
from torch import nn
from PIL import Image

from common import device_name, fresh_run, provenance

torch.set_num_threads(3)
DEVICE = "cpu"
DATA = None
OUT = None
EXPECTED_SHA256 = "440fcabf73cc546fa21475e81ea370265605f56be210a4024d2ca8f203523609"

def get_data(smoke=False):
    DATA.mkdir(parents=True, exist_ok=True)
    p = DATA / "train-images-idx3-ubyte.gz"
    url = "https://storage.googleapis.com/cvdf-datasets/mnist/train-images-idx3-ubyte.gz"
    if not p.exists():
        with urllib.request.urlopen(url, timeout=120) as response:
            payload = response.read()
        if hashlib.sha256(payload).hexdigest() != EXPECTED_SHA256:
            raise ValueError("MNIST download SHA-256 mismatch")
        p.write_bytes(payload)
    payload = p.read_bytes()
    if hashlib.sha256(payload).hexdigest() != EXPECTED_SHA256:
        raise ValueError("Cached MNIST SHA-256 mismatch")
    buf = gzip.decompress(payload)
    magic, n, h, w = struct.unpack(">IIII", buf[:16])
    if (magic, n, h, w) != (2051, 60000, 28, 28) or len(buf) != 16 + n*h*w:
        raise ValueError("Unexpected MNIST IDX header or length")
    a = np.frombuffer(buf[16:], dtype=np.uint8).copy().reshape(n, 1, 28, 28)
    train, validation = a[:55000], a[55000:]
    if smoke:
        train, validation = train[:256], validation[:32]
    source = dict(url=url, sha256=EXPECTED_SHA256, train=55000, validation=5000,
                  split="fixed official training order; official test set not used",
                  effective_train=len(train), effective_validation=len(validation))
    return (torch.tensor(train, dtype=torch.float32, device=DEVICE)/127.5-1,
            torch.tensor(validation, dtype=torch.float32, device=DEVICE)/127.5-1, source)

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

def run(args):
    global DEVICE, DATA, OUT
    DEVICE = device_name(args.device)
    run_dir = fresh_run(args.run_dir)
    DATA = args.data_dir.resolve()
    OUT = run_dir / "digits"
    OUT.mkdir()
    steps = 2 if args.smoke else args.steps
    gan_batch, ddpm_batch = (16, 8) if args.smoke else (128, 64)
    sample_count = 4 if args.smoke else 32
    torch.manual_seed(args.seed)
    x, val, source = get_data(args.smoke)
    save_grid(x[:32], "training-examples.png")
    result = dict(seed=args.seed, data=source, gan=[], ddpm=[],
                  **provenance(__file__, DEVICE, args.smoke))
    result["scope"] = "Small MNIST teaching models; smoke only checks execution" if args.smoke else "Small MNIST teaching models"
    result["configuration"] = dict(gan_batch=gan_batch, ddpm_batch=ddpm_batch, sample_count=sample_count,
                                  gan_lr=.0002, ddpm_lr=.0005, eval_seed=args.seed+10000)
    g=nn.Sequential(nn.Linear(64,256),nn.LeakyReLU(.2),nn.Linear(256,512),nn.LeakyReLU(.2),nn.Linear(512,784),nn.Tanh()).to(DEVICE)
    d=nn.Sequential(nn.Linear(784,256),nn.LeakyReLU(.2),nn.Linear(256,128),nn.LeakyReLU(.2),nn.Linear(128,1)).to(DEVICE)
    go=torch.optim.Adam(g.parameters(),lr=.0002,betas=(.5,.999));do=torch.optim.Adam(d.parameters(),lr=.0002,betas=(.5,.999));loss=nn.BCEWithLogitsLoss();fixed=torch.randn(sample_count,64,device=DEVICE)
    at=time.time()
    for step in range(steps+1):
        if step in {0,100,300,600,1000,1500,2000,steps}:
            with torch.no_grad():save_grid(g(fixed).reshape(-1,1,28,28),f'gan-{step:04}.png')
            print('IMAGE GAN',step,round(time.time()-at,1),flush=True)
        if step==steps:break
        real=x[torch.randint(len(x),(gan_batch,),device=DEVICE)].flatten(1);z=torch.randn(gan_batch,64,device=DEVICE);fake=g(z)
        ld=loss(d(real),torch.ones(gan_batch,1,device=DEVICE))+loss(d(fake.detach()),torch.zeros(gan_batch,1,device=DEVICE))
        do.zero_grad();ld.backward();do.step()
        for p in d.parameters():p.requires_grad_(False)
        lg=loss(d(g(torch.randn(gan_batch,64,device=DEVICE))),torch.ones(gan_batch,1,device=DEVICE));go.zero_grad();lg.backward();go.step()
        for p in d.parameters():p.requires_grad_(True)
        if step%50==0:result['gan'].append(dict(step=step,g_loss=float(lg.detach()),d_loss=float(ld.detach())))
    torch.save(dict(generator=g.state_dict(),discriminator=d.state_dict(),steps=steps,seed=args.seed),run_dir/f'checkpoints/digits-gan-{args.seed}.pt')
    del g,d,go,do;torch.cuda.empty_cache()
    net=TinyUNet().to(DEVICE);optim=torch.optim.Adam(net.parameters(),lr=.0005);beta=torch.linspace(.0001,.04,200,device=DEVICE);alpha=1-beta;abar=alpha.cumprod(0)
    at=time.time()
    for step in range(steps):
        batch=x[torch.randint(len(x),(ddpm_batch,),device=DEVICE)];t=torch.randint(200,(ddpm_batch,),device=DEVICE);noise=torch.randn_like(batch)
        noisy=abar[t,None,None,None].sqrt()*batch+(1-abar[t,None,None,None]).sqrt()*noise
        pred=net(noisy,t);l=(pred-noise).square().mean();optim.zero_grad();l.backward();optim.step()
        if step%50==0:result['ddpm'].append(dict(step=step,noise_mse=float(l.detach())))
        if step%250==0:print('IMAGE DDPM',step,round(time.time()-at,1),flush=True)
    torch.save(dict(model=net.state_dict(),beta=beta,steps=steps,seed=args.seed),run_dir/f'checkpoints/digits-ddpm-{args.seed}.pt')
    torch.manual_seed(args.seed+10000);sample=torch.randn(sample_count,1,28,28,device=DEVICE);save_grid(sample,'ddpm-t200.png')
    with torch.no_grad():
        for t in reversed(range(200)):
            eps=net(sample,torch.full((sample_count,),t,device=DEVICE));mean=(sample-beta[t]/(1-abar[t]).sqrt()*eps)/alpha[t].sqrt()
            variance=beta[t]*(1-(abar[t-1] if t else torch.tensor(1.,device=DEVICE)))/(1-abar[t])
            sample=mean+variance.sqrt()*torch.randn_like(sample) if t else mean
            if t%5==0:save_grid(sample,f'ddpm-t{t:03}.png')
        validation_batch=val[:512];tv=torch.randint(200,(len(validation_batch),),device=DEVICE);nv=torch.randn_like(validation_batch);xt=abar[tv,None,None,None].sqrt()*validation_batch+(1-abar[tv,None,None,None]).sqrt()*nv
        result['validation_noise_mse']=float((net(xt,tv)-nv).square().mean())
    result.update(gan_steps=steps,ddpm_steps=steps,ddpm_timesteps=200)
    (run_dir/'digits.json').write_text(json.dumps(result,indent=2),encoding='utf8');print('IMAGE EXPERIMENTS COMPLETE',flush=True)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run-dir", type=Path, required=True)
    parser.add_argument("--data-dir", type=Path, default=Path("runs/datasets/mnist"))
    parser.add_argument("--device", choices=["cpu", "cuda", "auto"], default="auto")
    parser.add_argument("--steps", type=int, default=3000)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--smoke", action="store_true", help="2 updates/model on 256 MNIST images; 4 generated samples")
    args = parser.parse_args()
    if args.steps < 1 or not 0 <= args.seed <= 2**32 - 10001:
        parser.error("steps must be positive; seed must be in [0, 2**32 - 10001]")
    run(args)


if __name__ == "__main__":
    main()
