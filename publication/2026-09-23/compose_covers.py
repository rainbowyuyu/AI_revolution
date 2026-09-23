"""Editable brand typography over separately generated landscape/portrait artwork."""
from pathlib import Path
import json,io,math
import numpy as np
from PIL import Image,ImageFont,ImageDraw,ImageFilter
import fitz
ROOT=Path(__file__).resolve().parent;PROJECT=ROOT.parent/'ai_evolution_trailer'
if not PROJECT.is_dir():PROJECT=ROOT.parents[1]/'overview'
FONT=PROJECT/'public/fonts';OUT=ROOT/'covers';OUT.mkdir(exist_ok=True)
IVORY='#f8efdb';GOLD='#dec298';TEAL='#b4d5d4'
def font(size,serif=False,weight=650):
 f=ImageFont.truetype(str(FONT/('NotoSerifSC.ttf' if serif else 'NotoSansSC.ttf')),round(size))
 try:f.set_variation_by_axes([weight])
 except (OSError,ValueError):pass
 return f
def text(image,xy,words,size,color=IVORY,serif=False,weight=650,anchor='lt',gradient=False):
 face=font(size,serif,weight);mask=Image.new('L',image.size);d=ImageDraw.Draw(mask)
 d.text(xy,words,font=face,fill=255,anchor=anchor,stroke_width=0)
 shadow=Image.new('RGBA',image.size,(0,0,0,0));shadow.putalpha(mask.filter(ImageFilter.GaussianBlur(10)).point(lambda a:round(a*.5)));image.alpha_composite(shadow,(0,3))
 if gradient:
  y=np.arange(image.height)[:,None];t=np.clip((y-xy[1])/size,0,1);a=np.array([252,237,200]);b=np.array([206,164,104]);arr=np.broadcast_to((a[None,None,:]*(1-t[:,:,None])+b[None,None,:]*t[:,:,None]).astype('uint8'),(image.height,image.width,3)).copy();fill=Image.fromarray(arr).convert('RGBA')
 else:fill=Image.new('RGBA',image.size,color)
 fill.putalpha(mask);image.alpha_composite(fill)
 box=d.textbbox(xy,words,font=face,anchor=anchor)
 assert box[0]>=0 and box[1]>=0 and box[2]<=image.width and box[3]<=image.height,(words,box)
 return list(box)
def shade(image,portrait=False):
 w,h=image.size;x=np.arange(w)[None,:]/w;y=np.arange(h)[:,None]/h
 if portrait:alpha=np.clip((y-.80)/.2,0,1)*.72+np.clip((.26-y)/.26,0,1)*.12
 else:alpha=np.clip((.59-x)/.3,0,1)*.28+np.clip((y-.78)/.22,0,1)*.36
 arr=np.zeros((h,w,4),dtype='uint8');arr[:,:,:3]=[3,10,17];arr[:,:,3]=(np.broadcast_to(np.clip(alpha,0,.78),(h,w))*255).astype('uint8');image.alpha_composite(Image.fromarray(arr))
def brand(image,x,y,size=32):
 svg=(PROJECT/'public/brand/rainbow-vector.svg')
 if not svg.exists():svg=ROOT/'rainbow-vector.svg'
 doc=fitz.open(stream=svg.read_bytes(),filetype='svg');pdf=fitz.open('pdf',doc.convert_to_pdf());page=pdf[0];pix=page.get_pixmap(matrix=fitz.Matrix(1,1),alpha=True);logo=Image.frombytes('RGBA',[pix.width,pix.height],pix.samples)
 height=round(size*1.5);logo=logo.resize((round(height*347/410),height),Image.Resampling.LANCZOS);image.alpha_composite(logo,(round(x),round(y)))
 text(image,(x+logo.width+13,y+height*.18),'rainbow鱼',size,GOLD,serif=True,weight=650)
