# 首页视觉素材

这些素材只服务仓库的统一入口。各章完整封面、发布文案与素材记录仍放在相应章节的 `publication/` 中。

| 文件 | 用途 | 尺寸 |
| --- | --- | --- |
| `hero.png` | 首页横幅，复用总览的猫与机械手封面场景 | 1600 × 560 |
| `roadmap.png` | 六章讲解路线；前两章已有资料，其余为规划 | 1600 × 350 |
| `overview.jpg` | 可点击的总览入口缩略图 | 960 × 540 |
| `chapter-01.jpg` | 可点击的第一章入口缩略图 | 960 × 540 |
| `chapter-02.jpg` | 可点击的第二章入口缩略图 | 960 × 540 |
| `mnist-denoising.gif` | 第二章真实 DDPM 采样的轻量动态预览 | 960 × 360 |

动图按顺序读取已保存的 `ddpm-t200.png` 至 `ddpm-t000.png`，每隔 5 步一帧。始终取原图第 1–2 行、第 1–4 列的同一组 8 个样本，不重绘数字、不补帧、不插值。训练种子为 42，生成种子为 10042；图中的 `t` 是剩余去噪时间步，不是训练轮数。动图只是已保存的离散步骤回放，并非完整 200 步的逐步渲染。

品牌图形、封面源文件和全部实验帧的路径与 SHA-256 记录在 [sources.json](sources.json)。封面场景是系列视觉素材，实验动图是仓库实际运行结果。路线图表达本系列的讲解顺序，不表达所有技术的直接继承关系。

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

无需网络、模型或生成费用。字体不打包进仓库；更换字体后像素结果可能不同。更新章节状态时，同步修改脚本中的路线文案并重新生成。

根 README 可直接使用相对路径图片和普通链接，例如：

```markdown
[![第二章：AI 怎么画出真实图像](shared/assets/readme/chapter-02.jpg)](chapters/02-generation/README.md)
```

不用 JavaScript、外部统计服务或依赖 GitHub 不支持的 CSS。给图片附上有意义的替代文本；六章名称与状态也在正文导航保留，方便移动端阅读和辅助工具访问。
