# 第一章：真实实验复现

本页命令从仓库根目录执行。随仓库保存的是已完成运行的证据；重新训练是单独操作。硬件、浮点实现和库版本会影响数值与耗时，尤其不能承诺每次强化学习训练都得到相同成绩。

## 环境

推荐独立 Python 3.12 环境。依赖见 `chapters/01-vision-choice/requirements-experiments.txt`；原始整机环境记录在该章 `docs/environment.txt`，它包括制作工具，不是最小安装列表。

```powershell
py -3.12 -m venv .venv-experiments
.\.venv-experiments\Scripts\Activate.ps1
python -m pip install -r chapters/01-vision-choice/requirements-experiments.txt
python -c "import torch,gymnasium,pyspiel; print(torch.__version__,torch.cuda.is_available())"
```

先按 PyTorch 官方安装说明选择适合机器的 CUDA wheel；CPU 也能训练但会更慢。不要覆盖 TTS 或 Manim 的现有环境。OpenSpiel 优先 WSL/Linux；若平台不能安装指定版本，不应悄悄替换规则实现并沿用原实验名称。

## A. CIFAR-10 图像分类

```powershell
python tools/fetch_cifar10.py --output-dir runs/datasets/cifar10
python tools/run_experiment.py cnn --dataset-dir runs/datasets/cifar10 --run-dir runs/cnn-001
```

下载器读取已保存镜像来源并核对 SHA-256。原始训练集 50,000 张，用划分种子 2026 固定拆成 45,000/5,000；10,000 张测试图仅用于最终评估。镜像仍是官方 CIFAR-10 划分，不使用之前未下载完整的 tar。

网络为 `Conv(3→6,k5) → ReLU → MaxPool(2) → Conv(6→16,k5) → ReLU → MaxPool(2) → 400→120→84→10`。种子 17/42/2026，各 20 epochs；SGD lr 0.001、momentum 0.9、batch 64。根据验证损失选 checkpoint，选中 epoch 为 20/19/20。

结果保存在新运行的 `research/experiments/cnn/`、`checkpoints/` 与 `public/experiments/`。测试准确率原记录 59.42%、60.84%、59.57%；均值 59.94%，样本标准差约 0.78 个百分点。

画面示例固定使用 seed 17，选择首个正确/错误猫狗和最低最大概率样本；不是代表性随机样本。卷积特征通道独立归一化仅为显示，不能比较不同通道绝对亮度。遮挡归一化输入置零对应原图中性灰；仅解释这次输出变化。

## B. CartPole 深度强化学习

```powershell
python tools/run_experiment.py dqn --run-dir runs/dqn-001
```

Gymnasium `CartPole-v1` 的输入是位置、速度、杆角度、角速度四个值。网络 4→128→128→2；AdamW 3e-4、AMSGrad、batch 128、gamma 0.99、tau 0.005、回放 10,000。epsilon 从 0.9 降到 0.01，指数尺度为 2,500 个交互步。

三个种子各训练 600 回合，保存 1/50/200/600 回合 checkpoint。评估使用独立环境种子 900000–900099，执行贪心策略，随机基线使用相同的评估种子。

原结果均值 500.00/490.76/500.00，第二种子标准差 39.11，100 回合中有 7 回合未达 500；随机策略平均 21.15。`terminated` 与时间上限 `truncated` 分开；只有真实终止取消未来价值项。

回放记录中的 `state` 位于动作前，`reward/terminated/truncated` 对应执行该动作后的结果。v4 增补证据包含末步 next-state，以免画面少播放最后一步。

## C. 四子棋搜索

```powershell
python tools/run_experiment.py search --run-dir runs/search-001
```

7 列×6 行；OpenSpiel Python MCTS 固定 commit，C++ 规则来自 pyspiel 2.0.2 wheel，不能说二者来自同一次编译。UCT 常数 sqrt(2)、随机 rollout 一次、solve=False。每步预算 64/256/1,024，各 30 组换先手对局，共 180 局。

随机对手种子 `3000+pair`，搜索种子 `8000+pair*2+side`。原记录胜/平/负 59/0/1、60/0/0、60/0/0；单局累计搜索平均耗时约 0.0525/0.2069/0.6975 秒，只代表原运行机器。

`moves` 为 0-based 列号；画面展示 1-based。基础搜索树是结束时快照；`public/experiments/v4/search-trace.json` 是另行采集的逐次搜索证据，不能用前者假装后者。该实验无策略/价值神经网络，AlphaGo / AlphaGo Zero 在片中依据论文另做机制解释。

## 证据复核与再发布

```powershell
python tools/check_evidence.py
```

轻量检查不需 PyTorch：核对三种子统计、概率、180 局的规则合法性、结果，以及聚合快照一致性。深度检查脚本 `chapters/01-vision-choice/scripts/check_experiments.py` 还会重载 checkpoint、重新推理 CNN、重放 DQN 并使用 pyspiel 验证棋谱；它需要 CUDA、完整测试 parquet 和所有实验依赖，不是默认 CI。其 CNN 最大概率误差阈值 1e-5 对应原 GPU 路径。

深度检查前用下载器将数据放到该章 `research/experiments/cnn/`；它会更新 `research/experiment-validation.json`，执行后审阅差异。不要把旧报告的通过时间当成本次重跑。

实验包装器要求全新/空运行目录，避免已有 `run-种子.json` 缓存被误当新结果。训练不会自动替换正片中的数据；审核结果、挑选示例和更新时间线是独立步骤。

## 锁定来源

- `pytorch/tutorials`: `65e2e1a1c1520a6ccb1adc7fb2a55ce78ccdc598`
- `google-deepmind/open_spiel`: `48401890ee9857e611678302371378175a8e4c6b`
- 原文件与许可证：`chapters/01-vision-choice/research/upstream/`
- 论文与下载摘要：`chapters/01-vision-choice/research/sources.json`
- 对原教程的改动：增加固定划分、多种子训练、独立评估、checkpoint/轨迹/可视化证据导出；MCTS 配置随机基线与不同搜索预算。版权和许可证仍按上游要求保留。
