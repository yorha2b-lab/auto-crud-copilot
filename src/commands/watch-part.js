const fs = require('fs')
const chokidar = require('chokidar')
const partPrompt = require('../prompts/watch-part.js')
const { recognizePage } = require('../services/llm.js')
const stringify = require('json-stringify-pretty-compact')

const watchPart = () => {
    const watcher = chokidar.watch('./screenPart', {
        persistent: true,
        ignored: /(^|[\/\\])\../,
        awaitWriteFinish: {
            stabilityThreshold: 500,
            pollInterval: 100
        }
    })
    watcher.on('add', async filePath => {
        try {
            const startTime = Date.now()
            console.log(`🚀 检测到新图片: 开始识别...`)
            const pageConfig = await recognizePage(partPrompt, filePath)
            const optionDict = pageConfig.optionDict || {}
            delete pageConfig.optionDict
            let mainConfigStr = stringify.default(pageConfig, { indent: 4, maxLength: 200 })
                .replace(/"(\w+)":/g, '$1:')
                .replace(/"/g, "'")
                .replace(/['"]_CODE_([\s\S]*?)_CODE_['"]/g, '$1')
                .replace(/_CODE_/g, '')
            let optionsCodeStr = ''
            Object.keys(optionDict).forEach(key => {
                const varName = key.replace('_CODE_', '')
                const optionsArray = optionDict[key]
                const arrayItemsStr = optionsArray.map(opt => `    { label: '${opt.label}', value: '${opt.value}' }`).join(',\n')
                optionsCodeStr += `\nexport const ${varName} = [\n${arrayItemsStr}\n]\n`
            })
            const finalResult = `${mainConfigStr}\n${optionsCodeStr}`
            const endTime = Date.now()
            console.log(`🎉 识别完成！耗时 ${(endTime - startTime) / 1000} 秒\n================\n\n${finalResult}\n\n================`)
        } catch (error) {
            console.error('识别图片失败', error)
        } finally {
            fs.unlinkSync(filePath)
        }
    })
}

module.exports = watchPart
