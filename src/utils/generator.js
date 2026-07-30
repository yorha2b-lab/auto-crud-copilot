const stringify = require('json-stringify-pretty-compact')

const cleanCode = str => str
    .replace(/```[a-z]*\n?/gi, '')// 物理超度 Markdown 糖衣（解决```json 报错）
    .replace(/```/g, '')
    .replace(/\\"/g, '"') // 逻辑自愈 处理 AI 错误转义的引号（把 \" 还原回 "）
    .replace(/['"]?_CODE_([\s\S]*?)_CODE_['"]?/g, '$1') // 去掉 _CODE_ 包裹的代码
    .replace(/_CODE_/g, '')      // 兜底清理
    .replace(/"(\w+)":/g, '$1:') // 去掉 key 的双引号
    .replace(/"/g, "'")          // 双引号全部转单引号
    .replace(/[ \t]+$/gm, '')    // 去除每一行行尾的多余空格
    .replace(/\n{3,}/g, '\n\n')  // 将3个或以上的换行符压缩成2个换行符
    .replace(/^\s+/, '')         // 去掉文件头部的空行
    .trim() + '\n'

const formatFormItemAndColumns = ({ pageConfig }) => {

    const codePresets = {
        money: 'text => moneyRender(text)',
        date: 'text => timeRender({time: text})',
        index: '(_, record, index) => index + 1',
        tag: `text => <Tag color='magenta'>{text}</Tag>`,
        badge: `text => <Badge status='success' text={text} />`,
        enum: dataIndex => `text => ${dataIndex}Options.find(item => item.value === text)?.label ?? text`,
    }

    const columns = pageConfig.table?.columns ?? pageConfig?.columns ?? []

    const tableDicts = columns?.filter(item => item.type === 'enum')?.map(item => `${item.dataIndex}Options`) ?? []
    const formDicts = pageConfig.formItems?.filter(item => item.type === 'select')?.map(item => `${item.name}Options`) ?? []
    const dictBlocks = Array.from(new Set([...formDicts, ...tableDicts]))

    const formItems = pageConfig.formItems?.map(item => {
        if (item.type === 'text') {
            delete item.type
        }
        return {
            ...item,
            ...(item.type === 'select' ? { options: `_CODE_${item.name}Options_CODE_` } : {})
        }
    })

    const processedColumns = columns?.map(col => {
        if (col.type === 'text') {
            delete col.type
        }
        if (['image'].includes(col.type)) {
            return { ...col, renderAction: true }
        }
        if (col.type && codePresets[col.type]) {
            const renderCode = typeof codePresets[col.type] === 'function' ? codePresets[col.type](col.dataIndex) : codePresets[col.type]
            return { ...col, render: `_CODE_${renderCode}_CODE_` }
        }
        return col
    })

    return { formItems, dictBlocks, processedColumns }
}

const generateSmartImports = ({ module, hasTabs, bodyCode, hasFormItems }) => {

    const hooksLib = ['useTableQuery']
    const utilsLib = ['timeRender', 'moneyRender']
    const reactLib = ['useState', 'useEffect', 'useRef', 'useMemo']
    const componentsLib = ['MyTable', 'MyImage', 'MyModalForm', 'MySearchForm']
    const antdLib = ['Tag', 'Card', 'Badge', 'Space', 'Modal', 'Alert', 'Image', 'Table', 'Input', 'Select', 'Button']

    const usedAntd = antdLib.filter(name => new RegExp(`\\b${name}\\b`).test(bodyCode))
    const usedUtils = utilsLib.filter(name => new RegExp(`\\b${name}\\b`).test(bodyCode))
    const usedHooks = hooksLib.filter(name => new RegExp(`\\b${name}\\b`).test(bodyCode))
    const usedReact = reactLib.filter(name => new RegExp(`\\b${name}\\b`).test(bodyCode))
    const usedComps = componentsLib.filter(name => new RegExp(`\\b${name}\\b`).test(bodyCode))

    const imports = [
        usedReact.length && `import { ${usedReact.join(', ')} } from 'react'`,
        usedAntd.length && `import { ${hasFormItems && module === 'index' ? 'Form, ' : ''}${usedAntd.join(', ')} } from 'antd'`,
        ...usedHooks.map(hook => `import { ${hook} } from '../../hooks/${hook}'`),
        ...usedComps.map(comp => `import { ${comp} } from '../../components/${comp}'`),
        ...(module === 'index' ? [
            `import { request } from '../../utils/request'`,
            `import { formatQuery } from '../../utils/utils'`,
            `import { ${hasTabs ? 'tabs, ' : ''}${hasFormItems ? 'formItems, ' : ''}modalItems, tableColumns} from './resource'`
        ] : [
            usedUtils.length && `import { ${usedUtils.join(', ')} } from '../../utils/utils'`
        ]),
    ].sort((a, b) => a.length - b.length)

    return imports.filter(Boolean).join('\n')
}

const contextStringify = ({ context, indent = 4, maxLength = 200 }) => stringify.default(context, { indent, maxLength })

module.exports = {
    cleanCode,
    contextStringify,
    generateSmartImports,
    formatFormItemAndColumns,
}
