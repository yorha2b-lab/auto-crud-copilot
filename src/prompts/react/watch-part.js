module.exports = `
识别图片页面结构输出一个JSON对象

1. 严禁包含任何 Markdown 标签。
2. 严禁包含注释或解释文字。
3. 必须严格遵守以下字段规范。

## 1. 表格 (Table)
- 结构: { columns: [{ title: '', dataIndex: '' }] }
- ⚠️ 字段白名单: [title, dataIndex, sorter, render, filters, onFilter]
- 禁止输出:
    - 严禁在 columns 中包含“操作”列。
    - ***⚠️⚠️⚠️严禁输出formItems,只允许输出coloumns⚠️⚠️⚠️***
- 特殊逻辑:
    - 时间列: render 必须为 _CODE_text=>timeRender({time:text})_CODE_
    - 序号列: render 必须为 _CODE_(_, record, index) => index + 1_CODE_
    - 下拉映射列: render 必须为 _CODE_text=>字段英文名Options.find(item=>item.value===text)?.label_CODE_

## 2. 表单 (Form)
- 结构: formItems: [{label:'',name:'',type:'',options:[]}]
- 禁止输出:
    - ***⚠️⚠️⚠️严禁输出columns,只允许输出formItems⚠️⚠️⚠️***
- ⚠️ 属性精简规则:
    - 默认输入框: 仅保留 [label, name] 属性。**严禁出现 type 属性**。
    - 非默认组件: 仅当类型为 [auto, date, radio, select, upload, checkbox, textarea, daterange] 时才允许添加 type 属性。
- 命名规范:
    - daterange: name 必须设为 '字段英文名start,字段英文名end'。
    - 选择类 (radio/select/checkbox): options 必须设为 _CODE_字段英文名Options_CODE_。
- 增强属性:
    - 必填校验: 若图片中 label 前有红色星号，必须加入 rules:[{required:true,message:'xxx不能为空'}]。
    - 文字单位: 若项末尾有单位（如 元/kg），必须存入 unit 属性。

## 3. 下拉选项字典 (OptionDict)
- 结构: optionDict: { _CODE_字段英文名Options_CODE_: [] }
- 内容: 数组元素必须为 {label: '', value: ''} 格式。
`