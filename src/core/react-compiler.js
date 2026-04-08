const fs = require('fs')
const path = require('path')
const Handlebars = require('handlebars')
const stringify = require('json-stringify-pretty-compact')
const { cleanCode, generateSmartImports } = require('../utils/utils.js')

// 注册 Handlebars 辅助函数，用于将原始内容渲染到模板中，不进行任何处理
Handlebars.registerHelper('raw', options => options.fn())
// 注册 Handlebars 辅助函数，用于将对象格式化为 JSON 字符串
Handlebars.registerHelper('stringify', (context, maxLength = 200) => context ? new Handlebars.SafeString(stringify.default(context, { indent: 4, maxLength })) : '[]')

/**
 * 生成 resource.js 文件（表格列配置、表单配置、字典等）
 * @param {Object} param0 - 函数参数
 * @param {Object} param0.pageConfig - 页面配置对象（包含 tabs、formItems、table 等）
 * @param {Object} param0.resourceTpl - Handlebars 模板函数
 * @returns {string} 生成的 resource.js 代码
 */
const resource = ({ pageConfig, resourceTpl }) => {
    // 判断是否存在标签页配置
    const hasTabs = pageConfig.tabs?.length > 0

    // 构建模板数据
    const viewData = {
        hasTabs, // 是否有标签页
        tabs: pageConfig.tabs, // 标签页配置
        formItems: pageConfig.formItems, // 表单项配置
        // 如果有标签页，将 formItems 按 tab 分组；否则直接使用数组
        formItemsData: hasTabs ? Object.fromEntries(pageConfig.tabs.map(tab => [tab.key, pageConfig.formItems])) : pageConfig.formItems,
        // 如果有标签页，将 columns 按 tab 分组；否则直接使用数组
        columnsData: hasTabs ? Object.fromEntries(pageConfig.tabs.map(tab => [tab.key, pageConfig.table.columns])) : pageConfig.table.columns,
        // 提取所有下拉框字典配置
        dictBlocks: pageConfig.formItems
            ?.filter(item => item.type === 'select') // 过滤出下拉框类型
            ?.map(item => ({ name: item.options.replaceAll('_CODE_', ''), data: pageConfig.optionDict[item.options] ?? [] })) // 转换为字典格式
    }

    // 渲染模板并清理代码
    const rawCode = resourceTpl(viewData)
    return cleanCode(rawCode)
}

/**
 * 生成 index.js 文件（页面组件）
 * @param {Object} param0 - 函数参数
 * @param {string} param0.fileName - 页面文件名
 * @param {Object} param0.indexTpl - Handlebars 模板函数
 * @param {Object} param0.pageConfig - 页面配置对象
 * @returns {string} 生成的 index.js 代码
 */
const index = ({ config, fileName, indexTpl, pageConfig }) => {

    const hasTabs = pageConfig.tabs?.length > 0
    const hasFormItems = pageConfig.formItems?.length > 0
    const hasOperate = pageConfig.table.operation?.length > 0

    // 动态确定 columns 引用方式：有标签页时使用 activeKey 索引，否则直接使用 columns
    let columnsValue = hasTabs ? 'columns[activeKey]' : 'columns'
    // 如果存在操作列，拼接到 columns 后面
    if (hasOperate) {
        columnsValue = `${columnsValue}.concat(operate)`
    }

    // 构建模板数据
    const viewData = {
        hasTabs,
        fileName,
        hasOperate,
        columnsValue,
        hasFormItems,
        tabs: pageConfig.tabs,
        pageStruct: pageConfig.pageStruct,
        responseSuccess: config.responseSuccess,
        hasExpandable: pageConfig.table.expandable,
        hasPagination: pageConfig.table.pagination,
        operations: pageConfig.table.operation || [],
        hasRowSelection: pageConfig.table.rowSelection,
        hasStaticInfo: pageConfig.table.staticInfo?.has,
        staticInfoText: pageConfig.table.staticInfo?.text,
        formItems: hasTabs ? 'formItems[activeKey]' : 'formItems',
        functionButtons: pageConfig.functionButton?.filter(item => !['查询', '重置'].includes(item.btn)) || []
    }

    if (viewData.hasOperate) {
        Handlebars.registerPartial('tableOperate', `${fs.readFileSync(path.join(__dirname, '../../templates/react/handlebars/tableOperate.hbs'), 'utf-8')}\n`)
    }

    if (viewData.hasFormItems) {
        Handlebars.registerPartial('MySearchForm', `${fs.readFileSync(path.join(__dirname, '../../templates/react/handlebars/MySearchForm.hbs'), 'utf-8')}\n`)
    }

    if (viewData.hasStaticInfo) {
        Handlebars.registerPartial('AlertInfo', `{{{{raw}}}}<Alert showIcon title='${pageConfig.table.staticInfo?.text}' type='info' style={{ marginBottom: 16 }} />\n{{{{/raw}}}}`)
    }

    Handlebars.registerPartial('MyTable', `${fs.readFileSync(path.join(__dirname, '../../templates/react/handlebars/MyTable.hbs'), 'utf-8')}\n`)
    Handlebars.registerPartial('hookBlock', `${fs.readFileSync(path.join(__dirname, '../../templates/react/handlebars/hookBlock.hbs'), 'utf-8')}\n`)
    Handlebars.registerPartial('stateBlock', `${fs.readFileSync(path.join(__dirname, '../../templates/react/handlebars/stateBlock.hbs'), 'utf-8')}\n`)
    Handlebars.registerPartial('handleBlock', `${fs.readFileSync(path.join(__dirname, '../../templates/react/handlebars/handleBlock.hbs'), 'utf-8')}\n`)
    Handlebars.registerPartial('FunctionButtonsBlock', `${fs.readFileSync(path.join(__dirname, '../../templates/react/handlebars/functionButtonsBlock.hbs'), 'utf-8')}\n`)

    // 渲染模板
    const bodyCode = indexTpl(viewData)
    // 生成智能导入语句
    const importsStr = generateSmartImports(bodyCode, hasTabs)
    // 清理代码并返回
    return cleanCode(`${importsStr}\n\n${bodyCode}`)
}

// 导出 React 编译器的两个核心函数
module.exports = { index, resource }