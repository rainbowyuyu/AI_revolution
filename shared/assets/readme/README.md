# 首页视觉素材

这些素材只服务仓库的统一入口。各章完整封面、发布文案与素材记录仍放在相应章节的 `publication/` 中。

| 文件 | 用途 | 尺寸 |
| --- | --- | --- |
| `hero.png` | 首页横幅：前三章的猫、踏雪与词海红伞；保留当前品牌与配色 | 1600 × 620 |
| `roadmap.png` | 六章讲解路线；前三章资料已整理，其余为规划 | 1600 × 630 |
| `overview.jpg` | 可点击的总览入口缩略图 | 960 × 540 |
| `chapter-01.jpg` | 可点击的第一章入口缩略图 | 960 × 540 |
| `chapter-02.jpg` | 可点击的第二章入口缩略图 | 960 × 540 |
| `chapter-03.jpg` | 可点击的第三章入口缩略图，来自 V15 满幅词海封面 | 960 × 540 |
| `mnist-denoising.gif` | 第二章真实 DDPM 采样的轻量动态预览 | 960 × 360 |
| `attention-preview.gif` | 第三章四词因果注意力：逐行聚焦与权重条形动画，12 秒循环 | 960 × 420 |

去噪动图按顺序读取已保存的 `ddpm-t200.png` 至 `ddpm-t000.png`，每隔 5 步一帧。始终取原图第 1–2 行、第 1–4 列的同一组 8 个样本，不重绘数字、不补帧、不插值。训练种子为 42，生成种子为 10042；图中的 `t` 是剩余去噪时间步，不是训练轮数。动图只是已保存的离散步骤回放，并非完整 200 步的逐步渲染。

注意力动图读取第三章 `results/causal_attention.json` 的手设 Q/K/V 与实算权重，生成时重新核验分数、遮罩、softmax 和加权输出。矩阵位置固定，高亮轮廓逐行移动，条形在两行之间做展示插值；过渡时隐藏数值，驻留时显示真实权重。它解释一个计算例子，不表示训练轨迹或模型对这些词的真实语义判断。动图共用调色板，避免固定文字闪烁。

品牌图形、封面源文件、注意力数据和全部实验帧的路径与 SHA-256 记录在 [sources.json](sources.json)。横幅只裁切现有画面并重新排版，没有重新生成角色。第二章横版使用其正式 V6 封面，第三章封面 V15 与成片 V10 是分别维护的版本。路线图表达本系列的讲解顺序，不表达所有技术的直接继承关系。

## 重新生成

安装 Pillow 和 NumPy 后，在仓库根目录运行：

```bash
python shared/assets/readme/build_visuals.py
```

默认使用 Windows 已安装的 Noto Sans SC / Noto Serif SC。其他平台指定本机字体：

```bash
python shared/assets/readme/build_visuals.py \
  --sans-font /path/to/NotoSansSC-VF.ttf \
  --serif-font /path/to/NotoSerifSC-VF.ttf
```

无需网络、模型或生成费用。主脚本会一并调用 `build_attention.py`。字体不打包进仓库；更换字体后像素结果可能不同。横幅进度与路线图状态读取根 `series.json`：`preview-ready` 与 `materials-ready` 表示已有可用资料，其余为后续规划。更新登记后重新运行脚本，避免图片与文字进度不同步。

根 README 可直接使用相对路径图片和普通链接，例如：

```markdown
[![第二章：AI 怎么画出真实图像](shared/assets/readme/chapter-02.jpg)](chapters/02-generation/README.md)
```

不用 JavaScript、外部统计服务或依赖 GitHub 不支持的 CSS。给图片附上有意义的替代文本；六章名称与状态也在正文导航保留，方便移动端阅读和辅助工具访问。
