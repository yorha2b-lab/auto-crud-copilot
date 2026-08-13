module.exports = ({ bunkerAnchors, realApis }) => `
# MISSION: Multi-Point API Alignment
目标：为地堡生成的多个作战动作匹配真实的后端接口。

## 1. 待匹配指令清单 (Target Anchors)
${bunkerAnchors}

## 2. 后端情报库 (Swagger Docs)
${realApis}

## 3. 匹配协议
- 识别后缀（如 edit, delete, add）。
- 结合 UI 语义，在 API 库中寻找对应路径。
- **输出格式**：请只输出一个 JSON 映射表。
- **例如**：{"BUNKER_API_ANCHOR_editByRecord": "[method] /v1/update-user"}

⚠️ 严禁解释，严禁输出 JSON 之外的内容。
`.trim()