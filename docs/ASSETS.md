# 外部素材、备份与恢复

Git 仓库保存可以审阅和版本控制的源码、实验结果、小型权重、参考链接及字幕。它不是完整媒体备份。原视频项目继续保留，原有成片不在本次整理中被移动或删除。

## 两套资产台账

| 范围 | 清单 | 恢复工具与源目录 |
|---|---|---|
| 总览、第一章 | 根 `assets/manifest.json` | `tools/assets.py`；`--source-root` 指向包含原项目子目录的 `video_project` |
| 第二章 V18 | `chapters/02-generation/assets/video-manifest.json` | 本章 `scripts/prepare_assets.py`；`--source-public` 直接指向原第二章的 `public` |

两套工具读取的清单格式和源目录层级不同。根清单仍只管理总览和第一章，根 `status --verify` 不表示第二章媒体已经核验。

## 总览、第一章资产台账

`assets/manifest.json` 的每行包含：目标路径 `path`、所属 `project`、原项目目录名 `sourceProject`、相对路径 `sourcePath`、字节数 `bytes`、`sha256` 与类型 `kind`。

| kind | 内容 | 克隆仓库后如何取得 |
|---|---|---|
| media | 选用画面、转场、背景、动画片段 | 从原项目或自己的媒体备份恢复 |
| papers | 论文截图、聚焦页 | 从备份恢复；重新生成须核对论文版本及页码 |
| fonts | 字体文件 | 从备份恢复，保留 public/fonts 内许可证 |
| audio | 主音轨、旁白或配乐等 | 从原项目恢复；预览优先使用已核验的 master |
| voice-clips | 单句语音及原始语音缓存 | 可选恢复，仅重新混音或修音时需要 |
| pdf-original | 论文原始 PDF | 从备份恢复，或按来源链接合法获取 |

清单不含 TTS 模型权重或个人参考音频；这些在自己的 TTS 环境中单独管理。最终 MP4 也不作为源码资产提交。素材中可能有被复用的旧版文件；文件名版本号不代表可以删除。

## 总览、第一章恢复命令

在仓库根目录执行：

```powershell
python tools/assets.py status --project overview
python tools/assets.py restore --source-root "<video_project目录>" --project overview
python tools/assets.py restore --source-root "<video_project目录>" --project chapters/01-vision-choice
python tools/assets.py status --verify
```

`source-root` 下必须存在 `ai_evolution_trailer/` 与 `ai_evolution_ch01_vision_choice/` 中所选项目的目录。工具先验证源文件 SHA-256，再复制；不覆盖已存在但不匹配的目标。状态检查发现缺失返回退出码 1，这是新克隆未恢复素材时的预期行为。

默认跳过 `voice-clips`；重做混音时添加 `--include-voice-clips`。历史声音检查还可能需要原项目未导出的 ASR 缓存，不能将其缺失理解为成片音轨有问题。

## 第二章 V18 恢复命令

本章外部清单共 **165 项，1,642,062,265 字节（约 1.53 GiB）**，包括当前引用的原视频、角色与噪声图、时序示意图、论文页面、中文字体和 V18 混音母带。清单中的路径相对本章 `public/`，不包含私人参考声音、TTS 模型、整片导出或历史分段。

从仓库根目录执行：

```powershell
python chapters/02-generation/scripts/prepare_assets.py
python chapters/02-generation/scripts/prepare_assets.py --source-public "<原第二章工程/public目录>"
python chapters/02-generation/scripts/prepare_assets.py --check-external
```

第一条仅把仓库中的 50 张数字实验图从 `results/digits/` 恢复到 `public/experiments/digits/`。第二条的源目录下应直接出现 `audio/`、`character/`、`media/` 等子目录，例如你自己的备份中 `ai_evolution_ch02_creation/public/`。工具核对体积和 SHA-256 后复制；已有目标不匹配时报告并保留，不静默覆盖。

工具不会联网下载外部媒体。未持有或未恢复素材时，`--check-external` 会以失败退出；源码和实验仍可阅读、核验及运行。第二章安装、预览、渲染和可选帧缓存见[视频工程](../chapters/02-generation/docs/视频工程.md)。默认以原视频解码，帧缓存不是启动必需项。

## 新素材进入仓库

1. 先保存来源链接、版本/日期、许可、使用片段、处理方法及原始文件摘要。
2. 大型文件存 `public/media/`、`public/audio/` 等已忽略位置，在自有备份中保留相同相对路径。
3. 总览、第一章使用 `python tools/register_assets.py --project <目录> --kind media <文件相对项目的路径>` 注册文件摘要；`sourceProject` 必须与备份中目录名一致，可用同名选项指定。第二章使用本章独立的 `scripts/build_video_manifest.py --source-public <原第二章/public目录> --trim-cache`，在本章目录执行；变更动态路径规则时同步维护脚本的展开规则。
4. 提交清单与小型元数据，不提交原始下载日志或带签名的 URL。
5. 删除缓存前检查当前 composition 的引用、声音依赖和清单。Git 不能恢复被忽略且没有备份的大型文件。

云盘、对象存储或 GitHub Release 可以用于自己有权分发的媒体包，但当前仓库没有自动上传媒体，也没有承诺第三方论文和演示可任意再分发。

## 2026-09-23 清理后的状态

根外部资产清单在该次清理后为 1,200 项；4 项第一章旧 master/narration 已退役，记录在 `docs/maintenance/retired-assets-2026-09-23.json`。V9 使用的 `audio/v8/master.wav` 和单句声音保留。根恢复工具默认不再要求这些退役音轨；旧 composition 可能需要恢复其旧声音后才能导出。2026-09-29 新增的第二章 165 项保存在独立清单中，没有合并到上述历史数量。
