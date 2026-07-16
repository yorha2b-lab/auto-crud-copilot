/**
 * Auto CRUD Copilot - YoRHa Bunker Construction System
 *
 */

/**
 * 清理大模型生成的代码
 * 大模型输出的标准 JSON 无法携带 render: (text) => <Tag> 等箭头函数。
 * 我们在 Prompt 中要求大模型用 _CODE_ 占位符包裹函数字符串，
 * 在此处用正则剥离外层的双引号和占位符，将其还原为真正的可执行 JS 代码。
 * @param {string} str - 大模型返回的 JSON 字符串
 * @returns {string} 清理后的可执行 JS 代码
 */
const cleanCode = str => {
    return str
        // 物理超度 Markdown 糖衣（解决```json 报错）
        .replace(/```[a-z]*\n?/gi, '')
        .replace(/```/g, '')
        // 逻辑自愈 处理 AI 错误转义的引号（把 \" 还原回 "）
        .replace(/\\"/g, '"')
        .replace(/['"]?_CODE_([\s\S]*?)_CODE_['"]?/g, '$1') // 去掉 _CODE_ 包裹的代码
        .replace(/_CODE_/g, '')      // 兜底清理
        .replace(/"(\w+)":/g, '$1:') // 去掉 key 的双引号
        .replace(/"/g, "'")          // 双引号全部转单引号
        .replace(/[ \t]+$/gm, '')    // 去除每一行行尾的多余空格
        .replace(/\n{3,}/g, '\n\n')  // 将3个或以上的换行符压缩成2个换行符
        .replace(/^\s+/, '')         // 去掉文件头部的空行
        .trim() + '\n'
}

/**
 * @function unwrapSignal
 * @description [地堡数据脱水机] 物理扫描 JSON 结构，剥离业务外壳（code/msg/total 等）。
 * 目标：精准定位到核心的 Array。
 */
const unwrapSignal = json => {
    if (Array.isArray(json)) return json

    // 💡 扫描常见的数据仓库 Key
    const dataKeys = ['data', 'list', 'items', 'datas', 'rows', 'result', 'payload', 'results', 'dataList']
    for (const key of dataKeys) {
        if (json[key] && Array.isArray(json[key])) return json[key]
    }

    // 💡 递归侦察：处理 data: { list: [...] } 这种二级套娃
    for (const key in json) {
        if (json[key] && typeof json[key] === 'object') {
            const nested = unwrapSignal(json[key])
            if (Array.isArray(nested)) return nested
        }
    }
    return null
}

/**
 * @function createTaskQueue
 * @description [任务队列] 创建一个并发任务队列，用于处理异步任务。
 * @param {number} concurrency - 并发任务数，默认 1。
 */
const createTaskQueue = (concurrency = 1) => {

    let running = 0
    let queue = []
    let onIdleCallback = null

    const next = async () => {

        if (running >= concurrency || queue.length === 0) return

        const task = queue.shift()
        running++

        try {
            await task()
        } catch (err) {
            console.error('任务执行异常:', err)
        } finally {
            running--
            next()
            if (running === 0 && queue.length === 0 && onIdleCallback) {
                onIdleCallback()
            }
        }
    }

    return {
        add: (task) => {
            queue.push(task)
            next()
        },
        onIdle: (callback) => {
            onIdleCallback = callback
        }
    }
}

/**
 * @function isQuerySignal
 * @description [语义雷达]
 * 核心逻辑：不纠结请求是怎么发的，只看带回来的货（Response）长什么样。
 */
const isQuerySignal = (req, json, coreData) => {

    const url = req.url.toLowerCase()
    // 💡 1. 物理红区：只要 URL 包含这些动作，无论返回什么都视为“非列表”
    const actionKeywords = ['add', 'delete', 'update', 'save', 'remove', 'edit', 'insert', 'create', 'export', 'upload']
    if (actionKeywords.some(key => url.includes(key))) return false
    // 💡 2. 物理金标准：脱壳后的核心物资是一个【非空数组】
    // 只要带回了一堆长得一样的对象，那它 99.9% 就是列表页
    const hasListData = Array.isArray(coreData) && coreData.length > 0
    // 💡 3. 语义辅助：如果响应里包含“分页指纹”
    // 有时候第一页刚好没数据（coreData 是空数组），但 JSON 里带有 total, page 等字段
    const hasPaginationFingerprint = ['total', 'records', 'page', 'size', 'count'].some(key => {
        const k = key.toLowerCase()
        // 在原始 JSON 的第一层寻找分页相关的 key
        return Object.keys(json).some(rawKey => rawKey.toLowerCase().includes(k))
    })
    // 结论：具备列表特征或者是分页指纹的，判定为查询信号
    return hasListData || hasPaginationFingerprint
}

/**
 * @function formatFormItemAndColumns
 * @description [地堡逻辑转录引擎] 执行核心的语义对齐与代码物理注入协议。
 * 该函数负责将 AI 识别出的视觉类型标签（money/date/enum等）转化为标准的 React 渲染逻辑，
 * 并自动提取全频道所需的字典引用（Dictionary Blocks）。
 *
 * @param {Object} params - 构筑参数包
 * @param {Object} params.pageConfig - 由 Pod 042 扫描出的原始页面配置对象
 *
 * @returns {Object} 返回物理装配完成的数据包：
 * @returns {Array} .formItems - 已注入 Options 指令的表单零部件清单
 * @returns {Array} .processedColumns - 已执行逻辑注入（Render 补丁）的表格列清单
 * @returns {Array} .dictBlocks - 全频道去重后的字典（Options）变量名清单
 */
const formatFormItemAndColumns = ({ pageConfig }) => {

    const codePresets = {
        money: 'text => moneyRender(text)',
        date: 'text => timeRender({time: text})',
        index: '(_, record, index) => index + 1',
        tag: `text => <Tag color='magenta'>{text}</Tag>`,
        badge: `text => <Badge status='success' text={text} />`,
        enum: dataIndex => `text => ${dataIndex}Options.find(item => item.value === text)?.label??text`,
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
            // 💡 物理注入：根据标签，强行塞入标准化的 JS 代码字符串
            const renderCode = typeof codePresets[col.type] === 'function' ? codePresets[col.type](col.dataIndex) : codePresets[col.type]
            return {
                ...col,
                render: `_CODE_${renderCode}_CODE_` // 重新打标，交给 cleanCode 处理
            }
        }
        return col
    })

    return { formItems, dictBlocks, processedColumns }
}

/**
 * 生成智能导入语句
 * 根据代码中实际使用的依赖，自动生成对应的 import 语句
 * @param {string} codeStr - 生成的代码字符串
 * @param {boolean} hasTabs - 是否包含标签页
 * @returns {string} 拼接后的 import 语句
 */
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

module.exports = { cleanCode, unwrapSignal, isQuerySignal, createTaskQueue, generateSmartImports, formatFormItemAndColumns }
