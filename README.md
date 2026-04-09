# Auto CRUD Copilot

[English](./README_EN.md) | 简体中文

![Auto CRUD Copilot Banner](https://github.com/user-attachments/assets/e168ef33-7616-434c-91e6-e2c9eef017c0)


[![NPM Version](https://img.shields.io/npm/v/@yorha2b-lab/autodev.svg?style=flat-square)](https://www.npmjs.com/package/@yorha2b-lab/autodev)
[![NPM Downloads](https://img.shields.io/npm/dm/@yorha2b-lab/autodev.svg?style=flat-square)](https://www.npmjs.com/package/@yorha2b-lab/autodev)
[![GitHub Stars](https://img.shields.io/github/stars/yorha2b-lab/auto-crud-copilot.svg?style=flat-square)](https://github.com/yorha2b-lab/auto-crud-copilot/stargazers)
[![License](https://img.shields.io/npm/l/@yorha2b-lab/autodev.svg?style=flat-square)](https://github.com/yorha2b-lab/auto-crud-copilot/blob/main/LICENSE)

基于视觉大模型的前端(React+Antd)全自动 CRUD 代码生成器 🚀

![Auto CRUD Copilot 2.0 Demo](https://github.com/user-attachments/assets/cb46f2de-d533-4df1-a1ac-2092680aecd7)

## 💡 为什么选择 2.0 版本？
在 2.0 时代，我们放弃了繁琐的分散指令，全面进化为 “全频道集成指挥中心”
- 全频道联动：不再需要开启多个进程。一个 watch 指令，同时监听 页面、组件、API 三大传感器。
- 语义化骇入：不仅仅是复刻 UI，通过 9S 专用语义桥接协议，自动抹平前后端字段差异。
- 工程级质量：生成的代码不是“演示用”，而是带 useTableQuery、EditableCell、OSS上传 等实战逻辑的高质量代码。

## ✨ 特性

- 🖼️ 视觉构筑 (Page): 截图丢入 screenShot，Pod 042 自动生成带 Table/Form/Tabs 的完整 CRUD 页面。
- 🧩 碎片提取 (Part): 局部截图丢入 screenPart，终端瞬间弹出“即插即用”的 UI 配置片段。
- 🔌 语义对齐 (API): 接口 JSON 丢入 response，自动修正前端字段名，达成前后端 100% 协议一致。
- 🔧 智能装配: 自动补全 import 语句，处理日期格式转换、金额千分位、上传授权等所有脏活累活。
- 📱 **响应式**: 生成的代码支持响应式布局

## 🚀 快速开始

### 安装

```bash
npm install -g @yorha2b-lab/autodev
```

### 环境配置

```bash
autodev init
```

> ### 💡 零配置快速体验 (模拟模式)
> 项目默认开启 Demo 模式：
> 1. **无需配置 API_KEY**，直接运行 `autodev watch`。
> 2. 向 `screenShot` 目录丢入任意图片（系统将忽略图片内容，自动空投标准 `example.json` 构筑包）。
> 3. **观察效果**：你会看到命令行刷刷闪过，React 代码瞬间物理装配完成。
> *注：若想识别真实截图，请在 `config.js` 中将 `useDemo` 设为 `false` 并配置下方环境变量。*

创建 `.env` 文件并配置以下环境变量：

```bash
# AI模型API配置
API_KEY=your_api_key_here
BASE_URL=your_api_base_url_here
```

🚗 **获取API Key直通车**: [阿里云百炼控制台](https://bailian.console.aliyun.com/cn-beijing?tab=doc#/doc/)

### 📖 指挥中心操作指南 (v2.0 工作流)
进入 2.0 时代，你只需要记住一个指令：

```bash
autodev watch
```
启动后，地堡系统将进入 全频道联动监听状态：

| 动作 | 目标目录 | 构筑效果 |
| :--- | :--- | :--- |
| **全页截图** | `./screenShot` | 自动生成 `index.js`、`resource.js` 并同步路由配置 |
| **局部截图** | `./screenPart` | 终端实时打印代码片段 (随拷随用) |
| **接口 JSON** | `./response` | 自动执行语义对齐，修正 `resource.js` 中的字段名 |

## 📁 2.0 地堡结构说明

```
your-project/
├── screenShot/          # 页面截图目录
├── screenPart/          # 组件截图目录
├── response/            # Response目录
├── mock/                # 生成的Mock数据
├── src/
│   ├── pages/           # 生成的页面代码
│   ├── components/      # 生成的组件代码
│   ├── hooks/           # 生成的Hook代码
└── config.js            # 配置文件
```

## ⚙️ 配置

在 `config.js` 中可以配置以下选项：

```javascript
module.exports = {
    // 是否使用演示模式
    useDemo: true,
    // 是否需要生成 Mock 数据
    needMock: false,
    // 使用的 AI 模型类型
    visionModel: 'qwen3.5-plus',
    textModel: 'qwen-turbo',
    // 自定义模板目录
    // 如果为空，将使用内置模板
    // 自定义模板需要在hbsdir目录创建自己的index.hbs和resource.hbs文件
    hbsDir: '',
    // 目标项目的目录路径
    hooksDir: 'src/hooks',
    pagesDir: 'src/pages',
    utilsDir: 'src/utils',
    componentsDir: 'src/components',
}
```

## 🤝 贡献

欢迎贡献代码！请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解如何参与项目开发。

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证。

## 🙏 致谢

感谢以下开源项目为地堡提供核心动力：
- [OpenAI](https://openai.com/) / [Alibaba Qwen](https://tongyi.aliyun.com/) - 强大的 AI 视觉与语言能力
- [Ant Design](https://ant.design/) - 优秀的企业级 UI 组件库
- [Handlebars](https://handlebarsjs.com/) / [Chokidar](https://github.com/paulmillr/chokidar) - 稳定的构筑引擎与监听机制

## 📞 联系方式

如有问题或建议，欢迎提交 [Issue](https://github.com/yorha2b-lab/auto-crud-copilot/issues)。

## 🛠️ 常见问题 (FAQ)
Q: 这个工具收费吗？
A: 工具本身开源免费，但调用的 AI 模型（如 GPT-4v, Qwen-VL）可能需要你配置自己的 API Key。建议使用阿里云 Qwen-VL 等高性价比模型。

Q: 如何自定义生成的代码风格？
A: 你可以配置 hbsDir 指向你自己的 Handlebars 模板目录，打造专属的地堡构筑规范。

---

## ⚖️ Disclaimer

Auto CRUD Copilot is a **fan-made, non-commercial, open-source tool**.

- The themes, names (YoRHa, 2B, etc.), and catchphrases included in this project are inspired by **NieR:Automata**, which is a trademark and copyright of **Square Enix Co., Ltd. / PlatinumGames Inc.**
- This project is not affiliated with, endorsed by, or representative of Square Enix in any way.
- Please support the original masterpiece: [NieR:Automata Official Site](https://nierautomata.square-enix-games.com/).

**Glory to Mankind.**

⭐ 如果这个项目对你有帮助，请给个Star支持一下！
