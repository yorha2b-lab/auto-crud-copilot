const Handlebars = require('handlebars')
const stringify = require('json-stringify-pretty-compact')
const { cleanCode, generateSmartImports } = require('../utils/utils.js')

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
            ?.map(item => ({ name: item.options.replace('_CODE_', ''), data: pageConfig.optionDict[item.options] ?? [] })) // 转换为字典格式
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
const index = ({ fileName, indexTpl, pageConfig }) => {
    const hasTabs = pageConfig.tabs?.length > 0
    const hasOperate = pageConfig.table.operation?.length > 0

    // 动态确定 columns 引用方式：有标签页时使用 activeKey 索引，否则直接使用 columns
    let columnsValue = hasTabs ? 'columns[activeKey]' : 'columns'
    // 如果存在操作列，拼接到 columns 后面
    if (hasOperate) {
        columnsValue = `${columnsValue}.concat(operate)`
    }

    // 构建模板数据
    const viewData = {
        hasTabs, // 是否有标签页
        fileName, // 页面文件名
        hasOperate, // 是否有操作列
        columnsValue, // columns 引用表达式
        tabs: pageConfig.tabs, // 标签页配置
        hasExpandable: pageConfig.table.expandable, // 是否有展开行
        hasPagination: pageConfig.table.pagination, // 是否有分页
        operations: pageConfig.table.operation || [], // 操作列配置
        hasRowSelection: pageConfig.table.rowSelection, // 是否有行选择
        hasStaticInfo: pageConfig.table.staticInfo?.has, // 是否有静态信息
        staticInfoText: pageConfig.table.staticInfo?.text, // 静态信息文本
        functionButtons: pageConfig.functionButton?.filter(item => !['查询', '重置'].includes(item.btn)) || [] // 功能按钮（排除查询和重置）
    }

    // 渲染模板
    const bodyCode = indexTpl(viewData)
    // 生成智能导入语句
    const importsStr = generateSmartImports(bodyCode, hasTabs)
    // 清理代码并返回
    return cleanCode(`${importsStr}\n\n${bodyCode}`)
}

// 导出 React 编译器的两个核心函数
module.exports = { index, resource }