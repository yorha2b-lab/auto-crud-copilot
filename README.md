# AutoDev (YoRHa Bunker Engine v6.0)

[English](./README_EN.md) | 简体中文

![Auto CRUD Copilot Banner](https://github.com/user-attachments/assets/e168ef33-7616-434c-91e6-e2c9eef017c0)

[![NPM Version](https://img.shields.io/npm/v/@yorha2b-lab/autodev.svg?style=flat-square&logo=npm&logoColor=white)](https://www.npmjs.com/package/@yorha2b-lab/autodev)
[![NPM Downloads](https://img.shields.io/npm/dm/@yorha2b-lab/autodev.svg?style=flat-square&logo=npm&logoColor=white)](https://www.npmjs.com/package/@yorha2b-lab/autodev)
[![GitHub Stars](https://img.shields.io/github/stars/yorha2b-lab/autodev.svg?style=flat-square&logo=github&logoColor=white)](https://github.com/yorha2b-lab/autodev/stargazers)
[![License](https://img.shields.io/npm/l/@yorha2b-lab/autodev.svg?style=flat-square&logo=gnu&logoColor=white)](https://github.com/yorha2b-lab/autodev/blob/main/LICENSE)
![Total Clones](https://img.shields.io/badge/dynamic/json?query=total_clones&url=https%3A%2F%2Fraw.githubusercontent.com%2Fyorha2b-lab%2Fautodev%2Fgithub-repo-stats%2Fbunker-stats.json&label=Total%20Clones&color=33cc33&style=flat-square&logo=github&logoColor=white)

基于 AI 视觉与语义协议的前端（React + Ant Design）代码构筑与旧系统重构引擎 🚀

![Auto CRUD Copilot 2.0 Demo](https://github.com/user-attachments/assets/287d0db1-d0b0-4290-87da-751ba638655e)

## 🌟 v6.0 地堡架构升级

在 v6.0 时代，AutoDev 全面升级为模块化地堡架构，以 Headquarters 为核心，通过独立单位完成监听、调度、构筑与外部通信。
- 🕵️ **旧系统侦察 (Scout)**：Puppeteer 无头侦察兵，在旧项目网页上**【单击右键】**即可秒级捕获快照并自动重构！
- 🗼 **现网防御塔 (Tower)**：搭建 42153 战术代理端口，代理真实 XHR/Fetch 流量，自动将现网数据反向填装入 `resource.js`。
- 🏛️ **议会自动通电 (Council)**：自动对接 OpenAPI/Swagger 文档，自动提炼枚举信息，并更新 `BUNKER_API_ANCHOR` 语义锚点。

## ✨ 特性

- 🖼️ **全页构筑 (Page)**: 截图丢入 `./bunker/screenShot`，Pod 042 自动生成带 Table/Form/Tabs 的完整 CRUD 页面并追加菜单。
- 🧩 **碎片提取 (Part)**: 局部截图丢入 `./bunker/screenPart`，终端瞬间弹出“即插即用”的 UI 配置代码块。
- 🕵️ **右键考古 (Scout)**: Puppeteer 无头浏览器巡检，网页任意处点击【鼠标右键】即可秒级一键捕获页面重构。
- 🔌 **语义对齐 (API)**: 接口 JSON 丢入 `./bunker/response`，自动发现并修正前后端字段语义差异，减少手工对齐工作。
- 🔧 **智能装配**: 自动补全 import 语句、日期格式转换、金额千分位、枚举字典以及 OSS 上传等实战逻辑。

## 🚀 快速开始

### 安装

```bash
npm install -g @yorha2b-lab/autodev
```

### 环境配置与初始化

在您的目标项目根目录下执行：

```bash
bunker init
```

> **💡 零配置演示模式 (Demo Mode)**
> 项目默认开启 Demo 模式：
> 1. 无需配置 API_KEY，直接运行 `bunker boot`。
> 2. 向 `./bunker/screenShot` 目录丢入任意图片（系统自动空投标准 `example.json` 构筑包）。
> 3. 若想识别真实代码/截图，请在 `bunker/config.js` 中将 `useDemo` 设为 `false` 并配置 `.env`。

创建 `.env` 文件并配置以下环境变量：

```bash
# AI模型API配置
API_KEY=your_api_key_here
BASE_URL=your_api_base_url_here
```

🚗 **获取API Key直通车**: [阿里云百炼控制台](https://bailian.console.aliyun.com/cn-beijing?tab=doc#/doc/)

## 📖 指挥中心操作指南 (v6.0 工作流)

启动主监控网络：

```bash
bunker boot
```

启动后，地堡系统将进入全频道联动监听状态：

| 战术操作 | 传感器/动作 | 构筑效果 |
| :--- | :--- | :--- |
| **全页构筑** | `./bunker/screenShot` | 自动生成 `index.js`、`resource.js` 并追加同步 `menus.js` |
| **碎片提取** | `./bunker/screenPart` | 终端实时弹出紫色代码框，即拷即用 |
| **右键考古** | 浏览器【鼠标右键】 | 触发 `scout.js` 侦察兵，一键捕获当前页面降维重构 |
| **接口 JSON** | `./bunker/response` | 自动执行语义对齐，修正 `resource.js` 中的字段名 |

## 📁 地堡结构说明

```text
your-project/
├── bunker/              # 地堡传感器与配置
│   ├── config.js        # 地堡配置文件
│   ├── screenShot/      # 全页截图接收站
│   ├── screenPart/      # 碎片截图接收站
│   └── response/        # 响应对齐接收站
├── mock/                # 自动伪造的 Mock 数据
└── src/
    ├── pages/           # 自动构建的前端页面代码
    └── utils/
        └── menus.js     # 自动同步的动态菜单配置
```

## ⚙️ 配置

在 `bunker/config.js` 中可以配置以下选项：

```javascript
module.exports = {
    // 是否开启 Demo 演示模式
    useDemo: true,
    // 是否自动伪造生成 Mock 数据
    needMock: false,

    // 地堡黑科技开关：
    // 是否开启 42153 战术代理塔 (现网流量劫持与对齐)
    enableAutoAlignment: false,
    // 是否开启 GitHub 克隆数彩蛋
    fetchClone: true,

    // AI 模型配置
    textModel: 'qwen-turbo',
    visionModel: 'qwen3.7-plus',

    // 🕸️ 遗迹与对齐配置 (考古与代理)
    // 1. 旧项目运行 URL (配置后自动启动 Scout 右键考古侦察兵)
    remains: 'http://localhost:8000',
    // 2. 公司 Swagger / OpenAPI JSON 文档地址
    apiDoc: 'http://api.company.com/v2/api-docs',
    // 3. 真实后端代理目标地址 (Tower 转发目标)
    proxyTarget: 'http://backend.company.com',
    // 4. 后端接口成功断言表达式
    responseSuccess: `response?.code === 200`,

    // 前端源码构建目录路径
    pagesDir: 'src/pages',
    componentsDir: 'src/components',
    hooksDir: 'src/hooks',
    utilsDir: 'src/utils',

    // 自定义 Handlebars 模板目录 (留空使用内置模版)
    hbsDir: '',
}
```

## 🤝 贡献与 CLA

欢迎贡献代码！请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解参与流程。
所有 Pull Request 在合并前需要自动化签署 [CLA 贡献者协议](CLA.md)。

## 📄 许可证

本项目采用 [GNU AGPL v3.0](LICENSE) 许可证。

## 🙏 致谢

感谢以下开源项目为地堡提供核心动力：
- [OpenAI](https://openai.com/) / [Alibaba Qwen](https://tongyi.aliyun.com/) - 强大的 AI 视觉与语言能力
- [Ant Design](https://ant.design/) - 优秀的企业级 UI 组件库
- [Handlebars](https://handlebarsjs.com/) / [Chokidar](https://github.com/paulmillr/chokidar) / [Puppeteer](https://pptr.dev/) - 稳定的构筑与侦察引擎

## 📞 联系方式

如有问题或建议，欢迎提交 [Issue](https://github.com/yorha2b-lab/autodev/issues)。

## 🛠️ 常见问题 (FAQ)

Q: 这个工具收费吗？
A: 工具本身开源免费，但调用的 AI 模型（如 Qwen-VL, GPT-4v）需要配置 API Key。建议使用阿里云通义千问等高性价比模型。

Q: 如何自定义生成的代码风格？
A: 您可以配置 `hbsDir` 指向您自己的 Handlebars 模板目录，打造专属的团队代码构建规范。

---

## ⚖️ Disclaimer

AutoDev is a **fan-made, non-commercial, open-source tool**.

- The themes, names (YoRHa, 2B, 9S, Pod042, etc.), and catchphrases included in this project are inspired by **NieR:Automata**, which is a trademark and copyright of **Square Enix Co., Ltd. / PlatinumGames Inc.**
- This project is not affiliated with, endorsed by, or representative of Square Enix in any way.
- Please support the original masterpiece: [NieR:Automata Official Site](https://nierautomata.square-enix-games.com/).

**Glory to Mankind.** 🤖⚔️