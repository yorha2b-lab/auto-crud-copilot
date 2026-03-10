const Handlebars = require('handlebars')
const stringify = require('json-stringify-pretty-compact')
const { cleanCode, generateSmartImports } = require('../utils/utils.js')

Handlebars.registerHelper('stringify', (context, maxLength = 200) => context ? new Handlebars.SafeString(stringify.default(context, { indent: 4, maxLength })) : '[]')

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
            ?.map(item => ({ name: item.options.replace('_CODE_', ''), data: pageConfig.optionDict[item.options] ?? [] }))
    }

    const rawCode = resourceTpl(viewData)
    return cleanCode(rawCode)
}

const index = ({ fileName, indexTpl, pageConfig }) => {
    const hasTabs = pageConfig.tabs?.length > 0
    const hasOperate = pageConfig.table.operation?.length > 0

    let columnsValue = hasTabs ? 'columns[activeKey]' : 'columns'
    if (hasOperate) {
        columnsValue = `${columnsValue}.concat(operate)`
    }

    const viewData = {
        hasTabs,
        fileName,
        hasOperate,
        columnsValue,
        tabs: pageConfig.tabs,
        hasExpandable: pageConfig.table.expandable,
        hasPagination: pageConfig.table.pagination,
        operations: pageConfig.table.operation || [],
        hasRowSelection: pageConfig.table.rowSelection,
        hasStaticInfo: pageConfig.table.staticInfo?.has,
        staticInfoText: pageConfig.table.staticInfo?.text,
        functionButtons: pageConfig.functionButton?.filter(item => !['查询', '重置'].includes(item.btn)) || []
    }

    const bodyCode = indexTpl(viewData)
    const importsStr = generateSmartImports(bodyCode, hasTabs)
    return cleanCode(`${importsStr}\n\n${bodyCode}`)
}

module.exports = { index, resource }