# AI 技术日报 🤖

自动搜集和发布 OpenClaw 和 Claude Code 技术干货的网站。

**在线访问：** [https://你的用户名.github.io/tech-daily-web](https://你的用户名.github.io/tech-daily-web)

**更新频率：** 每天 12:00 和 18:00 自动更新

---

## 📁 项目结构

```
tech-daily-web/
├── src/                    # 网站文件（部署到 GitHub Pages）
│   ├── index.html         # 首页
│   ├── styles.css         # 样式
│   └── script.js          # 交互逻辑
├── content/                # 文案数据
│   ├── openclaw-posts.json
│   └── claude-code-posts.json
├── scripts/                # 自动化脚本
│   └── fetch-content.js   # 文案搜集脚本
├── .github/
│   └── workflows/
│       └── auto-update.yml # GitHub Actions 定时任务
└── README.md
```

---

## 🚀 快速部署

### 步骤 1：创建 GitHub 仓库

1. 登录 GitHub
2. 点击 **New repository**
3. 仓库名：`tech-daily-web`（或其他你喜欢的名字）
4. 设为 **Public**（GitHub Pages 需要）
5. 先不要初始化（不要勾选 README/.gitignore）
6. 点击 **Create repository**

### 步骤 2：推送代码到 GitHub

在你的项目目录执行：

```bash
cd C:\Users\8da\.openclaw\workspace\tech-daily-web

# 初始化 Git
git init

# 添加所有文件
git add .

# 提交
git commit -m "🎉 初始提交：AI 技术日报网站"

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/tech-daily-web.git

# 推送
git branch -M main
git push -u origin main
```

### 步骤 3：配置 API 密钥

1. 在 GitHub 仓库页面，点击 **Settings**
2. 左侧菜单选择 **Secrets and variables** → **Actions**
3. 点击 **New repository secret**
4. 添加以下密钥：

| Name | Value |
|------|-------|
| `TAVILY_API_KEY` | 你的 Tavily API 密钥（https://tavily.com） |

### 步骤 4：启用 GitHub Pages

1. 在 GitHub 仓库页面，点击 **Settings**
2. 左侧菜单选择 **Pages**
3. **Source** 选择：Deploy from a branch
4. **Branch** 选择：`gh-pages` / `(root)`
5. 点击 **Save**

等待 2-3 分钟，你的网站就会上线！

**访问地址：** `https://你的用户名.github.io/tech-daily-web`

---

## ⚙️ 自动化配置

### 定时任务

GitHub Actions 已配置为每天自动运行：
- **12:00 (UTC+8)** - 午间更新
- **18:00 (UTC+8)** - 晚间更新

### 手动触发

如果想立即更新内容：

1. 在 GitHub 仓库页面，点击 **Actions**
2. 选择 **Auto Update Content** 工作流
3. 点击 **Run workflow**
4. 选择分支（main），点击 **Run workflow**

### 修改更新时间

编辑 `.github/workflows/auto-update.yml`：

```yaml
on:
  schedule:
    #  cron 表达式（UTC 时间）
    # 北京时间 = UTC + 8
    - cron: '0 4 * * *'   # 12:00 北京时间
    - cron: '0 10 * * *'  # 18:00 北京时间
```

---

## 📝 本地开发

### 安装依赖

```bash
cd tech-daily-web
npm install
```

### 手动搜集文案

```bash
# 搜集所有内容
npm run fetch

# 只搜集 OpenClaw
npm run fetch:openclaw

# 只搜集 Claude Code
npm run fetch:claude-code
```

### 本地预览

```bash
npm run serve
```

然后在浏览器打开：http://localhost:8080

---

## 🔧 自定义配置

### 修改网站标题

编辑 `src/index.html`：

```html
<h1>🤖 AI 技术日报</h1>
<p class="subtitle">OpenClaw × Claude Code 技术干货</p>
```

### 修改主题颜色

编辑 `src/styles.css`：

```css
body {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### 添加新的内容分类

1. 在 `scripts/fetch-content.js` 添加新的查询：

```javascript
const SEARCH_QUERIES = {
    openclaw: [...],
    'claude-code': [...],
    'new-category': ['query1', 'query2']  // 新增
};
```

2. 创建对应的 JSON 文件：`content/new-category-posts.json`

3. 在 `src/script.js` 添加筛选按钮

---

## 📊 数据格式

每篇文章的 JSON 格式：

```json
{
  "id": "oc-001",
  "title": "文章标题",
  "content": "文章内容（支持 Markdown）",
  "excerpt": "文章摘要",
  "date": "2026-03-04T12:00:00+08:00",
  "readTime": "2 分钟",
  "tags": ["标签 1", "标签 2"],
  "source": "来源 URL"
}
```

---

## 🛠️ 故障排查

### 网站无法访问

1. 检查 GitHub Pages 是否启用
2. 确认 `gh-pages` 分支存在
3. 等待 2-3 分钟让 GitHub 部署

### 内容未更新

1. 检查 **Actions** 页面查看工作流状态
2. 确认 `TAVILY_API_KEY` 已正确配置
3. 查看工作流日志排查错误

### Tavily API 配额不足

1. 登录 https://tavily.com 查看配额
2. 升级套餐或减少搜索频率
3. 或者使用示例内容（不配置 API 时会使用）

---

## 📄 许可证

MIT License

---

## 🙏 致谢

- [OpenClaw](https://github.com/openclaw/openclaw) - AI 代理框架
- [Claude Code](https://github.com/anthropics/claude-code) - AI 编程助手
- [Tavily](https://tavily.com) - AI 搜索 API

---

**最后更新：** 2026-03-04
