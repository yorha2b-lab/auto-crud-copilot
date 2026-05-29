module.exports = `
# Task: Full-Page UI Analysis & Structural Assembly
执行全页面视觉特征提取，并按照物理布局顺序输出标准的构筑协议。

## 1. 核心命名协议 (Naming Convention)
- **驼峰命名**: 所有变量及函数名必须遵循 camelCase。
- **⚠️ 严禁中文**: 绝对禁止在变量名、键名中使用中文字符。
- **物理屏蔽关键字**: 禁止使用 JS 保留字 (export, delete, const, let, class, default 等)。

## 2. 零部件构筑规范 (Component Specifications)

### 标签页 (Tabs)
- **识别条件**: 仅当下部有显著长横线 (Ink Bar) 或呈现包裹感 (Card style) 时判定。
- **排除项**: 表格上方的独立按钮必须归类为 [functionButton]。

### 搜索项 (FormItems)
- **基础格式**: [{ label: '文本', name: 'englishName',type:'' }]
- ⚠️ 属性精简规则:
    - 默认输入框: 仅保留 [label, name] 属性。**严禁出现 type 属性**。
    - 非默认组件: 仅当类型为 [auto, date, radio, select, upload, checkbox, textarea, daterange] 时才允许添加 type 属性。
**标准定义 (Columns)**:
    - date: 单日期
    - daterange: 日期范围
    - enum: 枚举类型
    - text: 普通文本（默认）
- 命名规范:
    - daterange: name 必须设为 '字段英文名start,字段英文名end'。

### 统计条 (StaticInfo)
- **独立存在**: 位于表格外周的汇总信息。输出格式: { has: true, text: '具体内容' }。

### 表格主体 (Table)
- **标准项**: {title:'列名', dataIndex:'列名英文名词',type:''}。
- **配置项**: [pagination, expandable, rowSelection] 均为布尔值false,只有页面明确有对应功能时才为true。
- **标准定义 (Columns)**:
    - ⚠️ **操作锁定**: 严禁在 columns 数组中包含“操作”列。
    - enum: 枚举列
    - money: 金额列
    - index: 序号列
    - image: 图片列
    - date: 时间/日期列
    - text: 普通文本（默认）
    - tag: 标签列(有背景色的标签)
    - badge: 徽标列(文本前有颜色小圆点)
    - **行操作 (Operation)**: [{label:'操作名', action:'动词ByRecord'}]。

### 全局功能按钮 (FunctionButton)
- **格式**: [{btn:'显示文本', action:'动作名'}]。
- **联动命名**: 若与行操作重复，action 必须加上 'BySelected' 前缀。
- **导出协议**: action 设为 'exportData' 或 'export+模块名'。

## 3. 布局逻辑编排 (Page Structure)
- **字段**: [pageStruct] 定义从上至下的物理堆叠顺序。
- **白名单**: 只能从 [AlertInfo, MySearchForm, FunctionButtonsBlock, MyTable] 中选择。
- **⚠️ 约束**: 严禁在 pageStruct 中包含 其他未定义组件；并且只有真实存在的组件才能被包含。

## 4. 输出约束 (Output Format)
- **格式**: 纯 JSON 对象，严禁 Markdown 标签包围。
- **字典映射 (OptionDict)**: 必须包含所有 select 类型所需的 Options 数组，键名格式为 字段英文名+Options ，元素格式为 {label:'', value:''}。

**JSON 骨架要求**:
{ "tabs": [], "table": {}, "formItems": [], "staticInfo": {}, "optionDict": {}, "functionButton": [], "pageStruct": [] }
`.trim();