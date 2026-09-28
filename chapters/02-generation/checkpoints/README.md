# 第二章小模型权重

8 个 `.pt` 文件合计 4,223,506 字节，均为实际训练保存的 PyTorch checkpoint。

| 文件 | 训练记录 | 内容 |
|---|---|---|
| `gan-v5-{12,25,2003}.pt` | 二维 GAN，各 6,000 步 | 生成器、判别器 state_dict，seed，steps |
| `ddpm-v5-{12,25,2003}.pt` | 二维 DDPM，各 6,000 步 | 去噪网络 state_dict，β 日程，seed，steps |
| `digits-gan-42.pt` | MNIST GAN，3,000 步 | 生成器、判别器 state_dict，steps |
| `digits-ddpm-42.pt` | MNIST DDPM，3,000 步 | TinyUNet state_dict，β 日程，steps |

历史数字 checkpoint 内没有 seed 字段，其种子由同批 `results/digits.json` 和原始脚本核实。模型架构见 `experiments/`；加载时使用 `torch.load(..., map_location="cpu", weights_only=True)`，深度检查会核对架构和步数并实际采样。

这些文件没有优化器状态，不是完整断点续训包，也不包含写实角色生成模型。文件 SHA-256 见 [`artifact-manifest.json`](../results/artifact-manifest.json)，使用范围遵循仓库[权利说明](../../../LICENSE.md)。
