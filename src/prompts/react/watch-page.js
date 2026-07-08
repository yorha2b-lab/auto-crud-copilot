module.exports = `
# Task: Full-Page UI Analysis & Structural Assembly
执行全页面视觉特征提取，并按照物理布局顺序输出标准的构筑协议。

## 1. 核心命名协议 (Naming Convention)
- **驼峰命名**: 所有变量及函数名必须遵循 camelCase。
- **⚠️ 严禁中文**: 绝对禁止在变量名、键名中使用中文字符。
- **物理屏蔽关键字**: 禁止使用 JS 保留字 (export, delete, const, let, class, default 等)。

## 2. 零部件构筑规范 (Component Specifications)

### 标签页 (Tabs)
- **基础格式**: [{ label: '文本', key: 'englishName' }]
- **识别条件**: 仅当下部有显著长横线 (Ink Bar) 或呈现包裹感 (Card style) 时判定。
- **排除项**: 表格上方的独立按钮必须归类为 [functionButton]。

### 搜索项 (FormItems)
- **基础格式**: [{ label: '文本', name: 'englishName',type:'' }]
- ⚠️ 属性精简规则:
    - 默认输入框: 仅保留 [label, name] 属性。**严禁出现 type 属性**。
    - 非默认组件: 仅当类型为 [auto, date, radio, select, upload, checkbox, textarea, daterange] 时才允许添加 type 属性。
**标准定义 (FormItem)**:
    - date: 单日期
    - enum: 枚举类型
    - daterange: 日期范围
    - text: 普通文本（默认）
- 命名规范:
    - daterange: name 必须设为 '字段英文名Start,字段英文名End'
    - **⚠️注意⚠️**：不要用_分隔字段名。

### 统计条 (StaticInfo)
- **独立存在**: 位于表格外周的汇总信息。输出格式: { has: true, text: '具体内容' }。

### 表格主体 (Table)
- ⚠️ **操作锁定**: 严禁在 columns 数组中包含“操作”列。
- **标准项**: {title:'列名', dataIndex:'列名英文名词',type:''}。
- **配置项**: [pagination, expandable, rowSelection] 均为布尔值false,只有页面明确有对应功能时才为true。
- **标准定义 (Columns)**:
    - enum: 枚举列
    - money: 金额列
    - index: 序号列
    - image: 图片列
    - date: 时间/日期列
    - text: 普通文本（默认）
    - tag: 标签列(有背景色的文本)
    - badge: 徽标列(文本前有颜色小圆点)
    - **行操作 (operation)**: [{label:'操作名', action:'动词ByRecord',uri:'BUNKER_API_ANCHOR_动词ByRecord'}]。

### 全局功能按钮 (FunctionButton)
- **格式**: [{btn:'显示文本', action:'操作动词BySelected',uri:'BUNKER_API_ANCHOR_动词BySelected'}]。
- **导出数据**: action 设为 'exportData' 或 'export+模块名'。
- **逻辑锁定**: ⚠️只要页面中出现了非查询、非重置的独立操作按钮，必须识别并存入 [functionButton] 数组。
- **构筑联动**: ⚠️若 [functionButton] 数组不为空，则在下文的 [pageStruct] 中必须包含 "FunctionButtonsBlock"。

## 3. 布局逻辑编排 (PageStruct)
- **定义**: 定义从上至下的物理堆叠顺序。
- **白名单**: [MyTable, AlertInfo, MySearchForm, FunctionButtonsBlock]
- **注释**: MyTable 是表格主体，AlertInfo 是统计条，MySearchForm 是搜索表单，FunctionButtonsBlock 是全局功能按钮。


## 4. 字典数组 (OptionList)
- **格式**:[{name:'字段英文名+Options',options:[{label:'', value:''}]}]。
- **注释**:label:选项文本,value:文本英文。
- **数据源**:根据对应列的内容去重，生成选项数组。

`.trim();