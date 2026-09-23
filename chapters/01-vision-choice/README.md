# 第一章 · 看见与选择

**计算机怎样从图片中作出判断，又怎样根据反馈选择行动？** 用 CIFAR-10 分类、CartPole 平衡杆和四子棋搜索三个实际任务，串起 CNN、DQN 与 AlphaGo 背后的方法。

当前基线为 **V9 分类引言修正版**，1920×1080、30 fps、60,544 帧，约 33 分 38 秒。当前源为 `ChapterV9-1080`，当前音轨仍为 `public/audio/v8/master.wav`；这是复用关系，不是版本写错。

## 阅读与复现入口

- [实验结果](docs/实验结果.md)：三种子结果、失败案例与局限。
- [完整复现指南](../../docs/REPRODUCIBILITY.md)：隔离环境、数据下载、训练/搜索、评估和上游版本。
- [来源与使用说明](docs/来源与使用说明.md)：论文、教程、演示与教学重构。
- [当前字幕与口播](supplements/README.md)：由 V9 时间线及对应语音记录导出。
- [检查证据](docs/evidence/)：历史版本各项核验，查看版本及具体范围后使用。

## 三个任务

| 任务 | 学到什么 | 代码 | 画面数据 |
|---|---|---|---|
| 分辨 CIFAR-10 图片 | 像素、卷积、ReLU、池化、损失、训练与泛化 | `scripts/train_cnn.py` | `public/experiments/cnn.json` 和对应样本 |
| 让平衡杆站住 | 状态/动作/奖励、Q 值、探索、回放、目标网络 | `scripts/train_dqn.py` | `public/experiments/dqn.json` |
| 提前比较落子后果 | 选择、扩展、模拟、回传、搜索预算 | `scripts/run_search.py` | `public/experiments/search.json` |

`public/experiments/v4/` 是卷积、代码更新、控制与逐次搜索等额外证据。`src/experiments.json` 是三个主 JSON 的聚合快照。`research/experiments/` 保留训练日志、测试预测和划分；`checkpoints/` 保存 3 个 CNN、12 个 DQN 小模型。画面读取数据，不在渲染时重新训练。

## 编辑与渲染

在仓库根目录恢复第一章素材：

```powershell
python tools/assets.py restore --source-root "<video_project目录>" --project chapters/01-vision-choice
Set-Location chapters/01-vision-choice
npm ci
npm run check
npm run studio
npm run stills
npm run render:intro
npm run render
```

Studio 选择 `ChapterV9-1080`。本次整理增加的 `scripts/render_current.mjs` 直接渲染当前完整 composition 与主音轨，输出到 `output/current/`；不依赖原来 patch 视频拼接链路。代表帧/90 秒开场/全片分别由 `stills`、`intro`、`full` 参数选择。需恢复字体、媒体、论文页及音轨后运行；本次整理没有重新导出长片。

`render_v9.mjs` / `render_v8.mjs` 是历史局部或无声渲染辅助，不是默认全片带声音的入口。`src/timeline-v9.json` 控制当前帧区间；`src/timeline.json` 保留原始教学片段，`anchors` 映射旧局部动画到新语音节奏，不应独立改动其中一侧。

## 结果边界

CNN 测试准确率均值约 59.94%；DQN 三种子平均回报 500/490.76/500，保留第二种子的失败；四子棋分别 59、60、60 胜/60 局，均针对随机对手。猫狗展示来自十分类模型。CartPole 不是 CNN 视觉输入。四子棋 MCTS 没有 AlphaGo 网络；2016 AlphaGo 与 2017 Zero 的论文机制另行解释。

## 修改建议

先确定要讲的实际目标，再修改对应口播与动作。柱状图使用连续插值，卷积和池化显示真实响应，棋盘与搜索树共享实际落子。保持常驻 rainbow鱼 Logo、字幕/来源安全区和低密度画面。完整规范见 [共享 Skill](../../shared/skills/rainbow-cinematic-video/SKILL.md)。
