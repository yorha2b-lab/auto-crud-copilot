# 贡献指南

感谢您对 Auto CRUD Copilot 项目的关注！我们欢迎任何形式的贡献，包括但不限于：

- 🐛 报告Bug
- 💡 提出新功能建议
- 📝 改进文档
- 🔧 提交代码修复
- 🎨 添加新模板或组件

## 🚀 如何贡献

### 报告Bug

如果您发现了Bug，请通过以下步骤报告：

1. 检查是否已有相关的Issue
2. 如果没有，请创建新的Issue
3. 在Issue中提供以下信息：
   - 问题描述
   - 复现步骤
   - 期望行为
   - 实际行为
   - 环境信息（操作系统、Node版本等）
   - 相关截图或错误日志

### 提出新功能建议

1. 检查是否已有相关的Issue或讨论
2. 如果没有，请创建新的Issue
3. 在Issue中详细描述：
   - 功能描述
   - 使用场景
   - 预期效果
   - 可能的实现方案

特别欢迎 Vue / Angular 开发者提交对应的 Template 和 Compiler 实现！ 我们已经为您预留好了插件接口。

### 提交代码

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建一个 Pull Request

## 📋 开发指南

### 环境准备

1. 克隆仓库
```bash
git clone https://github.com/yorha2b-lab/auto-crud-copilot.git
cd auto-crud-copilot
```

2. 安装依赖
```bash
npm install
```

3. 创建环境变量文件
```bash
cp .env.example .env
# 编辑 .env 文件，填入您的API密钥
```

### 项目结构

```
auto-crud-copilot/
├── bin/                 # 可执行文件
├── src/
│   ├── commands/        # 命令实现
│   ├── core/           # 核心逻辑
│   ├── prompts/        # AI提示词
│   ├── services/       # 服务层
│   └── utils/          # 工具函数
├── templates/          # 代码模板
│   ├── react/
│   ├── vue/
│   └── angular/
└── config.js           # 配置文件
```

- 提交信息遵循[Conventional Commits](https://www.conventionalcommits.org/zh-hans/v1.0.0/)规范

### 测试

在提交代码前，请确保：

1. 代码通过所有测试
2. 代码符合项目的编码规范

## 📝 Pull Request 流程

1. 确保您的PR描述清晰，说明了更改的目的和实现方式
2. 确保您的代码没有合并冲突
3. 确保所有测试通过
4. 等待维护者审查和合并

## 🏷️ 发布流程

项目维护者负责发布新版本，遵循[语义化版本](https://semver.org/lang/zh-CN/)规范。

## 🤝 行为准则

请遵守我们的行为准则，保持友好和尊重的交流环境。

## 📞 联系方式

如有任何问题，请通过以下方式联系我们：

- 创建Issue

---

再次感谢您的贡献！🎉