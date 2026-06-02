# 数据库笔记

这是一个按课程讲次整理的数据库文档站，目标是把 PPT 内容沉淀成可复习、可检索、可持续扩展的笔记。

## 当前内容

- Lecture 2：SQL(1)
- Lecture 3：ER Model
- Lecture 5：Storage
- Lecture 5：思维导图
- Lecture 6：Tree Indices
- Lecture 8：Query Processing
- Lecture 8：思维导图

## 使用方式

### 阅读

- 从顶部导航按讲次进入
- 先看详细笔记，再看思维导图做整体串联
- 遇到公式页，站内会直接渲染数学表达式

### 新增笔记

1. 在 `docs/notes/` 下新建一个 Markdown 文件
2. 按现有结构整理 PPT 内容
3. 在 `mkdocs.yml` 的 `nav` 中加入入口
4. 运行 `mkdocs serve` 本地预览

### 常用命令

```bash
pip install -r requirements.txt
mkdocs serve
mkdocs build --strict
```

## 目录约定

- `docs/`：站点正文
- `docs/notes/`：课程笔记
- `docs/assets/`：图片、样式、脚本
- `site/`：构建产物

## GitHub Pages

站点已经包含 GitHub Pages 的自动部署工作流：

- 推送到 `main` 分支后会自动构建
- GitHub 仓库开启 Pages 后即可在线访问

如果后面你继续给我 PPT，我就按现在这套结构直接往里补。
