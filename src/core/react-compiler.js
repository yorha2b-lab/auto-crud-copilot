const fs = require('fs')
const path = require('path')
const Handlebars = require('handlebars')
const stringify = require('json-stringify-pretty-compact')
const { cleanCode, generateSmartImports } = require('../utils/utils.js')

Handlebars.registerHelper('raw', options => options.fn())
Handlebars.registerHelper('stringify', (context, maxLength = 200) => context ? new Handlebars.SafeString(stringify.default(context, { indent: 4, maxLength })) : '[]')

/**
 * 生成 resource.js 文件（表格列配置、表单配置、字典等）
 * @param {Object} param0 - 函数参数
 * @param {Object} param0.pageConfig - 页面配置对象（包含 tabs、formItems、table 等）
 * @param {Object} param0.resourceTpl - Handlebars 模板函数
 * @returns {string} 生成的 resource.js 代码
 */
const resource = ({ pageConfig, resourceTpl }) => {

    const hasTabs = pageConfig.tabs?.length > 0

    const viewData = {
        hasTabs,
        tabs: pageConfig.tabs,
        formItems: pageConfig.formItems,
        formItemsData: hasTabs ? Object.fromEntries(pageConfig.tabs.map(tab => [tab.key, pageConfig.formItems])) : pageConfig.formItems,
        columnsData: hasTabs ? Object.fromEntries(pageConfig.tabs.map(tab => [tab.key, pageConfig.table.columns])) : pageConfig.table.columns,
        dictBlocks: pageConfig.formItems
            ?.filter(item => item.type === 'select')
            ?.map(item => ({ name: item.options.replaceAll('_CODE_', ''), data: pageConfig.optionDict[item.options] ?? [] }))
    }

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
    const functionButtons = pageConfig.functionButton?.filter(item => !['查询', '重置'].includes(item.btn)) || []
    const hasFunctionButtons = functionButtons.length > 0

    let columnsValue = hasTabs ? 'columns[activeKey]' : 'columns'
    if (hasOperate) {
        columnsValue = `${columnsValue}.concat(operate)`
    }

    const viewData = {
        hasTabs,
        fileName,
        hasOperate,
        columnsValue,
        hasFormItems,
        functionButtons,
        tabs: pageConfig.tabs,
        responseSuccess: config.responseSuccess,
        hasStaticInfo: pageConfig.staticInfo?.has,
        hasExpandable: pageConfig.table.expandable,
        hasPagination: pageConfig.table.pagination,
        operations: pageConfig.table.operation || [],
        hasRowSelection: pageConfig.table.rowSelection,
        formItems: hasTabs ? 'formItems[activeKey]' : 'formItems',
        pageStruct: hasFunctionButtons ? pageConfig.pageStruct : pageConfig.pageStruct?.filter(item => item !== 'FunctionButtonsBlock'),
    }

    if (viewData.hasOperate) {
        Handlebars.registerPartial('tableOperate', `${fs.readFileSync(path.join(__dirname, '../../templates/react/handlebars/tableOperate.hbs'), 'utf-8')}\n`)
    }

    if (viewData.hasFormItems) {
        Handlebars.registerPartial('MySearchForm', `${fs.readFileSync(path.join(__dirname, '../../templates/react/handlebars/MySearchForm.hbs'), 'utf-8')}\n`)
    }

    if (hasFunctionButtons) {
        Handlebars.registerPartial('FunctionButtonsBlock', `${fs.readFileSync(path.join(__dirname, '../../templates/react/handlebars/functionButtonsBlock.hbs'), 'utf-8')}\n`)
    }

    if (viewData.hasStaticInfo) {
        Handlebars.registerPartial('AlertInfo', `{{{{raw}}}}<Alert showIcon title='${pageConfig.staticInfo?.text}' type='info' style={{ marginBottom: 16 }} />\n{{{{/raw}}}}`)
    }

    Handlebars.registerPartial('MyTable', `${fs.readFileSync(path.join(__dirname, '../../templates/react/handlebars/MyTable.hbs'), 'utf-8')}\n`)
    Handlebars.registerPartial('hookBlock', `${fs.readFileSync(path.join(__dirname, '../../templates/react/handlebars/hookBlock.hbs'), 'utf-8')}\n`)
    Handlebars.registerPartial('stateBlock', `${fs.readFileSync(path.join(__dirname, '../../templates/react/handlebars/stateBlock.hbs'), 'utf-8')}\n`)
    Handlebars.registerPartial('handleBlock', `${fs.readFileSync(path.join(__dirname, '../../templates/react/handlebars/handleBlock.hbs'), 'utf-8')}\n`)

    const bodyCode = indexTpl(viewData)
    const importsStr = generateSmartImports(bodyCode, hasTabs)
    return cleanCode(`${importsStr}\n\n${bodyCode}`)
}

module.exports = { index, resource }