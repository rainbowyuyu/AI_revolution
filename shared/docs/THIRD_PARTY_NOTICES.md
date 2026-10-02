# 第三方内容与改动说明

| 来源 | 仓库中的位置 | 说明 |
|---|---|---|
| PyTorch Tutorials | `chapters/01-vision-choice/research/upstream/` | 保存 CNN/DQN 教程及 `pytorch-LICENSE`；commit 见 research/sources.json |
| DeepMind OpenSpiel | 同上 | 保存 mcts.py、connect_four.cc、`spiel-LICENSE`；原文件遵守上游许可 |
| CIFAR-10 / Alex Krizhevsky 等 | 样本图、训练证据与镜像来源 | 完整数据不上传；研究使用须按数据来源条款，图像不视为原创资产 |
| Gymnasium / Farama Foundation | Python 依赖 | 按指定发行版的许可证；本仓库保存状态轨迹而非完整依赖源码 |
| Remotion / React 等 | 各项目 package-lock.json | 依赖各自许可证；Remotion 的许可适用条件需按使用场景确认 |
| 中文字体 | `public/fonts/` 中的许可文件 | 字体二进制外部恢复，禁止漏掉对应许可 |
| LeNet、AlexNet、DQN、AlphaGo、Zero 及总览其他论文 | 各项目 research/sources.json、docs/参考文献 | 版权归作者/出版方；论文 PDF 和大图外部管理，引用不等于取得任意再分发许可 |
| 官方视频及生成素材 | 来源/处理台账，`shared/assets/manifest.json` 与第二章 `assets/video-manifest.json` | 真实演示、机制重构、生成概念镜头区分；遵守原平台许可 |
| MNIST / Yann LeCun、Corinna Cortes、Christopher J. C. Burges | 第二章 `results/digits/training-examples.png`、实验数据说明 | 完整数据不上传；训练图像从 CVDF 镜像按 SHA-256 校验下载，数据权利与使用范围以原始来源为准 |
| PyTorch、NumPy、Pillow | 第二章 `requirements-experiments.txt` | 运行依赖按各自发行版许可证使用，本仓库没有打包其库源码或二进制环境 |
| GAN、DCGAN、扩散建模、DDPM、DDIM、潜空间扩散、Classifier-Free Guidance 论文 | 第二章 `docs/论文索引.md`、`src/papers-v4.json` | 保留作者、论文入口与使用说明；不随 Git 上传论文 PDF，引用不代表允许任意再分发论文图 |
| “Bleeping Demo” / Kevin MacLeod | 第二章 V18 配乐；母带登记于本章 `assets/video-manifest.json` | 原曲采用 CC BY 4.0；ISRC USUAN2000021，发布时保留署名、许可链接和改编说明 |

第一章在教程基础上增加多种子训练、固定数据划分、独立评估、checkpoint 保存和可视化证据导出；搜索实验增加预算对比、交换先手和轨迹记录。改动代码与原始上游分开放置，没有声称上游作者验证过本片结果。

第二章二维 GAN/DDPM 与 MNIST 脚本为独立教学实现，原项目将外部代码用作研究对照，没有在本次资料包中复制上游实现。`experiments/original/` 保存本项目实际运行过的历史源码；外层便携入口在相同算法基础上增加设备选择、短运行、空目录保护和数据哈希校验。小网络实验没有复现论文中的大规模图像模型，也不代表论文作者认可本章结论。

MNIST 原始介绍：[The MNIST Database](http://yann.lecun.com/exdb/mnist/)；本章下载镜像：[CVDF training images](https://storage.googleapis.com/cvdf-datasets/mnist/train-images-idx3-ubyte.gz)。一张训练样本网格来自该数据集，其他数字网格是本章模型的生成结果；不可将训练样本认作本项目原创绘图。

第二章 V18 的音乐署名应保留：

> “Bleeping Demo” — Kevin MacLeod (incompetech.com). Licensed under Creative Commons: By Attribution 4.0. https://creativecommons.org/licenses/by/4.0/

原曲来源：[ISRC USUAN2000021](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN2000021)；[官方许可说明](https://incompetech.com/music/royalty-free/licenses/)。V18 对原曲进行了选段、循环、音量及变奏编排，并与旁白混音；不得将改编后的配乐说成本项目原创作曲。媒体通过第二章独立素材清单恢复，其登记不改变原曲、角色素材、声音或论文的权利归属。

未经核实的媒体许可不得以“重绘”规避；公开视频前按来源台账逐项确认使用范围。API 凭据、私人声音参考及服务器信息不属于补充材料。


## 第三章 · 语言连接万物

- [十篇论文及精确版本](../../chapters/03-language-multimodal/docs/论文索引.md)：保留作者、论文链接、图号/页码及来源SHA-256，仓库不分发原论文PDF或论文截图。
- [OpenAI CLIP](https://github.com/openai/CLIP) 与[模型卡](https://huggingface.co/openai/clip-vit-base-patch32)：采用公开预训练权重，revision锁定为 `3d74acf9a28c67741b2f4f2ea7635f0aaf6f0268`。模型文件从原来源取得，不纳入本仓库；代码、权重与依赖遵循各自许可证。
- NumPy、Pillow、PyTorch、Transformers、Hugging Face Hub、Remotion、React及TypeScript为运行依赖，未将其库源码或二进制环境打包为原创内容。
- 字符BPE、因果注意力、计数续写和计算导出为本项目教学实现；CLIP检索调用公开模型，候选图片由本项目生成。冻结结果中的图像SHA-256用于保证可复现，不把生成场景称为真实摄影或标准评测集。
- 自制讲义图依据已保存数据绘制；Q/K/V矩阵、六词元投影和封面芯片为教学示例，不能视为某个商用模型的内部结构或真实解释性结论。
- 第三章音乐为 **Dawn — Sappheiros**，音效为 **Rustling leaves — Gravity Sound**；具体来源、改编与署名见[音乐来源与署名](../../chapters/03-language-multimodal/docs/音乐来源与署名.md)。文件外部恢复，登记不授予额外分发权利。
- 第三章外部音画、论文页和字体见[独立媒体清单](../../chapters/03-language-multimodal/assets/video-manifest.json)。原制作环境的私人声音参考、API凭据、生成服务地址与逐帧视频缓存未公开。
