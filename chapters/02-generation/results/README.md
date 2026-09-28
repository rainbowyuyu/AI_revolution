# 第二章实验产物

- `distributions-v5.json`：二维 GAN/DDPM，种子 12、25、2003，完整训练曲线、点样本、插值和采样轨迹。
- `experiment-summary-v5.json`：同一批二维实验的指标与耗时摘要。
- `digits.json`：MNIST 种子 42 的真实配置、训练损失、数据 SHA-256 与验证噪声 MSE。
- `digits/`：50 张历史数字实验网格图；`ddpm-t000.png` 是最终生成图。
- `artifact-manifest.json`：63 项原始文件在源项目和本章中的相对位置、大小与 SHA-256。清单不包括本说明与新核查报告。
- `verification-2026-09-29.json`：本次重新读取权重、复算统计及采样比对的结果，UTC 时间换算为北京时间是 2026-09-29。

训练命令写入仓库根目录的 `runs/`，不覆盖这里的历史记录。阅读[实验结果](../docs/实验结果.md)与[实验复现](../docs/实验复现.md)。
