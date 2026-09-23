from manim import *
import numpy as np
config.background_color=BLACK
C='#8ACDD1';G='#DEC28E';W='#F3E8D2'
class Convolution(Scene):
 def construct(self):
  vals=np.array([[0,1,2,1,0],[1,3,4,2,1],[0,2,5,3,0],[1,2,3,1,0],[0,1,1,0,0]])
  grid=VGroup(*[VGroup(Square(.55,color=C,fill_opacity=.12),Text(str(vals[y,x]),font_size=21,color=W)).move_to([-4+x*.64,1.6-y*.64,0]) for y in range(5) for x in range(5)])
  kernel=Matrix([[-1,0,1],[-2,0,2],[-1,0,1]],element_to_mobject_config={'color':G}).scale(.7).move_to([.4,.5,0])
  window=Square(1.85,color=G).move_to([-3.36,.96,0]);value=DecimalNumber(0,num_decimal_places=0,color=G,font_size=65).move_to([4,.5,0]);eq=MathTex(r'y_{ij}=\sum_{u,v}K_{uv}X_{i+u,j+v}+b',color=W,font_size=40).shift(DOWN*2.6)
  self.play(FadeIn(grid),FadeIn(kernel),Create(window),FadeIn(value),run_time=1)
  self.play(Write(eq),run_time=1)
  k=np.array([[-1,0,1],[-2,0,2],[-1,0,1]])
  for y in range(3):
   for x in range(3):
    v=int((vals[y:y+3,x:x+3]*k).sum());self.play(window.animate.move_to([-3.36+x*.64,.96-y*.64,0]),ChangeDecimalToValue(value,v),run_time=.5);self.wait(.12)
  self.play(Indicate(kernel,color=C),run_time=.7);self.wait(.7)
class Gradient(Scene):
 def construct(self):
  ax=Axes(x_range=[-3,3,1],y_range=[0,6,1],x_length=9,y_length=4,axis_config={'color':C,'include_tip':False}).shift(UP*.3)
  graph=ax.plot(lambda x:.6*x*x+.4,color=C);t=ValueTracker(2.8);dot=always_redraw(lambda:Dot(ax.c2p(t.get_value(),.6*t.get_value()**2+.4),color=G,radius=.1));eq=MathTex(r'\theta\leftarrow\theta-\eta\nabla_\theta\mathcal L',font_size=51,color=W).shift(DOWN*2.5)
  self.play(Create(ax),Create(graph),FadeIn(dot),run_time=1.5);self.play(Write(eq),run_time=1)
  for x in [1.9,1.3,.9,.6,.4,.25,.1]:self.play(t.animate.set_value(x),run_time=.65);self.wait(.08)
  self.wait(1)
class Bellman(Scene):
 def construct(self):
  reward=MathTex(r'r',color=G,font_size=95).shift(LEFT*4);nextq=MathTex(r'\max_{a^\prime}Q_{\rm target}(s^\prime,a^\prime)',color=C,font_size=43).shift(RIGHT*2.2)
  arrow=Arrow(reward.get_right(),nextq.get_left(),color=W,buff=.3);target=MathTex(r'y=r+\gamma\max_{a^\prime}Q_{\rm target}(s^\prime,a^\prime)',font_size=45,color=W).shift(DOWN*2)
  self.play(FadeIn(reward),run_time=.8);self.play(GrowArrow(arrow),FadeIn(nextq),run_time=1.2);self.play(Write(target),run_time=1.7)
  for _ in range(3):
   pulse=Dot(arrow.get_start(),color=G);self.add(pulse);self.play(MoveAlongPath(pulse,arrow),run_time=.8);self.remove(pulse);self.play(Indicate(target,color=C),run_time=.5)
  self.wait(.6)
class Backup(Scene):
 def construct(self):
  root=Dot([0,2,0],color=G,radius=.13);children=VGroup(*[Dot([x,.3,0],color=C,radius=.1) for x in [-3,0,3]]);leaves=VGroup(*[Dot([x,-1.8,0],color=C,radius=.08) for x in [-4,-2,-1,1,2,4]])
  lines=VGroup(*[Line(root.get_center(),c.get_center(),color=C,stroke_opacity=.4) for c in children],*[Line(children[i//2].get_center(),l.get_center(),color=C,stroke_opacity=.4) for i,l in enumerate(leaves)])
  self.play(Create(lines),FadeIn(root),FadeIn(children),FadeIn(leaves),run_time=1.5)
  label=MathTex(r'N\leftarrow N+1,\qquad W\leftarrow W+z',font_size=43,color=W).shift(DOWN*3)
  self.play(Write(label),run_time=1)
  for j in [0,2,5]:
   dot=Dot(leaves[j].get_center(),color=G,radius=.12);self.add(dot);self.play(dot.animate.move_to(children[j//2].get_center()),run_time=.7);self.play(dot.animate.move_to(root.get_center()),run_time=.7);self.remove(dot);self.play(Indicate(root,color=G),run_time=.35)
  self.wait(.6)
