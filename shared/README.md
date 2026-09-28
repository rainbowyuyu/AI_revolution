# 系列共用资料

[← 回到 AI 进化史](../README.md)

这里集中维护跨章节的规范、工具和模板。某一章的讲义、实验、字幕、论文、视频工程和封面，统一从该章 README 进入。

## 你想处理什么

| 任务 | 入口 |
|---|---|
| 继续制作或修改章节 | [维护流程](docs/MAINTENANCE.md)、[新章节模板](templates/chapter/README.md) |
| 找某章的复现步骤 | [实验导航](docs/REPRODUCIBILITY.md) |
| 恢复自己的音视频素材 | [素材规则与分章入口](docs/ASSETS.md) |
| 统一口播、字幕和配乐 | [声音与同步规范](docs/AUDIO.md) |
| 沿用电影感视频风格 | [制作 Skill](skills/rainbow-cinematic-video/SKILL.md) |
| 查询来源与使用范围 | [第三方说明](docs/THIRD_PARTY_NOTICES.md)、[仓库权利说明](../LICENSE.md) |
| 使用仓库级维护工具 | [工具目录](../tools/README.md) |
| 查看首次导入与结构变化 | [导入记录](docs/IMPORT_REPORT.md)、[目录整理记录](docs/maintenance/目录与首页整理-2026-09-29.md) |

## 共用目录

```text
shared/
├─ docs/          # 跨章维护规则、权利说明与历史记录
├─ assets/        # 首页视觉资源与共用外部媒体清单
├─ skills/        # 视频制作规范
├─ templates/     # 后续章节模板
└─ publication/   # 跨章共用排版脚本、平台研究与历史台账
```

`assets/manifest.json` 管理总览与第一章的外部素材；第二章采用其目录内的独立清单。恢复工具与目录层级见各章工程说明。清单位置变化不会改变其中登记的素材目标路径。
