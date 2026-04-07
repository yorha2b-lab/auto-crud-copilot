const fs = require('fs')
const ora = require('ora')
const chalk = require('chalk')
const chokidar = require('chokidar')
const stringify = require('json-stringify-pretty-compact')

const watchPart = options => {

    const { language, checkPromptPath } = require('../utils/utils.js')

    const promptPath = `../prompts/${options.template}/watch-part.js`

    checkPromptPath(promptPath)
    const partPrompt = require(promptPath)
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
        // 使用 language 函数包装 Pod 报告
        const spinner = ora(chalk.cyan(language(
            `🤖 Pod 042: [报告] 捕获到新的视觉图像，开始执行构筑程序...`,
            `🤖 Pod 042: [Report] Captured new visual image. Initializing construction...`
        )))
        spinner.start()

        try {
            const startTime = Date.now()
            const pageConfig = await recognizePage(partPrompt, filePath)

            const optionDict = pageConfig.optionDict || {}
            delete pageConfig.optionDict

            // 处理配置字符串映射
            let mainConfigStr = stringify.default(pageConfig, { indent: 4, maxLength: 200 })
                .replace(/"(\w+)":/g, '$1:')
                .replace(/"/g, "'")
                .replace(/['"]_CODE_([\s\S]*?)_CODE_['"]/g, '$1')
                .replace(/_CODE_/g, '')

            let optionsCodeStr = ''
            Object.keys(optionDict).forEach(key => {
                const varName = key.replaceAll('_CODE_', '')
                const optionsArray = optionDict[key]
                const arrayItemsStr = optionsArray.map(opt => `    { label: '${opt.label}', value: '${opt.value}' }`).join(',\n')
                optionsCodeStr += `\nexport const ${varName} = [\n${arrayItemsStr}\n]\n`
            })

            const finalResult = `${mainConfigStr}\n${optionsCodeStr}`
            const endTime = Date.now()

            // 成功报告
            spinner.succeed(language(
                `🤖 Pod 042: [报告] 识别程序结束！耗时 ${(endTime - startTime) / 1000} 秒\n================\n\n${finalResult}\n\n================`,
                `🤖 Pod 042: [Report] Recognition complete! Elapsed time: ${(endTime - startTime) / 1000}s\n================\n\n${finalResult}\n\n================`
            ))
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
            }
        } catch (error) {
            // 失败报告
            spinner.fail(chalk.red(language(
                `🤖 Pod 042: [警告] 识别程序失败。原因：${error}`,
                `🤖 Pod 042: [Warning] Recognition failed. Reason: ${error}`
            )))
        }
    })
}

module.exports = watchPart