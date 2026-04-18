# Auto CRUD Copilot

[简体中文](./README.md) | English

![Auto CRUD Copilot Banner](https://github.com/user-attachments/assets/e168ef33-7616-434c-91e6-e2c9eef017c0)


[![NPM Version](https://img.shields.io/npm/v/@yorha2b-lab/autodev.svg?style=flat-square&logo=npm&logoColor=white)](https://www.npmjs.com/package/@yorha2b-lab/autodev)
[![NPM Downloads](https://img.shields.io/npm/dm/@yorha2b-lab/autodev.svg?style=flat-square&logo=npm&logoColor=white)](https://www.npmjs.com/package/@yorha2b-lab/autodev)
[![GitHub Stars](https://img.shields.io/github/stars/yorha2b-lab/auto-crud-copilot.svg?style=flat-square&logo=github&logoColor=white)](https://github.com/yorha2b-lab/auto-crud-copilot/stargazers)
[![License](https://img.shields.io/npm/l/@yorha2b-lab/autodev.svg?style=flat-square&logo=gnu&logoColor=white)](https://github.com/yorha2b-lab/auto-crud-copilot/blob/main/LICENSE)
![Total Clones](https://img.shields.io/badge/dynamic/json?query=total_clones&url=https%3A%2F%2Fraw.githubusercontent.com%2Fyorha2b-lab%2Fauto-crud-copilot%2Fgithub-repo-stats%2Fbunker-stats.json&label=Total%20Clones&color=33cc33&style=flat-square&logo=github&logoColor=white)

Vision-based LLM-powered frontend (React+Antd) fully automatic CRUD code generator 🚀

![Auto CRUD Copilot 2.0 Demo](https://github.com/user-attachments/assets/287d0db1-d0b0-4290-87da-751ba638655e)

## 💡 Why Choose Version 2.0?
In the 2.0 era, we abandoned cumbersome scattered instructions and fully evolved into a "Full-Channel Integrated Command Center"
- Full-Channel Linkage: No need to open multiple processes. One watch command listens to Page, Component, and API sensors simultaneously.
- Semantic Hacking: Not just replicating UI, but automatically smoothing out frontend-backend field differences through the 9S dedicated semantic bridge protocol.
- Engineering-Grade Quality: Generated code is not "demo-grade" but high-quality code with useTableQuery, EditableCell, OSS upload, and other practical logic.

## 🛡️ Open Source License Upgrade

**[IMPORTANT] Since v2.1.0, this project has been officially upgraded from MIT to the AGPL-3.0 License.**

**💡 Why the change?**
As the "Bunker" system continues to evolve, we aim to ensure the core technology remains open and transparent for everyone. Adopting **AGPL-3.0** encourages the community to contribute improvements back, fostering a sustainable ecosystem for frontend automation.

**✅ Developer-Friendly Clause (Crucial):**
We value the contribution of developers in corporate environments. To ensure a smooth and safe operational experience:
1. **Scope**: The AGPL-3.0 license applies strictly to the **AutoDev source code itself**.
2. **Output Exemption**: All generated code, mock data, and configurations produced by this tool are legally considered **separate** works and are NOT affected by the copyleft (infectious) nature of the AGPL.
3. **Commercial Usage**: You are permitted to use this CLI in commercial/corporate environments. Your business logic remains **Private** and is NOT affected by the AGPL's nature.

*Summary: The Bunker's evolution belongs to the community; the armor you forge belongs to you.*

## ✨ Features

- 🖼️ **Visual Construction (Page)**: Drop screenshots into screenShot, Pod 042 automatically generates complete CRUD pages with Table/Form/Tabs.
- 🧩 **Fragment Extraction (Part)**: Drop partial screenshots into screenPart, terminal instantly pops up "plug-and-play" UI configuration snippets.
- 🔌 **Semantic Alignment (API)**: Drop interface JSON into response, automatically corrects frontend field names to achieve 100% protocol consistency between frontend and backend.
- 🔧 **Smart Assembly**: Automatically completes import statements, handles date format conversion, currency thousand separators, upload authorization, and all other dirty work.
- 📱 **Responsive**: Generated code supports responsive layout

## 🚀 Quick Start

### Installation

```bash
npm install -g @yorha2b-lab/autodev
```

### Environment Configuration

```bash
autodev init
```

> ### 💡 Zero-Configuration Quick Experience (Demo Mode)
> The project enables Demo mode by default:
> 1. **No API_KEY configuration required**, just run `autodev watch`.
> 2. Drop any image into the `screenShot` directory (the system will ignore image content and automatically airdrop the standard `example.json` construction package).
> 3. **Observe the effect**: You'll see the command line flash by, and React code is instantly physically assembled.
> *Note: To recognize real screenshots, please set `useDemo` to `false` in `config.js` and configure the environment variables below.*

Create a `.env` file and configure the following environment variables:

```bash
# AI Model API Configuration
API_KEY=your_api_key_here
BASE_URL=your_api_base_url_here
```

🚗 **Direct Link to Get API Key**: [Alibaba Cloud Bailian Console](https://bailian.console.aliyun.com/cn-beijing?tab=doc#/doc/)

### 📖 Command Center Operation Guide (v2.0 Workflow)
Entering the 2.0 era, you only need to remember one command:

```bash
autodev watch
```

After startup, the bunker system will enter Full-Channel Linkage Listening State:

| Action | Target Directory | Construction Effect |
| :--- | :--- | :--- |
| **Full Page Screenshot** | `./screenShot` | Automatically generates `index.js`, `resource.js` and synchronizes route configuration |
| **Partial Screenshot** | `./screenPart` | Terminal prints code snippets in real-time (copy and use instantly) |
| **API JSON** | `./response` | Automatically executes semantic alignment, correcting field names in `resource.js` |

## 📁 2.0 Bunker Structure Description

```
your-project/
├── screenShot/          # Page screenshot directory
├── screenPart/          # Component screenshot directory
├── response/            # Response directory
├── mock/                # Generated Mock data
├── src/
│   ├── pages/           # Generated page code
│   ├── components/      # Generated component code
│   ├── hooks/           # Generated Hook code
└── config.js            # Configuration file
```

## ⚙️ Configuration

The following options can be configured in `config.js`:

```javascript
module.exports = {
    // Whether to use demo mode
    useDemo: true,
    // Whether to generate Mock data
    needMock: false,
    // AI model type used
    visionModel: 'qwen3.5-plus',
    textModel: 'qwen-turbo',
    // Custom template directory
    // If empty, built-in templates will be used
    // Custom templates need to create your own index.hbs and resource.hbs files in the hbsdir directory
    hbsDir: '',
    // Target project directory paths
    hooksDir: 'src/hooks',
    pagesDir: 'src/pages',
    utilsDir: 'src/utils',
    componentsDir: 'src/components',
}
```

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) to learn how to participate in project development.

## 📄 License

This project is licensed under the [GNU AGPL v3.0](LICENSE) License.

## 🙏 Acknowledgments

Thanks to the following open source projects for providing the core power of the bunker system:

- [OpenAI](https://openai.com/) / [Alibaba Qwen](https://tongyi.aliyun.com/) - Powerful AI capabilities
- [Ant Design](https://ant.design/) - Excellent enterprise-level UI design language
- [Handlebars](https://handlebarsjs.com/) / [Chokidar](https://github.com/paulmillr/chokidar) - Stable construction engine and listener mechanism

## 📞 Contact

If you have any questions or suggestions, please submit an [Issue](https://github.com/yorha2b-lab/auto-crud-copilot/issues).

## 🛠️ FAQ

Q: Is this tool free?
A: The tool itself is open source and free, but the AI models called (such as GPT-4v, Qwen-VL) may require you to configure your own API Key. It is recommended to use cost-effective models like Alibaba Cloud Qwen-VL.

Q: How to customize the generated code style?
A: You can configure hbsDir to point to your own Handlebars template directory to create your own exclusive bunker construction specifications.

---

## ⚖️ Disclaimer

Auto CRUD Copilot is a **fan-made, non-commercial, open-source tool**.

- The themes, names (YoRHa, 2B, etc.), and catchphrases included in this project are inspired by **NieR:Automata**, which is a trademark and copyright of **Square Enix Co., Ltd. / PlatinumGames Inc.**
- This project is not affiliated with, endorsed by, or representative of Square Enix in any way.
- Please support the original masterpiece: [NieR:Automata Official Site](https://nierautomata.square-enix-games.com/).

**Glory to Mankind.**

⭐ If this project helps you, please give it a Star!
