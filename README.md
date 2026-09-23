# AI_revolution · AI 进化史

**rainbow鱼 的六章可视化科普系列：人工智能怎样发展、它怎样工作、我们能用它做什么。**

本仓库保存总览与第一章的可编辑工程、真实实验、补充材料及后续章节的维护规范。用同一条线索连接六种能力：**看见与选择 → 生成与创造 → 语言与多模态 → 空间与时间 → 推理与工具 → 预测与行动**。这是讲解顺序，不表示所有技术都是直接继承关系。

当前已整理 **总览 V11** 和 **第一章 V9 分类引言修正版**；第二至六章是明确标记的规划，尚无对应实验结果和成片。仓库不包含成片、大型素材、CIFAR-10 完整数据集、TTS 模型或私人声音参考。恢复素材后可以继续编辑和重渲染，单独运行实验不需要视频素材。

## 从哪里开始

| 你想做的事 | 入口 |
|---|---|
| 看六章内容与制作进度 | [系列登记表](series.json)、下方章节表 |
| 查看已完成的实验和结论 | [第一章](chapters/01-vision-choice/README.md)、[实验结果](chapters/01-vision-choice/docs/实验结果.md) |
| 自己训练 CNN、DQN 或运行搜索 | [复现实验指南](docs/REPRODUCIBILITY.md) |
| 修改总览 | [总览工程说明](overview/README.md) |
| 继续制作下一章 | [维护流程](docs/MAINTENANCE.md)、[章节模板](shared/templates/chapter/README.md) |
| 恢复外部音视频和论文页面 | [素材与恢复](docs/ASSETS.md) |
| 复用审美与制作经验 | [rainbow-cinematic-video Skill](shared/skills/rainbow-cinematic-video/SKILL.md) |
| 修改旁白与字幕 | [声音与同步](docs/AUDIO.md) |

## 六章目录

| 章节 | 具体问题与核心技术 | 当前状态 |
|---|---|---|
| [总览](overview/README.md) | 可视化拆解 AI 的发展、原理和用途；六章路线与论文汇总 | V11，192.90 秒，1080p 预览 |
| [01 看见与选择](chapters/01-vision-choice/README.md) | 图片怎样变成判断？小车怎样学会保持平衡？搜索怎样帮助落子？CNN、DQN、MCTS、AlphaGo / Zero | V9，约 33 分 38 秒，三个真实实验 |
| [02 从识别到创造](chapters/02-generation/README.md) | GAN 的对抗学习与扩散模型的逐步去噪 | 规划 |
| [03 语言连接万物](chapters/03-language-multimodal/README.md) | 注意力、语言建模、图文对齐、指令与偏好训练、多模态 | 规划 |
| [04 走进三维世界](chapters/04-space-time/README.md) | 从多视角照片到可绕行场景：NeRF、3DGS、4DGS | 规划 |
| [05 从回答到完成](chapters/05-reasoning-agents/README.md) | 推理、检索、代码工具、反馈与 Agent | 规划 |
| [06 预测，然后行动](chapters/06-world-action/README.md) | 世界模型、Diffusion Policy、VLA 与 Physical AI | 规划 |

## 文件结构

```text
AI_revolution/
├─ README.md                         # 本入口
├─ series.json                       # 六章、状态、当前版本和合成 ID
├─ overview/                         # 独立 Remotion 总览工程，当前 V11
│  ├─ src/                           # 时间线、场景、字幕、品牌
│  ├─ scripts/                       # V11 渲染、音频与检查入口
│  ├─ public/                        # 小型数据；大型素材由清单恢复
│  ├─ research/                      # 来源、论文页信息、处理记录
│  ├─ docs/                          # 目录、参考文献、历史制作说明
│  └─ supplements/                   # 当前字幕等随片材料
├─ chapters/
│  ├─ 01-vision-choice/
│  │  ├─ src/                       # 当前 V9，保留仍被引用的旧组件
│  │  ├─ scripts/                   # 三个实验、证据导出、渲染与声音
│  │  ├─ public/experiments/        # 图像、特征、指标、轨迹、搜索统计
│  │  ├─ research/experiments/      # 原始运行结果、划分、预测 NPZ
│  │  ├─ research/upstream/         # 锁定的上游代码与许可证
│  │  ├─ checkpoints/              # 小型 CNN / DQN 权重，随 Git 保存
│  │  ├─ manim/                    # 精确机制动画源码
│  │  ├─ docs/                     # 实验结果、来源、QA 与历史说明
│  │  └─ supplements/              # 从当前时间线导出的字幕与口播
│  └─ 02-…06-…/                    # 各章 README、chapter.json、制作计划
├─ shared/
│  ├─ skills/rainbow-cinematic-video/ # 视觉、叙事、实验、声音、连续性规范
│  └─ templates/chapter/            # 章节任务单、镜头表、来源与验收模板
├─ docs/                            # 跨章复现、维护、音频和素材指南
├─ assets/manifest.json             # 外部资产原路径、体积与 SHA-256
├─ tools/                           # 检查、下载、隔离实验、恢复、发布
└─ .github/workflows/check.yml       # JSON/Python/证据与两工程类型检查
```

