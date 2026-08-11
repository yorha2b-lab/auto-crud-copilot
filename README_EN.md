# AutoDev (YoRHa Bunker Engine v6.0)

English | [简体中文](./README.md)

![Auto CRUD Copilot Banner](https://github.com/user-attachments/assets/e168ef33-7616-434c-91e6-e2c9eef017c0)

[![NPM Version](https://img.shields.io/npm/v/@yorha2b-lab/autodev.svg?style=flat-square&logo=npm&logoColor=white)](https://www.npmjs.com/package/@yorha2b-lab/autodev)
[![NPM Downloads](https://img.shields.io/npm/dm/@yorha2b-lab/autodev.svg?style=flat-square&logo=npm&logoColor=white)](https://www.npmjs.com/package/@yorha2b-lab/autodev)
[![GitHub Stars](https://img.shields.io/github/stars/yorha2b-lab/autodev.svg?style=flat-square&logo=github&logoColor=white)](https://github.com/yorha2b-lab/autodev/stargazers)
[![License](https://img.shields.io/npm/l/@yorha2b-lab/autodev.svg?style=flat-square&logo=gnu&logoColor=white)](https://github.com/yorha2b-lab/autodev/blob/main/LICENSE)
![Total Clones](https://img.shields.io/badge/dynamic/json?query=total_clones&url=https%3A%2F%2Fraw.githubusercontent.com%2Fyorha2b-lab%2Fautodev%2Fgithub-repo-stats%2Fbunker-stats.json&label=Total%20Clones&color=33cc33&style=flat-square&logo=github&logoColor=white)

AI Vision and Semantic Protocol-based Frontend (React + Ant Design) Code Construction and Legacy System Refactoring Engine 🚀

![Auto CRUD Copilot 2.0 Demo](https://github.com/user-attachments/assets/287d0db1-d0b0-4290-87da-751ba638655e)

## 🌟 v6.0 Bunker Architecture Upgrade

In the v6.0 era, AutoDev has fully upgraded to a modular Bunker architecture. Centered around Headquarters, it accomplishes monitoring, dispatching, construction, and external communication through independent units.
- 🕵️ **Legacy System Recon (Scout)**: Puppeteer headless scout unit. Simply **[Right-Click]** anywhere on legacy web pages to capture instant snapshots and auto-refactor!
- 🗼 **Live Proxy Tower (Tower)**: Tactical proxy server on port 42153. Proxies live XHR/Fetch traffic and automatically hot-loads real production data into `resource.js`.
- 🏛️ **OpenAPI Council (Council)**: Auto-connects Swagger/OpenAPI docs, automatically extracts enum information, and updates `BUNKER_API_ANCHOR` semantic anchors.

## ✨ Features

- 🖼️ **Full-Page Construction (Page)**: Drop a screenshot into `./bunker/screenShot`, and Pod 042 auto-generates complete CRUD pages with Table/Form/Tabs and appends menus.
- 🧩 **Fragment Extraction (Part)**: Drop a partial screenshot into `./bunker/screenPart`, and the terminal instantly outputs plug-and-play UI config code blocks.
- 🕵️ **Right-Click Archeology (Scout)**: Puppeteer headless browser inspection. Right-click anywhere in the browser to capture and refactor pages in seconds.
- 🔌 **Semantic Alignment (API)**: Drop an API JSON into `./bunker/response` to automatically discover and fix frontend/backend field semantic differences, reducing manual alignment work.
- 🔧 **Smart Assembly**: Auto-completes import statements, date format conversions, currency separators, enum dictionaries, and OSS upload logic.

## 🚀 Quick Start

### Installation

```bash
npm install -g @yorha2b-lab/autodev
```

### Environment Configuration & Initialization

Run the following in your target project root directory:

```bash
bunker init
```

> **💡 Zero-Config Demo Mode**
> Demo mode is enabled by default:
> 1. No `API_KEY` required, run `bunker boot` directly.
> 2. Drop any image into `./bunker/screenShot` (system ignores image content and drops standard `example.json` construction package).
> 3. To recognize real screenshots, set `useDemo: false` in `bunker/config.js` and configure `.env`.

Create a `.env` file and configure environment variables:

```bash
# AI Model API Configuration
API_KEY=your_api_key_here
BASE_URL=your_api_base_url_here
```

🚗 **Get API Key**: [Alibaba Cloud Bailian Console](https://bailian.console.aliyun.com/)

## 📖 Command Center Operations Guide (v6.0 Workflow)

Start the main monitoring network:

```bash
bunker boot
```

Upon launch, the Bunker system enters all-channel monitoring mode:

| Tactical Action | Sensor / Target | Construction Output |
| :--- | :--- | :--- |
| **Full Page** | `./bunker/screenShot` | Auto-generates `index.js`, `resource.js`, and syncs `menus.js` |
| **Fragment** | `./bunker/screenPart` | Terminal outputs copy-pasteable UI code snippets in real-time |
| **Archeology** | Browser [Right-Click] | Triggers `scout.js` unit to capture and refactor current page |
| **API Alignment** | `./bunker/response` | Auto-aligns semantics and fixes field names in `resource.js` |

## 📁 Bunker Architecture Overview

```text
your-project/
├── bunker/              # Bunker sensors and configuration
│   ├── config.js        # Bunker configuration file
│   ├── screenShot/      # Full-page screenshot receiver
│   ├── screenPart/      # UI fragment receiver
│   └── response/        # Response alignment receiver
├── mock/                # Auto-generated Mock data
└── src/
    ├── pages/           # Auto-built frontend page code
    └── utils/
        └── menus.js     # Auto-synced dynamic menu configuration
```

## ⚙️ Configuration

Set the following options in `bunker/config.js`:

```javascript
module.exports = {
    // Enable demo mode
    useDemo: true,
    // Enable Mock data generation
    needMock: false,

    // Bunker Black-Tech Toggles:
    // Enable 42153 Tactical Proxy Tower (Live traffic interception & alignment)
    enableAutoAlignment: false,
    // Enable GitHub clone counter easter egg
    fetchClone: true,

    // AI Model Configuration
    textModel: 'qwen-turbo',
    visionModel: 'qwen3.7-plus',

    // 🕸️ Archeology & Alignment Configuration
    // 1. Legacy project URL (auto-launches Scout right-click archeology unit)
    remains: 'http://localhost:8000',
    // 2. Company Swagger / OpenAPI JSON URL
    apiDoc: 'http://api.company.com/v2/api-docs',
    // 3. Backend proxy target URL (Tower forwarding target)
    proxyTarget: 'http://backend.company.com',
    // 4. Backend API success assertion expression
    responseSuccess: `response?.code === 200`,

    // Frontend source code build paths
    pagesDir: 'src/pages',
    componentsDir: 'src/components',
    hooksDir: 'src/hooks',
    utilsDir: 'src/utils',

    // Custom Handlebars template directory (leave empty to use built-in templates)
    hbsDir: '',
}
```

## 🤝 Contributing & CLA

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.
All Pull Requests require automated signing of the [CLA Agreement](CLA.md) prior to merging.

## 📄 License

This project is licensed under [GNU AGPL v3.0](LICENSE).

## 🙏 Acknowledgments

Special thanks to the following open-source projects for powering the Bunker engine:
- [OpenAI](https://openai.com/) / [Alibaba Qwen](https://tongyi.aliyun.com/) - Advanced AI Vision & Language capabilities
- [Ant Design](https://ant.design/) - Enterprise-grade UI component library
- [Handlebars](https://handlebarsjs.com/) / [Chokidar](https://github.com/paulmillr/chokidar) / [Puppeteer](https://pptr.dev/) - Reliable construction and scouting engines

## 📞 Contact

If you have questions or suggestions, please submit an [Issue](https://github.com/yorha2b-lab/autodev/issues).

## 🛠️ FAQ

Q: Is this tool free?
A: The tool itself is open-source and free, but calling AI models (e.g., Qwen-VL, GPT-4v) requires your own API Key. Alibaba Cloud Qwen-VL is recommended for high cost-performance.

Q: How do I customize generated code styles?
A: Set `hbsDir` to point to your custom Handlebars templates directory to build team-specific code construction standards.

---

## ⚖️ Disclaimer

AutoDev is a **fan-made, non-commercial, open-source tool**.

- The themes, names (YoRHa, 2B, 9S, Pod042, etc.), and catchphrases included in this project are inspired by **NieR:Automata**, which is a trademark and copyright of **Square Enix Co., Ltd. / PlatinumGames Inc.**
- This project is not affiliated with, endorsed by, or representative of Square Enix in any way.
- Please support the original masterpiece: [NieR:Automata Official Site](https://nierautomata.square-enix-games.com/).

**Glory to Mankind.** 🤖⚔️