# 六章工程维护

## 当前版本的唯一入口

`series.json` 记录版本、状态、帧数和 composition。总览是 V11；第一章是 V9 分类引言修正版，使用 V8 命名的已核验完整音轨。文件名不同版本可以是正常依赖关系。`docs/evidence/` 保存当时的检查，不等于本次重新运行了所有检查。

## 制作下一章

1. 阅读该章 `README.md` 与 `docs/plan.md`，确定一个观众能理解的具体目标，先描述要完成什么，再介绍完成目标所需的方法。
2. 从 `shared/templates/chapter/` 复制任务单、镜头表和来源模板到该章。更新 `chapter.json` 与根 `series.json`，状态从 `planned` 改为 `researching`，不得提前填写实验指标。
3. 建立 `research/upstream/`，保存原论文/官方入口、仓库 commit、许可证和下载摘要。实验脚本只写本章目录或独立 `runs/`。
4. 先实跑，保留配置、种子、原始结果和失败案例，再写与结果一致的口播。别用其他章的数字当临时成功数据。
5. 建立 `public/experiments/` 的只读数据接口。渲染只回放这些数据，不在每帧重新抽样、训练或调用 API。
6. 使用 Remotion 独立 `package.json`、锁文件、`src/Root.tsx`、`src/index.ts` 和帧时间线。初始依赖可参考第一章，但不要复制其音轨、时间线和实验内容冒充新章节。
7. 先做开场、实验、代码、论文等代表镜头。沿用 shared Skill 中颜色、字体、Logo、安全区、连续运动和口播标准。
8. 语音先按完整句自然合成，实测时长后锁定字幕与动作锚点。修改旁白不得只替换音轨而沿用错误的动作时间。
9. 锁定无字首尾帧后再做生成转场，记录任务 ID、模型、估算/实际费用与候选选择。没有本章授权预算时不从旧章预算推断可花费金额。
10. 1080p 全片检查通过后提交源码与文档，保留对应素材备份。用户确认后才做新版 4K。

## 文件命名与数据边界

| 路径 | 放什么 | 不放什么 |
|---|---|---|
| src/ | 帧驱动动画、场景、版本化时间线 | 密钥、实时训练 |
| scripts/ | 本章可执行工具及依赖说明 | 静默改写其他章节的脚本 |
| research/experiments/ | 原始结果、配置、split、逐步记录 | 覆盖旧结果而不留说明 |
| public/experiments/ | 经过核验、渲染可读的派生数据 | 人工伪造成功曲线 |
| checkpoints/ | 可复现实验必要的小型权重 | 巨型基础模型 |
| supplements/ | 当前字幕、口播、镜头索引、观众说明 | 私人参考声音 |
| docs/evidence/ | 标明版本和范围的检查报告 | 未执行的“已通过”清单 |
| output/ | 本地预览、缓存和导出 | Git 源码资产 |

新运行写 `runs/<实验>-<日期>-<配置>/`。审核后明确挑选要发布的数据并记录差异；当前第一章 `src/experiments.json` 是 `public/experiments/{cnn,dqn,search}.json` 的聚合，更新时需要同步，不能只改其中一份。v4 的逐步证据是单独采集的记录，不由替换聚合文件自动再生。

## 修改后检查

```powershell
python tools/check_repository.py
python tools/check_evidence.py
Set-Location overview
npm run check
Set-Location ../chapters/01-vision-choice
npm run check
```

再根据修改范围执行代表帧/片段渲染、语音复听、完整解码或实验重载。类型检查不检查外部素材是否存在，不证明字幕无遮挡，更不证明动作与讲解一致。

镜头检查重点：口播说到对象时必须可见；矩阵、柱状图、棋盘保持对象身份，用位置/长度插值，少用反复淡入淡出；接缝两侧主体、曝光和运动方向连续；字幕短句化并预留第二行安全区；论文是真实 PDF 页且重点清晰。

## Git 工作方式

建议分支 `chapter/02-generation` 或 `fix/ch01-caption-sync`，一次提交围绕一个可验证修改。提交前运行检查并看 `git diff --stat` 与 `git status`，确认没把 output、缓存、密钥或数据集带入。

发布版本时更新 `series.json`、本章 README、检查范围与素材清单。为可回退版本建立 tag，保持旧版本引用所需的素材；不能只删掉看起来“版本低”的代码。当前仓库首次导入仅保存现状，不伪造原项目的提交历史。
