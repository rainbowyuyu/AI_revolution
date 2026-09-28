# 外部素材、备份与恢复

[← 共用资料](../README.md)

Git 保存源码、实验结果、小型权重、来源与字幕；完整成片和大型媒体由维护者自行备份。单独运行教学实验不需要恢复整片素材。

## 分章恢复入口

| 工程 | 操作说明 | 素材清单 |
|---|---|---|
| 系列总览 | [总览视频工程](../../overview/docs/视频工程.md) | [共用清单](../assets/manifest.json) |
| 第一章 | [第一章视频工程](../../chapters/01-vision-choice/docs/视频工程.md) | [共用清单](../assets/manifest.json) |
| 第二章 | [第二章视频工程](../../chapters/02-generation/docs/视频工程.md) | [本章清单](../../chapters/02-generation/assets/video-manifest.json) |

两类恢复工具的源目录层级不同，具体命令放在所属工程内。未恢复素材时，源码检查可以通过，但完整渲染会缺少外部依赖。

## 登记规则

共用清单 `shared/assets/manifest.json` 中，`path` 始终相对仓库根目录；`sourceProject` 与 `sourcePath` 表示自己备份中的项目目录与文件。移动清单本身不改变素材目标位置。每条还记录 `project`、`bytes`、`sha256`、`kind`。

- `media`：选用视频、背景和动画片段。
- `papers` / `pdf-original`：真实论文页及原始 PDF，按原始来源的权限使用。
- `fonts`：字体二进制；许可证文本随源码保留。
- `audio`：已核验母带、旁白和音乐。
- `voice-clips`：可选的单句缓存，仅重新混音或修音时恢复。

第二章清单的路径相对其 `public/`，采用独立恢复脚本。各章清单只登记当前需要的媒体，不包含私人声音参考、TTS 权重或账号凭据。

## 维护要求

新增素材先记录来源、使用范围、处理方法、大小与 SHA-256，再更新该工程清单。总览及第一章可使用 `tools/register_assets.py`；第二章使用其 `scripts/build_video_manifest.py`。具体工作目录和参数见各章工程说明。

清理前检查当前 composition 的依赖、声音链和备份。旧版本文件名可能仍被当前版本引用，不能仅凭数字删除。Git 无法恢复被忽略且没有备份的大型文件。历史退役记录见[2026-09-23 清理记录](maintenance/清理记录-2026-09-23.md)。
