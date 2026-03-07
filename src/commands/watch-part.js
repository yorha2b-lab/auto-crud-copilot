/**
 * 监听截图并生成局部 UI 组件的命令模块
 * 
 * 此模块实现以下功能：
 * 1. 监听 screenPart 目录下的截图文件
 * 2. 使用 AI 识别截图中的局部 UI 组件结构
 * 3. 生成组件配置代码和选项数据
 */

const fs = require('fs')
const chokidar = require('chokidar')
const partPrompt = require('../prompts/watch-part.js')
const { recognizePage } = require('../services/llm.js')
const stringify = require('json-stringify-pretty-compact')

/**
 * 监听截图并生成局部 UI 组件
 */
const watchPart = () => {
    // 设置文件监听器，监听 screenPart 目录
    const watcher = chokidar.watch('./screenPart', {
        persistent: true,
        ignored: /(^|[\/\\])\../,
        awaitWriteFinish: {
            stabilityThreshold: 500,
            pollInterval: 100
        }
    })

    // 当检测到新文件时，处理组件识别
    watcher.on('add', async filePath => {
        try {
            const startTime = Date.now()
            console.log(`🚀 检测到新图片: 开始识别...`)
            
            // 使用 AI 识别组件结构
            const pageConfig = await recognizePage(partPrompt, filePath)
            
            // 提取选项字典
            const optionDict = pageConfig.optionDict || {}
            delete pageConfig.optionDict
            
            // 格式化主配置字符串
            let mainConfigStr = stringify.default(pageConfig, { indent: 4, maxLength: 200 })
                .replace(/"(\w+)":/g, '$1:')
                .replace(/"/g, "'")
                .replace(/['"]_CODE_([\s\S]*?)_CODE_['"]/g, '$1')
                .replace(/_CODE_/g, '')
            
            // 生成选项代码字符串
            let optionsCodeStr = ''
            Object.keys(optionDict).forEach(key => {
                const varName = key.replace('_CODE_', '')
                const optionsArray = optionDict[key]
                const arrayItemsStr = optionsArray.map(opt => `    { label: '${opt.label}', value: '${opt.value}' }`).join(',\n')
                optionsCodeStr += `\nexport const ${varName} = [\n${arrayItemsStr}\n]\n`
            })
            
            // 合并最终结果
            const finalResult = `${mainConfigStr}\n${optionsCodeStr}`
            const endTime = Date.now()
            
            // 输出识别结果
            console.log(`🎉 识别完成！耗时 ${(endTime - startTime) / 1000} 秒\n================\n\n${finalResult}\n\n================`)
        } catch (error) {
            console.error('识别图片失败', error)
        } finally {
            // 处理完成后删除截图文件
            fs.unlinkSync(filePath)
        }
    })
}

module.exports = watchPart
