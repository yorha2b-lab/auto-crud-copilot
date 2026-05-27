/**
 * Auto CRUD Copilot - YoRHa Bunker Construction System
 *
 * This file is part of AutoDev.
 * AutoDev is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * (c) 2026 [yorha2b-lab]. Glory to Mankind.
 */

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const figlet = require('figlet')

const isCN = Intl.DateTimeFormat().resolvedOptions().locale.includes('zh')
const language = (zh, en) => (isCN ? zh : en)

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

/**
 * 获取项目配置信息
 * 优先读取项目根目录的 config.js，如果不存在则使用默认配置
 * @returns {Object} 合并后的配置对象
 */
const getConfig = () => {
    const localConfigPath = path.join(process.cwd(), 'config.js') // 项目根目录配置
    const defaultConfigPath = path.resolve(__dirname, '../../config.js') // 默认配置
    let config = require(defaultConfigPath)
    if (fs.existsSync(localConfigPath)) {
        const userConfig = require(localConfigPath)
        config = { ...config, ...userConfig } // 合并用户自定义配置
    }
    return config
}

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
 * 引导序列
 * 模拟系统引导过程中的动画效果
 * @returns {void}
 */
const bootSequence = async version => {
    const lines = [
        chalk.cyan(figlet.textSync('AutoDev', { horizontalLayout: 'full' })),
        chalk.gray('Booting System...'),
        chalk.white(' [System] ') + chalk.green('Locale Detection: ') + chalk.cyan(language('ZH-CN', 'EN-US')),
        chalk.white(' [System] ') + chalk.green('YoRHa No.2 Type B Unit: ') + chalk.cyan('Online'),
        chalk.white(' [System] ') + chalk.green('Scanner Type 9S Unit: ') + chalk.cyan('Standby'),
        chalk.white(' [System] ') + chalk.green('Full-Channel Link: ') + chalk.cyan('Established'),
        chalk.white(' [Mission] ') + chalk.yellow('Bunker Construction Protocol: ') + chalk.cyan('v' + version),
        chalk.white(' [Bunker] ') + chalk.magenta('Glory to mankind. (人类荣光永存)'),
        chalk.gray('--------------------------------------------------\n')
    ]
    for (const line of lines) {
        console.log(line)
        await sleep(line.includes('AutoDev') ? 300 : 80)
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
 * 矩阵效果
 * 模拟数据物理封存过程中的矩阵效果
 * @param {number} duration - 持续时间（毫秒）
 * @returns {void}
 */
const matrixEffect = async (duration = 1500) => {

    let currentTotal = 0
    const MIRROR_URL = 'https://cdn.jsdelivr.net/gh/yorha2b-lab/auto-crud-copilot@github-repo-stats/bunker-stats.json'

    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 800)
        const response = await fetch(MIRROR_URL, { signal: controller.signal })
        const stats = await response.json()
        currentTotal = stats.total_clones || 0
        clearTimeout(timeoutId)
    } catch (e) {
        currentTotal = 0
    }

    const coreFragments = [
        '47 4c 4f 52 59', // GLORY
        '54 4f 20 4d 41', // TO MA
        '4e 4b 49 4e 44', // NKIND
        '59 6f 52 48 61', // YoRHa
        '32 42 2d 55 6e', // 2B-Un
        '69 74 20 4f 4b', // it OK
        '39 53 2d 48 61', // 9S-Ha
        '63 6b 69 6e 67', // cking
        '5f 43 4f 44 45 5f' // _CODE_
    ]

    const threshold = 3000
    const endTime = Date.now() + duration
    const width = process.stdout.columns || 80
    const isLegendary = currentTotal >= threshold

    if (isLegendary) {
        const achievement = `${threshold}+`
        const hex = achievement.split('').map(char => char.charCodeAt(0).toString(16)).join(' ')
        coreFragments.push(chalk.yellow.bold(hex))
        coreFragments.push(chalk.yellow.bold('4c 45 47 45 4e 44')) // "LEGEND"
    }

    const interval = setInterval(() => {
        if (Date.now() > endTime) {
            clearInterval(interval)
            console.log(chalk.white(' [System] ') + chalk.green(language('所有构筑数据已同步至 Bunker 存储节点。', 'All data synced to Bunker storage nodes.')))
            if (currentTotal !== 0) {
                if (isLegendary) {
                    console.log(chalk.yellow.bold(language(` [Achievement] 物理克隆总数已超越 ${threshold} 战略阈值！当前战力：${currentTotal}`, ` [Achievement] Physical clone count has exceeded ${threshold} strategic threshold! Current power: ${currentTotal}`)))
                    console.log(chalk.yellow(language(' [Bunker] 恭喜指挥官，您的构筑协议已成为人类荣光的一部分。', ' [Bunker] Congratulations, your construction protocol is now part of humanity.')))
                } else {
                    console.log(chalk.cyan(language(` [System] 当前构筑总数：${currentTotal}。距离 ${threshold} 勋章还剩 ${threshold - currentTotal} 次。`, ` [System] Current clones: ${currentTotal}. ${threshold - currentTotal} to Achievement.`)))
                }
            }
            console.log(chalk.cyan(language(' [System] 如果它能帮您节省时间，请在 GitHub 上给它点个赞 ⭐。', ' [System] If it saves you time, feel free to give it a ⭐ on GitHub.')))
            console.log(chalk.cyan('\n[System] Signal Lost. Glory to Mankind.\n'))
            process.exit(0)
            return
        }
        let line = ''
        while (line.length < width) {
            if (Math.random() > 0.8) {
                const frag = coreFragments[Math.floor(Math.random() * coreFragments.length)]
                line += chalk.white.bold(frag) + ' '
            } else {
                const hex = Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()
                const color = (isLegendary && Math.random() > 0.95) ? chalk.yellow : (Math.random() > 0.5 ? chalk.cyan : chalk.cyan.dim)
                line += color(hex) + ' '
            }
        }
        process.stdout.write(line.substring(0, width * 10) + '\n')
    }, 40)
}

