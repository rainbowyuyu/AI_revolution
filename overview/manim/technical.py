from manim import *
import numpy as np
config.background_color=BLACK
CYAN='#79E8EA'; GOLD='#DFBD88'; IVORY='#F2EFE6'

class Attention(Scene):
    def construct(self):
        # A single attention row: normalized affinity, not a fabricated model trace.
        nodes=VGroup(*[Dot([i*1.1-2.2,1.4,0],radius=.08,color=IVORY) for i in range(5)])
        query=Dot([0,-.25,0],radius=.11,color=GOLD)
        weights=[.08,.13,.48,.23,.08]
        lines=VGroup(*[Line(query.get_center(),p.get_center(),color=CYAN,stroke_width=1+w*10,stroke_opacity=.25+w) for p,w in zip(nodes,weights)])
        eq=MathTex(r'\mathrm{Attention}(Q,K,V)=\mathrm{softmax}\!\left(\frac{QK^{\mathsf T}}{\sqrt{d_k}}\right)V',font_size=57,color=IVORY).shift(DOWN*1.6)
        labels=VGroup(*[DecimalNumber(w,num_decimal_places=2,font_size=32,color=CYAN).next_to(p,UP,.25) for p,w in zip(nodes,weights)])
        self.play(FadeIn(nodes),FadeIn(query),run_time=.6)
        self.play(LaggedStart(*[Create(l) for l in lines],lag_ratio=.13),run_time=1.2)
        self.play(FadeIn(labels),Write(eq),run_time=1.3)
        pulses=VGroup(*[Dot(query.get_center(),radius=.04,color=GOLD) for _ in nodes])
        self.add(pulses)
        self.play(*[MoveAlongPath(p,l,rate_func=linear) for p,l in zip(pulses,lines)],run_time=1.3)
        self.play(FadeOut(pulses),Indicate(nodes[2],color=GOLD),run_time=.8)
        self.wait(.8)

class Denoising(Scene):
    def construct(self):
        rng=np.random.default_rng(19)
        n=200
        theta=np.linspace(0,TAU,n,endpoint=False)
        target=np.c_[2*np.cos(theta),1.1*np.sin(theta),np.zeros(n)]
        dots=VGroup(*[Dot([*rng.uniform(-3,3,2),0],radius=.025,color=CYAN,fill_opacity=.65) for _ in range(n)])
        eq=MathTex(r'x_{t-1}=\mu_\theta(x_t,t)+\sigma_t z,\quad z\sim\mathcal N(0,I)',font_size=54,color=IVORY).shift(DOWN*2.45)
        self.play(FadeIn(dots),run_time=.5)
        self.play(*[d.animate.move_to(target[i]+np.r_[rng.normal(0,.5,2),0]) for i,d in enumerate(dots)],run_time=1.4)
        self.play(*[d.animate.move_to(target[i]+np.r_[rng.normal(0,.13,2),0]).set_color(GOLD) for i,d in enumerate(dots)],Write(eq),run_time=1.6)
        self.play(*[d.animate.move_to(target[i]) for i,d in enumerate(dots)],run_time=1.3)
        self.play(Rotate(dots,angle=.2),run_time=1.2)
