const { cleanCode, generateSmartImports, formatFormItemAndColumns } = require('../utils/utils.js')

/**
 * 生成 resource.js 文件（表格列配置、表单配置、字典等）
 * @param {Object} param0 - 函数参数
 * @param {Object} param0.pageConfig - 页面配置对象（包含 tabs、formItems、table 等）
 * @param {Object} param0.resourceTpl - Handlebars 模板函数
 * @returns {string} 生成的 resource.js 代码
 */
const resource = ({ pageConfig, resourceTpl }) => {

    const hasTabs = pageConfig.tabs?.length > 0

    const { formItems, processedColumns, dictBlocks } = formatFormItemAndColumns({ pageConfig })

    const viewData = {
        hasTabs,
        formItems,
        tabs: pageConfig.tabs,
        dictBlocks: dictBlocks.map(item => ({ name: item, data: pageConfig.optionDict[item] ?? [] })),
        formItemsData: hasTabs ? Object.fromEntries(pageConfig.tabs.map(tab => [tab.key, formItems])) : formItems,
        columnsData: hasTabs ? Object.fromEntries(pageConfig.tabs.map(tab => [tab.key, processedColumns])) : processedColumns,
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
    const pageStruct = pageConfig.pageStruct?.filter(item => item.toLowerCase() !== 'tabs') || []
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
        hasExpandable: pageConfig.table.expandable,
        hasPagination: pageConfig.table.pagination,
        staticInfoText: pageConfig.staticInfo?.text,
        operations: pageConfig.table.operation || [],
        hasRowSelection: pageConfig.table.rowSelection,
        formItems: hasFormItems ? (hasTabs ? 'formItems[activeKey]' : 'formItems') : '[]',
        pageStruct: hasFunctionButtons ? pageStruct : pageStruct.filter(item => item !== 'FunctionButtonsBlock'),
    }

    const bodyCode = indexTpl(viewData)
    const importsStr = generateSmartImports({ bodyCode, hasTabs, hasFormItems })
    return cleanCode(`${importsStr}\n\n${bodyCode}`)
}

module.exports = { index, resource }