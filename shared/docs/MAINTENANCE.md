# 六章工程维护

[← 共用资料](../README.md)

## 文件放在哪

仓库首页只讲系列目标、学习路线和各章入口。每章的讲义、实验步骤、指标、字幕、论文、工程说明和发布材料放在其目录内部；跨章规则、模板和公共工具说明放到 `shared/`。

```text
chapters/某一章/
├─ README.md           # 本章唯一入口
├─ chapter.json        # 状态、版本与时间线登记
├─ docs/               # 讲义、论文、实验/工程说明、检查记录
├─ experiments/        # 新实验入口（既有章也可能使用 scripts/）
├─ results/            # 经核验的实验产物
├─ checkpoints/        # 必要的小型权重
├─ src/                # 当前及仍被引用的动画组件
├─ supplements/        # 当前字幕、口播、时间导航
├─ assets/             # 本章外部媒体清单（如采用独立清单）
└─ publication/        # 按日期维护封面和发布文案
```

这是新章节的组织约定；已有章节保留实际使用的接口，不为目录整齐而复制实验结果。当前版本以根 [series.json](../../series.json) 和各章 `chapter.json` 为准。旧文件名可能仍属于当前依赖。

## 制作与修改顺序

1. 从[章节模板](../templates/chapter/README.md)明确观众要完成的具体目标，登记研究状态。
2. 保存原论文/官方入口、上游 commit、许可证及摘要。先实跑，再用真实结果写讲稿。
3. 新实验只写新 `runs/`；保留配置、种子、数据划分与失败样本。渲染读取已审核数据，不在帧计算中训练或随机重算。
4. 正式声音测时后锁定字幕、动作锚点与镜头。修改口播时联动更新这些内容。
5. 先验证代表镜头，再做首尾帧转场。记录生成参数、候选、授权预算与实际结果。
6. 完整 1080p 预览检查后更新交付，确认后再制作对应 4K，标明实际原生分辨率。
7. 同步本章 README、chapter.json、根 series.json、素材摘要、字幕和发布文案；首页只更新入口和状态。

按[视频制作 Skill](../skills/rainbow-cinematic-video/SKILL.md)处理视觉、口播和连续性；共用[声音规范](AUDIO.md)及[素材规则](ASSETS.md)。各章具体操作从[系列首页](../../README.md)进入。

## 仓库检查

从仓库根目录运行：

```sh
python tools/check_repository.py
python tools/check_evidence.py
python chapters/02-generation/experiments/check_evidence.py
python -m pip install -r chapters/03-language-multimodal/requirements-experiments.txt
python chapters/03-language-multimodal/experiments/check_evidence.py
```

修改哪个视频工程，就在相应目录运行 `npm run check`，再按影响范围复查代表帧、片段、接缝或音频。CI 同时检查总览及前三章类型。

重点看讲解对象是否及时可见，数值/图形是否保持身份并连续插值，接缝运动和曝光是否连贯，字幕及来源是否遮挡，论文焦点是否准确。自动检查不能代替这些观看与聆听。

## Git 与文件整理

建议分支使用 `codex/` 前缀，一次提交对应一个可验证修改。提交前检查 diff、文件体积与外部媒体忽略规则，避免提交私人数据和巨型缓存。

迁移文件时保存旧→新路径映射，更新 Markdown 链接、源码读取路径和工具说明；核对受哈希保护的实验原件没有变化。共用素材清单移到 `shared/assets/manifest.json` 后，条目中的路径仍相对仓库根目录。

发布新版本后先确认当前预览、源码和备份可用，再按实际依赖清理过期缓存；不能按版本号批量删除。具体导入与整理记录保存在本章 `docs/maintenance/` 或共用维护历史中。
