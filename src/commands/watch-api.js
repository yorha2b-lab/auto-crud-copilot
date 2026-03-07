/**
 * 监听 Swagger 文档并自动对齐前后端字段的命令模块
 *
 * 此模块实现以下功能：
 * 1. 监听 swagger 目录下的 API 文档文件
 * 2. 使用 AI 比对前端猜测的字段名和后端真实的字段名
 * 3. 自动更新前端代码以匹配后端 API 字段
 */

const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const config = require('../../config.js')
const { alignSwaggerFields } = require('../services/llm.js')

/**
 * 监听 Swagger 文档并自动对齐前后端字段
 */
const watchApi = () => {
    // 设置文件监听器，监听 swagger 目录
    const watcher = chokidar.watch('./swagger', {
        persistent: true,
        ignored: /(^|[\/\\])\../,
        awaitWriteFinish: {
            stabilityThreshold: 500,
            pollInterval: 100
        }
    })

    // 当检测到新文件时，处理 API 对齐
    watcher.on('add', async filePath => {
        const startTime = Date.now()
        const fileName = path.basename(filePath, path.extname(filePath))
        console.log(`🚀 检测到新文件: ${fileName}, 开始识别...`)

        try {
            // 读取 Swagger 文档和前端资源文件
            const swaggerStr = fs.readFileSync(filePath, 'utf8')
            let resourceStr = fs.readFileSync(`./${config.pagesDir}/${fileName}/resource.js`, 'utf8')

            // 使用 AI 对齐字段
            const result = await alignSwaggerFields(swaggerStr, resourceStr)

            // 根据对齐结果更新前端代码
            Object.entries(result).forEach(([oldField, newField]) => {
                if (oldField === newField) return
                const regex = new RegExp(`(dataIndex|name)\\s*:\\s*['"]${oldField}['"]`, 'g')
                resourceStr = resourceStr.replace(regex, `$1: '${newField}'`)
            })

            // 写入更新后的资源文件
            fs.writeFileSync(path.join(`./${config.pagesDir}/${fileName}/resource.js`), resourceStr.replace(/"(\w+)":/g, '$1:').replace(/"/g, "'"))

            const endTime = Date.now()
            //fs.unlinkSync(filePath) // 可选：处理完成后删除文件
            console.log(`识别完成：耗时 ${(endTime - startTime) / 1000} 秒`)
        } catch (error) {
            console.error(`识别 ${fileName} 失败：`, error)
        }
    })
}

module.exports = watchApi
