# 外部素材、备份与恢复

Git 仓库保存可以审阅和版本控制的源码、实验结果、小型权重、参考链接及字幕。它不是完整媒体备份。原视频项目继续保留，原有成片不在本次整理中被移动或删除。

## 资产台账

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

## 恢复命令

在仓库根目录执行：

```powershell
python tools/assets.py status --project overview
python tools/assets.py restore --source-root "<video_project目录>" --project overview
python tools/assets.py restore --source-root "<video_project目录>" --project chapters/01-vision-choice
python tools/assets.py status --verify
```

`source-root` 下必须存在 `ai_evolution_trailer/` 与 `ai_evolution_ch01_vision_choice/` 中所选项目的目录。工具先验证源文件 SHA-256，再复制；不覆盖已存在但不匹配的目标。状态检查发现缺失返回退出码 1，这是新克隆未恢复素材时的预期行为。

默认跳过 `voice-clips`；重做混音时添加 `--include-voice-clips`。历史声音检查还可能需要原项目未导出的 ASR 缓存，不能将其缺失理解为成片音轨有问题。

## 新素材进入仓库

1. 先保存来源链接、版本/日期、许可、使用片段、处理方法及原始文件摘要。
2. 大型文件存 `public/media/`、`public/audio/` 等已忽略位置，在自有备份中保留相同相对路径。
3. 用 `python tools/register_assets.py --project <目录> --kind media <文件相对项目的路径>` 注册文件摘要；`sourceProject` 必须与备份中目录名一致，可用同名选项指定。
4. 提交清单与小型元数据，不提交原始下载日志或带签名的 URL。
5. 删除缓存前检查当前 composition 的引用、声音依赖和清单。Git 不能恢复被忽略且没有备份的大型文件。

云盘、对象存储或 GitHub Release 可以用于自己有权分发的媒体包，但当前仓库没有自动上传媒体，也没有承诺第三方论文和演示可任意再分发。
