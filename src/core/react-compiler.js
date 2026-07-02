const stringify = require('json-stringify-pretty-compact')
const { cleanCode, generateSmartImports, formatFormItemAndColumns } = require('../utils/utils.js')

/**
 * 生成 resource.js 文件（表格列配置、表单配置、字典等）
 * @param {Object} param0 - 函数参数
 * @param {Object} param0.pageConfig - 页面配置对象（包含 tabs、formItems、table 等）
 * @param {Object} param0.resourceTpl - Handlebars 模板函数
 * @returns {string} 生成的 resource.js 代码
 */
const resource = ({ pageConfig, resourceTpl }) => {

    const { formItems, processedColumns, dictBlocks } = formatFormItemAndColumns({ pageConfig })

    const hasTabs = pageConfig.tabs?.length > 0
    const hasFormItems = pageConfig.formItems?.length > 0
    const optionDict = pageConfig.optionList?.reduce((acc, item) => ({ ...acc, [item.name]: item.options }), {})

    const columnsData = processedColumns.map(item => {
        delete item.type
        return item
    })

    const viewData = {
        hasTabs,
        hasFormItems,
        tabs: pageConfig.tabs,
        dictBlocks: dictBlocks.map(item => ({ name: item, data: optionDict[item] ?? [] })),
        formItemsData: hasTabs ? Object.fromEntries(pageConfig.tabs.map(tab => [tab.key, formItems])) : formItems,
        columnsData: hasTabs ? Object.fromEntries(pageConfig.tabs.map(tab => [tab.key, columnsData])) : columnsData,
    }

    const bodyCode = resourceTpl(viewData)
    const importsStr = generateSmartImports({ module: 'resource', hasTabs, bodyCode, hasFormItems })
    return cleanCode(`${importsStr}\n\n${bodyCode}`)
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
    const hasPagination = pageConfig.table.pagination
    const hasFormItems = pageConfig.formItems?.length > 0
    const hasOperate = pageConfig.table?.operation?.length > 0
    const hasImageColumn = pageConfig.table?.columns?.some(item => item.type === 'image')
    const pageStruct = pageConfig.pageStruct?.filter(item => item.toLowerCase() !== 'tabs') || []
    const functionButtons = pageConfig.functionButton?.filter(item => !['查询', '重置', 'query', 'search', 'reset'].includes(item.btn.toLowerCase().replaceAll(' ', ''))) || []
    const needRenderAction = hasImageColumn

    let columnsValue = hasTabs ? 'columns[activeKey]' : 'columns'
    if (hasOperate) {
        columnsValue = `${columnsValue}.concat(operate)`
    }

    const imgAction = Object.fromEntries(pageConfig.table?.columns?.filter(item => item.type === 'image')?.map(item => [item.dataIndex, `_CODE_(_, record) => <a onClick={() => showImg(record, '${item.dataIndex}')}>查看图片</a>_CODE_`]))
    const renderAction = `{${stringify.default({ ...imgAction }, { indent: 4, maxLength: 120 })}}`.replace(/\n/g, '\n    ')

    const viewData = {
        hasTabs,
        fileName,
        pageStruct,
        hasOperate,
        columnsValue,
        hasFormItems,
        renderAction,
        hasPagination,
        hasImageColumn,
        functionButtons,
        needRenderAction,
        tabs: pageConfig.tabs,
        responseSuccess: config.responseSuccess,
        hasExpandable: pageConfig.table.expandable,
        staticInfoText: pageConfig.staticInfo?.text,
        operations: pageConfig.table.operation || [],
        hasRowSelection: pageConfig.table.rowSelection,
        formItems: hasFormItems ? (hasTabs ? 'formItems[activeKey]' : 'formItems') : '[]',
        initParams: `{ ${hasTabs ? 'type: tabs[0].key ,' : ''}${hasPagination ? 'pageNo: 1 , pageSize: 10' : ''}}`,
    }

    const bodyCode = indexTpl(viewData)
    const importsStr = generateSmartImports({ module: 'index', hasTabs, bodyCode, hasFormItems })
    return cleanCode(`${importsStr}\n\n${bodyCode}`)
}

module.exports = { index, resource }