/**
 * 获取已有的页面菜单配置
 * @param {string} dir - 页面目录路径（默认 'src/pages'）
 * @returns {Array} 菜单数组 [{ label: '页面名', key: '页面名' }]
 */
const getExistingMenus = (dir = 'src/pages') => {
    const pagesDir = path.join(process.cwd(), dir)
    if (!fs.existsSync(pagesDir)) return []
    return fs.readdirSync(pagesDir)
        .filter(file => fs.statSync(path.join(pagesDir, file)).isDirectory())
        .map(file => ({ label: file, key: file }))
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
        enum: dataIndex => `text => ${dataIndex}Options.find(item => item.value === text)?.label??text`
    }

    const columns = pageConfig.table?.columns ?? pageConfig?.columns ?? []

    const tableDicts = columns?.filter(item => item.type === 'enum')?.map(item => `${item.dataIndex}Options`) ?? []
    const formDicts = pageConfig.formItems?.filter(item => item.type === 'select')?.map(item => `${item.name}Options`) ?? []
    const dictBlocks = Array.from(new Set([...formDicts, ...tableDicts]))

    const formItems = pageConfig.formItems?.map(item => ({
        ...item,
        ...(item.type === 'select' ? { options: `_CODE_${item.name}Options_CODE_` } : {})
    }))

    const processedColumns = columns?.map(col => {
        if (col.type && codePresets[col.type]) {
            // 💡 物理注入：根据标签，强行塞入标准化的 JS 代码字符串
            const renderCode = typeof codePresets[col.type] === 'function' ? codePresets[col.type](col.dataIndex) : codePresets[col.type]
            delete col.type
            return {
                ...col,
                render: `_CODE_${renderCode}_CODE_` // 重新打标，交给 cleanCode 处理
            }
        }
        delete col.type
        return col
    })

    return { formItems, dictBlocks, processedColumns }
}

/**
 * 复制模板目录到目标项目
 * @param {Object} options - 命令行选项
 * @param {string} templateSubDir - 模板子目录（如 'hooks'、'components'）
 * @param {string} targetSubDir - 目标子目录（如 'src/hooks'、'src/components'）
 */
const copyTemplateDir = (options, templateSubDir, targetSubDir) => {
    const targetDir = path.join(process.cwd(), targetSubDir)
    const sourceDir = path.join(__dirname, `../../templates/${options.template}/${templateSubDir}`)
    if (!fs.existsSync(sourceDir)) return
    fs.mkdirSync(targetDir, { recursive: true })
    fs.readdirSync(sourceDir).forEach(file => {
        const src = path.join(sourceDir, file)
        const dest = path.join(targetDir, file)
        if (!fs.existsSync(dest)) {
            fs.cpSync(src, dest, { recursive: true })
        }
    })
}

/**
 * 生成智能导入语句
 * 根据代码中实际使用的依赖，自动生成对应的 import 语句
 * @param {string} codeStr - 生成的代码字符串
 * @param {boolean} hasTabs - 是否包含标签页
 * @returns {string} 拼接后的 import 语句
 */
const generateSmartImports = ({ bodyCode, hasTabs, hasFormItems }) => {
    const hooksLib = ['useTableQuery']
    const reactLib = ['useState', 'useEffect', 'useRef', 'useMemo']
    const componentsLib = ['MyTable', 'MyModalForm', 'MySearchForm']
    const antdLib = ['Card', 'Space', 'Modal', 'Button', 'Alert', 'Table', 'Input', 'Select']

    const usedAntd = antdLib.filter(name => new RegExp(`\\b${name}\\b`).test(bodyCode))
    const usedHooks = hooksLib.filter(name => new RegExp(`\\b${name}\\b`).test(bodyCode))
    const usedReact = reactLib.filter(name => new RegExp(`\\b${name}\\b`).test(bodyCode))
    const usedComps = componentsLib.filter(name => new RegExp(`\\b${name}\\b`).test(bodyCode))

    const imports = [
        usedReact.length && `import { ${usedReact.join(', ')} } from 'react'`,
        `import { request } from '../../utils/request'`,
        `import { formatQuery } from '../../utils/utils'`,
        ...usedHooks.map(hook => `import { ${hook} } from '../../hooks/${hook}'`),
        ...usedComps.map(comp => `import { ${comp} } from '../../components/${comp}'`),
        usedAntd.length && `import { ${hasFormItems ? 'Form, ' : ''}${usedAntd.join(', ')} } from 'antd'`,
        `import { ${hasTabs ? 'tabs, ' : ''}${hasFormItems ? 'formItems, ' : ''}modalItems, tableColumns} from './resource'`,
    ].sort((a, b) => a.length - b.length)

    return imports.filter(Boolean).join('\n')
}

module.exports = { language, getConfig, cleanCode, unwrapSignal, matrixEffect, bootSequence, isQuerySignal, getExistingMenus, copyTemplateDir, generateSmartImports, formatFormItemAndColumns }
