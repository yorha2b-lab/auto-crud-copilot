module.exports = ({ core, config, handlebars, foundation }) => {

    const { contextStringify } = foundation
    const { indexTpl, resourceTpl } = handlebars
    const { needMock, responseSuccess } = config
    const { cleanCode, generateSmartImports, formatFormItemAndColumns } = core

    return {
        index: ({ fileName, pageConfig }) => {
            const hasTabs = pageConfig.tabs?.length > 0
            const hasPagination = pageConfig.table.pagination
            const hasFormItems = pageConfig.formItems?.length > 0
            const hasOperate = pageConfig.table?.operation?.length > 0
            const hasImageColumn = pageConfig.table?.columns?.some(item => item.type === 'image')
            const functionButtons = pageConfig.functionButton?.filter(item => !['查询', '重置', 'query', 'search', 'reset'].includes(item.btn.toLowerCase().replaceAll(' ', ''))) || []
            const needRenderAction = hasImageColumn

            const pageStruct = ['stateBlock', 'handleBlock', 'hookBlock', hasOperate ? 'operateBlock' : '', 'renderBlock'].filter(Boolean)

            let columnsValue = hasTabs ? 'columns[activeKey]' : 'columns'
            if (hasOperate) {
                columnsValue = `${columnsValue}.concat(operate)`
            }

            const imgAction = Object.fromEntries(pageConfig.table?.columns?.filter(item => item.type === 'image')?.map(item => [item.dataIndex, `_CODE_(_, record) => <a onClick={() => showImg(record, '${item.dataIndex}')}>查看图片</a>_CODE_`]))
            const renderAction = `{${contextStringify({ context: imgAction, maxLength: 120 })}}`.replace(/\n/g, '\n    ')

            const viewData = {
                hasTabs,
                pageStruct,
                columnsValue,
                hasFormItems,
                renderAction,
                hasPagination,
                hasImageColumn,
                functionButtons,
                responseSuccess,
                needRenderAction,
                tabs: pageConfig.tabs,
                renderTree: pageConfig.renderTree,
                hasExpandable: pageConfig.table.expandable,
                staticInfoText: pageConfig.staticInfo?.text,
                operations: pageConfig.table.operation || [],
                hasRowSelection: pageConfig.table.rowSelection,
                uri: needMock ? fileName : 'BUNKER_API_ANCHOR_pages',
                formItems: hasFormItems ? (hasTabs ? 'formItems[activeKey]' : 'formItems') : '[]',
                initParams: `{ ${hasTabs ? 'type: tabs[0].key ,' : ''}${hasPagination ? 'pageNo: 1 , pageSize: 10' : ''}}`,
            }

            const bodyCode = indexTpl(viewData)
            const importsStr = generateSmartImports({ module: 'index', hasTabs, bodyCode, hasFormItems })
            return cleanCode(`${importsStr}\n\n${bodyCode}`)
        },
        resource: ({ pageConfig }) => {

            const { formItems, processedColumns, dictBlocks } = formatFormItemAndColumns({ pageConfig })

            const hasTabs = pageConfig.tabs?.length > 0
            const hasFormItems = pageConfig.formItems?.length > 0
            const tabKeys = pageConfig.tabs.map(tab => tab.key).sort((a, b) => a.length - b.length)
            const optionDict = pageConfig.optionList?.reduce((acc, item) => ({ ...acc, [item.name]: item.options }), {})

            const columnsData = processedColumns.map(item => {
                delete item.type
                return item
            })

            const viewData = {
                hasTabs,
                columnsData,
                hasFormItems,
                tabs: pageConfig.tabs,
                dictBlocks: dictBlocks.map(item => ({ name: item, data: optionDict[item] ?? [] })),
                tabColumns: contextStringify({ context: Object.fromEntries(tabKeys.map(tab => [tab, '_CODE_commonColumns_CODE_'])), maxLength: 100 }),
                formItemsData: !hasTabs ?
                    `export const formItems = ${contextStringify({ context: formItems, maxLength: 120 })}` :
                    `const searchItems = ${contextStringify({ context: formItems, maxLength: 120 })}\n\nexport const formItems = ${contextStringify({ context: Object.fromEntries(tabKeys.map(tab => [tab, '_CODE_searchItems_CODE_'])), maxLength: 100 })}`,
            }

            const bodyCode = resourceTpl(viewData)
            const importsStr = generateSmartImports({ module: 'resource', hasTabs, bodyCode, hasFormItems })
            return cleanCode(`${importsStr}\n\n${bodyCode}`)
        }
    }
}