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
        .replace(/"(\w+)":/g, '$1:') // 去掉 key 的双引号
        .replace(/"/g, "'")          // 双引号全部转单引号
        .replace(/['"]_CODE_([\s\S]*?)_CODE_['"]/g, '$1') // 去掉 _CODE_ 包裹的代码
        .replace(/_CODE_/g, '')      // 兜底清理
        .replace(/[ \t]+$/gm, '')    // 去除每一行行尾的多余空格
        .replace(/\n{3,}/g, '\n\n')  // 将3个或以上的换行符压缩成2个换行符
        .replace(/^\s+/, '')         // 去掉文件头部的空行
        .trim() + '\n'
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
 * 矩阵效果
 * 模拟数据物理封存过程中的矩阵效果
 * @param {number} duration - 持续时间（毫秒）
 * @returns {void}
 */
const matrixEffect = (duration = 1500) => {

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

    const width = process.stdout.columns || 80
    const endTime = Date.now() + duration

    const interval = setInterval(() => {
        if (Date.now() > endTime) {
            clearInterval(interval)
            console.log(chalk.white(' [System] ') + chalk.green(language('所有构筑数据已同步至 Bunker 存储节点。', 'All data synced to Bunker storage nodes.')))
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
                const color = Math.random() > 0.5 ? chalk.cyan : chalk.cyan.dim
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
 * 生成智能导入语句
 * 根据代码中实际使用的依赖，自动生成对应的 import 语句
 * @param {string} codeStr - 生成的代码字符串
 * @param {boolean} hasTabs - 是否包含标签页
 * @returns {string} 拼接后的 import 语句
 */
const generateSmartImports = (codeStr, hasTabs) => {
    const hooksLib = ['useTableQuery']
    const reactLib = ['useState', 'useEffect', 'useRef', 'useMemo']
    const componentsLib = ['MyTable', 'MyModalForm', 'MySearchForm']
    const antdLib = ['Card', 'Space', 'Modal', 'Button', 'Alert', 'Table', 'Input', 'Select']

    const usedAntd = antdLib.filter(name => new RegExp(`\\b${name}\\b`).test(codeStr))
    const usedHooks = hooksLib.filter(name => new RegExp(`\\b${name}\\b`).test(codeStr))
    const usedReact = reactLib.filter(name => new RegExp(`\\b${name}\\b`).test(codeStr))
    const usedComps = componentsLib.filter(name => new RegExp(`\\b${name}\\b`).test(codeStr))

    const imports = [
        usedReact.length && `import { ${usedReact.join(', ')} } from 'react'`,
        `import { request } from '../../utils/request'`,
        `import { formatQuery } from '../../utils/utils'`,
        `import { ${hasTabs ? 'tabs, ' : ''}columns, formItems, modalItems } from './resource'`,
        ...usedHooks.map(hook => `import { ${hook} } from '../../hooks/${hook}'`),
        ...usedComps.map(comp => `import { ${comp} } from '../../components/${comp}'`),
        usedAntd.length && `import { Form, ${usedAntd.join(', ')} } from 'antd'`
    ].sort((a, b) => a.length - b.length)

    return imports.filter(Boolean).join('\n')
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

module.exports = { language, getConfig, cleanCode, matrixEffect, bootSequence, getExistingMenus, copyTemplateDir, generateSmartImports }
