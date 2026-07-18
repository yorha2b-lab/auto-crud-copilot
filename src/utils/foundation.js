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
const stringify = require('json-stringify-pretty-compact')


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
 * 复制模板目录到目标项目
 * @param {string} template - 框架名称
 * @param {string} templateSubDir - 模板子目录（如 'hooks'、'components'）
 * @param {string} targetSubDir - 目标子目录（如 'src/hooks'、'src/components'）
 */
const copyTemplateDir = (template, templateSubDir, targetSubDir) => {
    const targetDir = path.join(process.cwd(), targetSubDir)
    const sourceDir = path.join(__dirname, `../framework/${template}/${templateSubDir}`)
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

module.exports = { getConfig, getExistingMenus, copyTemplateDir, contextStringify }
