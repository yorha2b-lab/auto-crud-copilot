/**
 * This file is part of AutoDev.
 * AutoDev is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 */

const fs = require('fs')
const path = require('path')
const { Segment, useDefault } = require('segmentit')
const stringify = require('json-stringify-pretty-compact')
const segmentit = useDefault(new Segment())

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
 * @function getSemanticKeywords
 * @description [语义精炼厂 2.0] 使用 segmentit 引擎进行物理切片。
 */
const getSemanticKeywords = text => {
    // 💡 物理脱水：确保输入为纯净字符串
    const content = Array.isArray(text) ? text.join(' ') : (text || '')
    // 💡 执行分词
    const result = segmentit.doSegment(content, {
        simple: true, // 开启简易模式，提升吞吐效率
        stripPunctuation: true // 物理过滤掉所有的标点符号
    })
    // 💡 提取词条并执行“基因筛选”
    return Array.from(new Set(result.filter(word => word.length >= 2 && !/^[0-9]+$/.test(word))))
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
 * @function getLocalScore
 * @description [战力评估协议] 计算语义重合度。
 */
const getLocalScore = (api, pageKeywords, moduleName) => {
    let score = 0
    const path = api.path.toLowerCase()
    const desc = api.desc.toLowerCase()
    const mod = moduleName.toLowerCase()

    // 💡 权重 A：路径直接包含模块名 (暴击加分 +50)
    if (path.includes(mod)) score += 50

    // 💡 权重 B：描述包含模块核心词 (中量加分 +10)
    pageKeywords.forEach(word => {
        if (desc.includes(word.toLowerCase())) score += 10
        if (path.includes(word.toLowerCase())) score += 5
    })

    return score
}

/**
 * 复制模板目录到目标项目
 * @param {Object} options - 命令行选项
 * @param {string} templateSubDir - 模板子目录（如 'hooks'、'components'）
 * @param {string} targetSubDir - 目标子目录（如 'src/hooks'、'src/components'）
 */
const copyTemplateDir = (options, templateSubDir, targetSubDir) => {
    const targetDir = path.join(process.cwd(), targetSubDir)
    const sourceDir = path.join(__dirname, `../framework/${options.template}/${templateSubDir}`)
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

const contextStringify = ({ context, indent = 4, maxLength = 200 }) => stringify.default(context, { indent, maxLength })

module.exports = { getConfig, getLocalScore, getExistingMenus, copyTemplateDir, contextStringify, getSemanticKeywords }
