# 第三方内容与改动说明

| 来源 | 仓库中的位置 | 说明 |
|---|---|---|
| PyTorch Tutorials | `chapters/01-vision-choice/research/upstream/` | 保存 CNN/DQN 教程及 `pytorch-LICENSE`；commit 见 research/sources.json |
| DeepMind OpenSpiel | 同上 | 保存 mcts.py、connect_four.cc、`spiel-LICENSE`；原文件遵守上游许可 |
| CIFAR-10 / Alex Krizhevsky 等 | 样本图、训练证据与镜像来源 | 完整数据不上传；研究使用须按数据来源条款，图像不视为原创资产 |
| Gymnasium / Farama Foundation | Python 依赖 | 按指定发行版的许可证；本仓库保存状态轨迹而非完整依赖源码 |
| Remotion / React 等 | 各项目 package-lock.json | 依赖各自许可证；Remotion 的许可适用条件需按使用场景确认 |
| 中文字体 | `public/fonts/` 中的许可文件 | 字体二进制外部恢复，禁止漏掉对应许可 |
| LeNet、AlexNet、DQN、AlphaGo、Zero 及总览其他论文 | 各项目 research/sources.json、docs/参考文献 | 版权归作者/出版方；论文 PDF 和大图外部管理，引用不等于取得任意再分发许可 |
| 官方视频及生成素材 | 来源/处理台账，assets/manifest.json | 真实演示、机制重构、生成概念镜头区分；遵守原平台许可 |

本章在教程基础上增加多种子训练、固定数据划分、独立评估、checkpoint 保存和可视化证据导出；搜索实验增加预算对比、交换先手和轨迹记录。改动代码与原始上游分开放置，没有声称上游作者验证过本片结果。

未经核实的媒体许可不得以“重绘”规避；公开视频前按来源台账逐项确认使用范围。API 凭据、私人声音参考及服务器信息不属于补充材料。
