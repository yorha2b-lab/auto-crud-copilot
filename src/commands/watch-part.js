const fs = require('fs')
const ora = require('ora')
const chalk = require('chalk')
const chokidar = require('chokidar')
const stringify = require('json-stringify-pretty-compact')

const watchPart = () => {

    const { recognizePage } = require('../services/llm.js')

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
            const spinner = ora(chalk.cyan(`🤖 Pod 042: [报告] 捕获到新的视觉图像，开始执行构筑程序...`))
            spinner.start()
            const partPrompt = require('../prompts/watch-part.js')
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
            spinner.succeed(`🤖 Pod 042: [报告] 识别程序结束！耗时 ${(endTime - startTime) / 1000} 秒\n================\n\n${finalResult}\n\n================`)
        } catch (error) {
            console.log(chalk.red(`🤖 Pod 042: [警告] 识别程序失败。原因：${error}`))
        } finally {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
            }
        }
    })
}

module.exports = watchPart
