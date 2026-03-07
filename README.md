# Auto CRUD Copilot

[![NPM Version](https://img.shields.io/npm/v/@yorha2b-lab/autodev.svg?style=flat-square)](https://www.npmjs.com/package/@yorha2b-lab/autodev)
[![NPM Downloads](https://img.shields.io/npm/dm/@yorha2b-lab/autodev.svg?style=flat-square)](https://www.npmjs.com/package/@yorha2b-lab/autodev)
[![GitHub Stars](https://img.shields.io/github/stars/yorha2b-lab/auto-crud-copilot.svg?style=flat-square)](https://github.com/yorha2b-lab/auto-crud-copilot/stargazers)
[![License](https://img.shields.io/npm/l/@yorha2b-lab/autodev.svg?style=flat-square)](https://github.com/yorha2b-lab/auto-crud-copilot/blob/main/LICENSE)

基于视觉大模型的前端(Umi+Antd)全自动 CRUD 代码生成器 🚀

![Demo](https://via.placeholder.com/800x400?text=Coming+Soon)

拒绝重复劳动！为什么你需要 Auto CRUD Copilot？
告别手写 Table/Form：截图即代码，提升你的开发效率，告别烦人的复制粘贴。
拒绝接口联调痛苦：自动读取 Swagger，AI 帮你抹平前后端字段命名差异。
架构解耦：核心逻辑与 UI 框架分离，React/Vue/Angular 均可适配。

## ✨ 特性

- 🖼️ **视觉识别**: 通过截图自动识别页面结构，生成对应的CRUD代码
- 🔧 **智能生成**: 支持React、Vue、Angular等多种前端框架模板
- 📊 **表格组件**: 自动生成可编辑、可排序、可筛选的数据表格
- 📝 **表单组件**: 智能生成搜索表单和模态框表单
- 🔌 **API对齐**: 自动对齐Swagger接口与前端字段映射
- 🎨 **UI组件**: 支持多种UI组件类型（输入框、选择器、日期等）
- 📱 **响应式**: 生成的代码支持响应式布局

## 🚀 快速开始

### 安装

```bash
npm install -g auto-crud-copilot
```

### 环境配置

创建 `.env` 文件并配置以下环境变量：

```bash
# AI模型API配置
API_KEY=your_api_key_here
BASE_URL=your_api_base_url_here
```

### 基本使用

1. **生成完整CRUD页面**

```bash
# 将页面截图放入screenShot目录
autodev watch:page
```

2. **生成局部UI组件**

```bash
# 将组件截图放入screenPart目录
autodev watch:part
```

3. **对齐API字段**

```bash
# 将Swagger文档放入swagger目录
autodev watch:api
```

## 📖 详细使用指南

### watch:page 命令

监听 `screenShot` 目录下的截图文件，自动生成完整的增删改查页面。

```bash
autodev watch:page -t react
```

参数说明：
- `-t, --template <type>`: 指定前端框架模板，默认为 `react`

### watch:part 命令

监听 `screenPart` 目录下的截图文件，自动生成局部UI组件。

```bash
autodev watch:part -t vue
```

### watch:api 命令

监听 `swagger` 目录下的API文档，自动对齐真实接口字段。

```bash
autodev watch:api
```

## 📁 项目结构

```
your-project/
├── screenShot/          # 页面截图目录
├── screenPart/          # 组件截图目录
├── swagger/             # API文档目录
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
    // 是否需要生成 Mock 数据
    needMock: false,

    // 使用的 AI 模型类型
    visionModel: 'qwen3.5-plus',
    textModel: 'qwen-turbo',

    // 目标项目的目录路径
    hooksDir: 'src/hooks',
    pagesDir: 'src/pages',
    utilsDir: 'src/utils',
    componentsDir: 'src/components',
}
```

## 🎯 支持的UI组件

- 输入框 (Input)
- 数字输入框 (InputNumber)
- 选择器 (Select)
- 单选框 (Radio)
- 复选框 (Checkbox)
- 日期选择器 (DatePicker)
- 日期范围选择器 (RangePicker)
- 级联选择器 (Cascader)
- 自动完成 (AutoComplete)
- 文本域 (TextArea)
- 文件上传 (Upload)

## 🤝 贡献

欢迎贡献代码！请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解如何参与项目开发。

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证。

## 🙏 致谢

感谢以下开源项目：

- [OpenAI](https://openai.com/) - 提供强大的AI能力
- [Ant Design](https://ant.design/) - 优秀的企业级UI设计语言
- [UmiJS](https://umijs.org/) - 企业级前端应用框架

## 📞 联系方式

如有问题或建议，欢迎提交 [Issue](https://github.com/yorha2b-lab/auto-crud-copilot/issues)。

## 🛠️ 常见问题 (FAQ)
Q: 这个工具收费吗？
A: 工具本身开源免费，但调用的 AI 模型（如 GPT-4v, Qwen-VL）可能需要你配置自己的 API Key。建议使用阿里云 Qwen-VL 等高性价比模型。

---

⭐ 如果这个项目对你有帮助，请给个Star支持一下！