`src` 中的 V5/V7/V8 等文件并不代表新的推荐入口：当前组件仍复用其类型、数据或布局。**以 `series.json` 和各章 README 为准**，不要按文件名最大的数字猜版本，也不要直接运行旧的流水线覆盖当前时间线。

## 快速开始

### 1. 只看资料和检查数据

安装 Git 和 Python 3.12+。以下命令在仓库根目录执行，不需要 GPU、付费 API 或大型素材：

```powershell
python tools/check_repository.py
python tools/check_evidence.py
```

检查包括源码语法、凭据模式、目录登记、概率分布、180 局棋谱合法性、记录与统计的一致性。它们验证现有证据结构，不等同于重新训练，也不能证明画面审美和发音自然。

### 2. 运行一个真实实验

新建隔离的 Python 3.12 环境；Windows 示例：

```powershell
py -3.12 -m venv .venv-experiments
.\.venv-experiments\Scripts\Activate.ps1
python -m pip install -r chapters/01-vision-choice/requirements-experiments.txt
python tools/run_experiment.py search --run-dir runs/search-001
```

Linux/macOS 激活方式为 `source .venv-experiments/bin/activate`。PyTorch 的 CPU/CUDA 安装方式与机器有关；OpenSpiel 若在 Windows 无合适 wheel，请使用 WSL/Linux。完整 CNN 数据下载、三种子训练、评估口径及版本限制见[复现指南](docs/REPRODUCIBILITY.md)。新结果写入 `runs/`，不覆盖成片使用的证据。

### 3. 编辑或渲染视频

需要 Node.js 22、npm，以及按[素材指南](docs/ASSETS.md)恢复的文件。音频制作和最终检查还需要 FFmpeg/ffprobe；只预览既有音轨不需要 TTS 模型。

```powershell
# 有原工程时，从包含两个原项目文件夹的 video_project 目录恢复：
python tools/assets.py restore --source-root "<原工程的 video_project 目录>" --project overview
Set-Location overview
npm ci
npm run check
npm run studio
# Studio 中选择 TrailerV11-1080
npm run stills
npm run render
```

第一章同样先恢复 `--project chapters/01-vision-choice`，再进入该章执行 `npm ci`、`npm run studio`；选择 `ChapterV9-1080`。`npm run render` 会渲染当前全片并带音轨；长片耗时取决于机器。源码检查不要求恢复大型素材，渲染则必须恢复。

## 第一章的实测结果

所有下列数值来自仓库保存的三次训练或对局记录，不是画面生成器编造的数据。

| 实验 | 设置 | 记录结果 |
|---|---|---|
| CNN / CIFAR-10 | 45,000 训练、5,000 验证、10,000 测试；种子 17/42/2026；20 epochs | 测试准确率 59.42%、60.84%、59.57%；均值 59.94%，样本标准差 0.78 个百分点 |
| DQN / CartPole-v1 | 每种子训练 600 回合；每模型独立 100 个固定评估种子 | 平均回报 500.00、490.76、500.00；随机基线 21.15；保留失败回合 |
| MCTS / 四子棋 | 每步 64/256/1,024 次搜索；各 30 组交换先手，共 60 局 | 胜/平/负：59/0/1、60/0/0、60/0/0；对手为随机策略 |

CNN 是十分类，片中猫狗案例并非另训二分类器。DQN 输入是四个状态数值，不是游戏截图。MCTS 使用随机 rollout，**没有复现 AlphaGo 的网络或棋力**。强化学习高回报不代表通用智能；随机对手的胜率不能推广到强对手。

## 资料、权利与复用

- 原论文及官方资料入口保留在各项目 `research/` 与 `docs/`；摘要、数据可视化和生成概念镜头的性质应区分。
- PyTorch Tutorials 和 OpenSpiel 固定到具体 commit，保留原代码和原许可证；二进制 pyspiel 版本另记。
- 原创工程当前没有附加开源授权；仓库可见性不代表放弃版权。第三方素材、Logo、声音与论文适用各自权利规则，见 [LICENSE.md](LICENSE.md) 和 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
- `.env.example` 只列变量名。不得上传 API Key、SSH 密码、私钥、私人声音参考或带签名的临时下载地址。

## 后续维护

每章独立依赖、时间线和产物，共享稳定规范，不共享可变实验状态。更改旁白时同步更新逐句帧区间、字幕和动作锚点；更改数据时保留旧结果并人工核验新结果后才接入渲染。所有新版先输出完整 1080p 预览，确认后再输出 4K。详细步骤见[维护指南](docs/MAINTENANCE.md)。

本次导入范围与检查结果见 [整理记录](docs/IMPORT_REPORT.md)。

首次上传可使用 `pwsh -File tools/publish_github.ps1`；支持现有 GitHub CLI 或系统 Git Credential Manager 登录，默认创建当前登录账号下的私有 `AI_revolution`。如需公开，完成第三方素材与隐私检查后使用 `-Public`。脚本不会覆盖已存在的同名仓库。
