# Auto CRUD Copilot

English | [简体中文](./README.md)

[![NPM Version](https://img.shields.io/npm/v/@yorha2b-lab/autodev.svg?style=flat-square)](https://www.npmjs.com/package/@yorha2b-lab/autodev)
[![NPM Downloads](https://img.shields.io/npm/dm/@yorha2b-lab/autodev.svg?style=flat-square)](https://www.npmjs.com/package/@yorha2b-lab/autodev)
[![GitHub Stars](https://img.shields.io/github/stars/yorha2b-lab/auto-crud-copilot.svg?style=flat-square)](https://github.com/yorha2b-lab/auto-crud-copilot/stargazers)
[![License](https://img.shields.io/npm/l/@yorha2b-lab/autodev.svg?style=flat-square)](https://github.com/yorha2b-lab/auto-crud-copilot/blob/main/LICENSE)

An AI-powered frontend CRUD code generator based on vision models (React+Antd) 🚀

<video src="https://github.com/user-attachments/assets/6d42fce1-c815-482b-8c6a-4a3b9415ba47.mp4" controls="controls" muted="muted" style="max-width: 100%; display: block; margin: 20px auto;">
</video>

Say goodbye to repetitive work! Why do you need Auto CRUD Copilot?
Stop writing Tables/Forms manually: Screenshot to code, boost your development efficiency, and say goodbye to tedious copy-paste.
Eliminate API integration pain: Automatically read Response data, and let AI help you bridge frontend-backend field naming differences.
Decoupled architecture: Core logic separated from UI frameworks, supporting React/Vue/Angular.

## ✨ Features

- 🖼️ **Visual Recognition**: Automatically recognize page structures from screenshots and generate corresponding CRUD code
- 🔧 **Smart Generation**: Support multiple frontend framework templates including React, Vue, and Angular
- 📊 **Table Components**: Automatically generate editable, sortable, and filterable data tables
- 📝 **Form Components**: Intelligently generate search forms and modal forms
- 🔌 **API Alignment**: Automatically align Response interfaces with frontend field mappings
- 🎨 **UI Components**: Support various UI component types (input, select, date picker, etc.)
- 📱 **Responsive**: Generated code supports responsive layout

## 🚀 Quick Start

### Installation

```bash
npm install -g @yorha2b-lab/autodev
```

### Environment Setup

Quick start

```bash
autodev init
```

Create a `.env` file and configure the following environment variables:

```bash
# AI Model API Configuration
API_KEY=your_api_key_here
BASE_URL=your_api_base_url_here
```

🚗 **Get API Key**: [Alibaba Cloud Bailian Console](https://bailian.console.aliyun.com/cn-beijing?tab=doc#/doc/)

### Basic Usage

1. **Generate Complete CRUD Pages**

```bash
# Put page screenshots in the screenShot directory
autodev watch:page
```

2. **Generate Partial UI Components**

```bash
# Put component screenshots in the screenPart directory
autodev watch:part
```

3. **Align API Fields**

```bash
autodev watch:api
```

## 📖 Detailed Usage Guide

### watch:page Command

Monitor screenshot files in the `screenShot` directory and automatically generate complete CRUD pages.

```bash
autodev watch:page -t react
```

Parameters:
- `-t, --template <type>`: Specify frontend framework template, default is `react`

### watch:part Command

Monitor screenshot files in the `screenPart` directory and automatically generate partial UI components.

```bash
autodev watch:part -t vue
```

### watch:api Command

Monitor JSON files in the `response` directory (named after modules) and automatically align real API fields.

```bash
autodev watch:api
```

## 📁 Project Structure

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

You can configure the following options in `config.js`:

```javascript
module.exports = {
    // Whether to use demo mode
    useDemo: true,

    // Whether to generate Mock data
    needMock: false,

    // AI model types to use
    visionModel: 'qwen3.5-plus',
    textModel: 'qwen-turbo',

    // Target project directory paths
    hooksDir: 'src/hooks',
    pagesDir: 'src/pages',
    utilsDir: 'src/utils',
    componentsDir: 'src/components',
}
```

## 🎯 Supported UI Components

- Input
- InputNumber
- Select
- Radio
- Checkbox
- DatePicker
- RangePicker
- Cascader
- AutoComplete
- TextArea
- Upload

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) to learn how to participate in project development.

## 📄 License

This project is licensed under the [MIT](LICENSE) license.

## 🙏 Acknowledgments

Thanks to the following open-source projects:

- [OpenAI](https://openai.com/) - Providing powerful AI capabilities
- [Ant Design](https://ant.design/) - Excellent enterprise-level UI design language
- [UmiJS](https://umijs.org/) - Enterprise-level frontend application framework

## 📞 Contact

If you have any questions or suggestions, feel free to submit an [Issue](https://github.com/yorha2b-lab/auto-crud-copilot/issues).

## 🛠️ FAQ

**Q: Is this tool free?**
A: The tool itself is open-source and free, but the AI models it calls (such as GPT-4v, Qwen-VL) may require you to configure your own API Key. We recommend using cost-effective models like Alibaba Cloud's Qwen-VL.

---

## ⚖️ Disclaimer

Auto CRUD Copilot is a **fan-made, non-commercial, open-source tool**.

- The themes, names (YoRHa, 2B, etc.), and catchphrases included in this project are inspired by **NieR:Automata**, which is a trademark and copyright of **Square Enix Co., Ltd. / PlatinumGames Inc.**
- This project is not affiliated with, endorsed by, or representative of Square Enix in any way.
- Please support the original masterpiece: [NieR:Automata Official Site](https://nierautomata.square-enix-games.com/).

**Glory to Mankind.**

⭐ If this project helps you, please give it a Star to show your support!
