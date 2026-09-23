# 总览 · AI 进化史

当前版本 **V11**，1920×1080、30 fps、5,787 帧、192.90 秒。开场明确解释：用可视化拆解 AI 的发展、原理与用途，随后进入六章总览，结尾是十篇真实 PDF 的景深叠放汇总。

## 当前入口

| 内容 | 路径 |
|---|---|
| Remotion composition | `TrailerV11-1080`，注册于 `src/Root.tsx` |
| 时间线 | `src/timeline-v11.json` |
| 源码 | `src/`，V11 复用部分较早版本场景 |
| 正式音轨与旁白记录 | `public/audio/v11/`；WAV 按外部素材恢复 |
| 当前字幕与口播 | `supplements/` |
| 论文与来源 | `docs/V11_参考文献.md`、`research/v11-papers.json` |
| 实际处理方法 | `research/v11-provenance.json`、`docs/V11_制作说明.md` |
| 渲染 | `scripts/render_v11.mjs` |

## 本地编辑

先在仓库根目录按 [素材恢复指南](../docs/ASSETS.md)恢复 overview。进入本目录：

```powershell
npm ci
npm run check
npm run studio
npm run stills
npm run render:intro
npm run render:papers
npm run render
```

完整输出在 `output/AI进化史_V11_预览1080p.mp4`；局部预览在 `output/v11/`。`npm run render` 指向 V11 全片，避免误运行未导出的旧 `render.mjs`。检查声音与编码需 FFmpeg/ffprobe 以及 `scripts/qa_v11.py` 的 Python 依赖。

## 镜头与版本说明

- 0–32.9 秒：五句新口播、三个提问、六章路线；视觉延续深蓝黑、象牙白、低饱和金青。
- 32.9–175.9 秒：六章正文，沿用 V10 对应部分并顺延 0.9 秒。
- 175.9–192.9 秒：十篇真实论文首页汇总，右侧简短作者/年份列表，不再逐篇翻书。
- V11 使用已有生成素材、同镜头慢速补帧和柔和叠化；没有新增生成费用，也不将叠化说成首尾帧生成。

原制作记录包含完整解码及响度结果：−14.15 LUFS、−1.45 dBTP。它们是原 V11 成片的记录；此次源码迁移只做相应工程检查，不声称重新完整观看或导出了新的成片。

修改口播前阅读 [声音指南](../docs/AUDIO.md)。不要直接重运行音频脚本后沿用旧切点；重新测时后同步时间线和字幕。当前只交付 1080p 预览，4K 待确认。
