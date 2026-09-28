# 仓库工具

[← 系列首页](../README.md) · [共用维护说明](../shared/README.md)

这些工具服务整个仓库；具体实验和渲染步骤由各章文档维护。

| 工具 | 用途 | 操作入口 |
|---|---|---|
| `check_repository.py` | 源码、登记、文件体积、素材路径检查 | [维护流程](../shared/docs/MAINTENANCE.md) |
| `check_evidence.py` | 第一章保存证据核查 | [第一章实验](../chapters/01-vision-choice/docs/复现实验.md) |
| `fetch_cifar10.py`、`run_experiment.py` | 第一章数据下载与隔离实验 | 同上 |
| `assets.py`、`register_assets.py` | 总览/第一章的素材恢复与登记 | [总览工程](../overview/docs/视频工程.md)、[第一章工程](../chapters/01-vision-choice/docs/视频工程.md) |
| `export_supplements.py` | 总览/第一章字幕和讲稿导出 | 各章声音说明 |
| `publish_github.py`、`publish_github.ps1` | 首次创建仓库时使用已有登录 | 已有 origin 的仓库直接正常提交和推送，不重复创建 |

第二章实验检查及素材恢复工具位于[第二章内部](../chapters/02-generation/README.md)，与上面的第一章数据接口分开维护。
