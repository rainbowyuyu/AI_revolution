# 声音、字幕与同步

## 当前可用音轨

总览 V11 使用 `overview/public/audio/v11/` 的正式主音轨；第一章 V9 使用 `chapters/01-vision-choice/public/audio/v8/master.wav`。恢复这些资产即可预览，不必重新生成声音。

总览 V11 口播记录位于 `public/audio/v11/voice.json`，第一章主体记录位于 `research/voice-timeline-v8.json`，片头位于 `research/voice-v8-opening.json`。第一章完整字幕以 `src/timeline-v9.json` 的 captions 为准；`docs/中文字幕_V8.srt` 是原始版本材料，不作为新的时间线真值。

## 本地 TTS

TTS 模型和私人声音参考不进仓库。设置 `RAINBOW_TTS_ROOT`，其下沿用原环境的 `models/Qwen3-TTS-0.6B`、`work/clone-reference.wav`、`work/clone-reference.json`。使用已有独立 Qwen3-TTS 环境；需要 torch、qwen_tts、numpy、soundfile，部分对齐/混音脚本另需 scipy、faster-whisper、FFmpeg 和本地 Whisper 模型。

```powershell
$env:RAINBOW_TTS_ROOT = "<自己的 TTS 环境目录>"
$env:PYTHONUTF8 = '1'
# 在 overview 内，用该环境的 Python 执行：
python scripts/v11_voice.py
python scripts/v11_audio.py
```

上述命令会重新生成口播/时间线/混音，需要重新检查接缝和字幕；不是查看现有工程的必要步骤。第一章 `scripts/audio_v8.py voice` 只生成片头，`scripts/mix_v8.py` 使用片头与既有主体记录混音，须恢复相关单句文件（`--include-voice-clips`）。正文的全部历史声音修复流水线未作为一键再生成工具导出；如果要改正文，以对应语音记录为输入重新合成整句并重新对齐。

## 口播与读音标准

- 作者名显示 **rainbow鱼**；自然地读作者名字，不把中英文分别拼接，必要时保留品牌视觉而减少口播重复。
- AlphaGo 发音保持英文整体，不替换为“Alpha 围棋”；ReLU 作为完整词发音，不逐个读字母。
- 显示文本与 `spoken` 可分离。行列、多音字和专名逐句复听；不能靠 ASR 同音字匹配宣布发音正确。
- 一句话交代具体对象、要做什么、为什么；不用“为了避免观众……”“本片将……”等制作过程口吻。
- 不切掉尾音来挤时间。自然阅读，保留句尾/换气；±5% 之外的变速需求优先重写句子。

## 降噪、混音与动作

轻度高/低通和降噪先试听，不用过重处理换来金属声。保留原始 WAV 与处理参数；检查延迟、尾部和中英文衔接。背景音乐随旁白压低，无章节切换提示音。目标约 −14 LUFS、真峰值 ≤ −1 dBTP，最终 AAC 编码后再次测量。

一句话对应镜头表中的可观察动作；“窗口移动”“概率变大”“回传到父节点”等都应有帧锚点。先实测语音，再定位动作；修改句子长度后要重算相关镜头而非只拉伸背景。字幕按语义切短，最多两行并预留底部安全区，重点检查源标签、代码和品牌不相撞。

`tools/export_supplements.py` 从当前时间线导出字幕及旁白记录；它不会自动重新做语音识别对齐，不是读音或同步的验收替代品。