def line(image,start,end,color='#b99b6b',width=2):ImageDraw.Draw(image).line([start,end],fill=color,width=width)
def load(name,size):return Image.open(ROOT/'artwork'/name).convert('RGBA').resize(size,Image.Resampling.LANCZOS)
DESIGNS={
 'overview':dict(first='AI 是怎样',second='走到今天的？',kicker='AI 进化史  /  系列总览',sub='从认出一只猫，到走进物理世界',detail='六章计划 · 可视化拆解',name='总览',portrait='overview-portrait.png'),
 'chapter01':dict(first='电脑怎样',second='认出这只猫？',kicker='AI 进化史  / 第一章',sub='认图、控杆、下棋，三个真实实验',detail='CNN · 强化学习 · 搜索',name='第一章',portrait='chapter01-portrait-take3.png')}
def save(image,name):
 image=image.convert('RGB');image.save(OUT/(name+'.png'));image.save(OUT/(name+'.jpg'),quality=94,subsampling=0,optimize=True)
def main():
 layout=[]
 for ident,c in DESIGNS.items():
  im=load(ident+'-landscape.png',(1920,1080));shade(im);brand(im,106,105,33)
  text(im,(108,248),c['kicker'],31,GOLD,weight=550)
  a=text(im,(100,353),c['first'],142,serif=True,weight=850)
  b=text(im,(100,535),c['second'],124,serif=True,weight=850,gradient=True)
  line(im,(108,728),(198,728));text(im,(108,768),c['sub'],35,TEAL,weight=500)
  text(im,(108,925),c['detail'],30,IVORY,weight=550)
  name=c['name']+'_横版16x9_1920x1080';save(im,name);layout.append(dict(file=name,mainTextBoxes=[a,b],titleMaxX=880,heroFaceMinX=1100))
  for ratio,size in [('9x16',(1080,1920)),('3x4',(1080,1440))]:
   im=load(c['portrait'],(1080,1920))
   if ratio=='3x4':
    crop_top=0 if ident=='overview' else 180
    im=im.crop((0,crop_top,1080,crop_top+1440))
   shade(im,True)
   top=(168 if ident=='overview' else 214) if ratio=='9x16' else 90
   text(im,(540,top),c['kicker'],30,GOLD,weight=550,anchor='mt')
   a=text(im,(540,top+74),c['first'],94,serif=True,weight=850,anchor='mt')
   b=text(im,(540,top+203),c['second'],108,serif=True,weight=850,anchor='mt',gradient=True)
   # All large text ends above the eyes and is centered away from app controls.
   text(im,(540,top+352),c['sub'],30,TEAL,weight=550,anchor='mt')
   footer=1630 if ratio=='9x16' else 1260
   line(im,(110,footer-34),(192,footer-34));text(im,(110,footer),c['detail'],34,IVORY,weight=600)
   brand(im,110,footer+74,33)
   name=c['name']+'_竖版'+ratio+'_'+str(size[0])+'x'+str(size[1]);save(im,name);layout.append(dict(file=name,mainTextBoxes=[a,b],safeFromBottom=size[1]-(footer+130)))
 (ROOT/'layout.json').write_text(json.dumps(layout,ensure_ascii=False,indent=2)+'\n','utf8')
 # View exact mobile-scale reductions, not just the full-resolution source.
 contact=Image.new('RGB',(1560,1260),'#07121c');d=ImageDraw.Draw(contact)
 for row,ident in enumerate(DESIGNS):
  name=DESIGNS[ident]['name'];y=row*630
  h=Image.open(OUT/(name+'_横版16x9_1920x1080.jpg'));h.thumbnail((896,504));contact.paste(h,(24,y+66))
  v=Image.open(OUT/(name+'_竖版9x16_1080x1920.jpg'));v.thumbnail((324,576));contact.paste(v,(946,y+30))
  mini=Image.open(OUT/(name+'_横版16x9_1920x1080.jpg')).resize((256,144),Image.Resampling.LANCZOS);contact.paste(mini,(1288,y+245))
  d.text((28,y+24),name+' / 16:9 + 9:16 + 手机缩略图',font=font(24),fill=IVORY)
 contact.save(ROOT/'封面总览.jpg',quality=94)
 print('Created 6 covers in PNG/JPEG and a contact sheet')
if __name__=='__main__':main()
