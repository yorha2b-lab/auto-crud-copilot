const fs = require('fs')
const ora = require('ora')
const path = require('path')
const chalk = require('chalk')
const chokidar = require('chokidar')

const watchApi = options => {
    // 导入配置文件和多语言函数
    const { getConfig, language } = require('../utils/utils.js')
    const { alignResponseFields } = require('../services/llm.js')

    const config = getConfig()

    const watcher = chokidar.watch('./response', {
        persistent: true,
        ignored: /(^|[\/\\])\../,
        awaitWriteFinish: {
            stabilityThreshold: 500,
            pollInterval: 100
        }
    })

    watcher.on('add', async filePath => {
        const startTime = Date.now()
        const fileName = path.basename(filePath, path.extname(filePath))

        // 使用 language 函数包装 Pod 153 的启动报告
        const spinner = ora(chalk.cyan(language(
            `🤖 Pod 153: [报告] 侦测到未知的 Response 数据源 [${fileName}]，开始进行语义对齐...`,
            `🤖 Pod 153: [Report] Detected unknown Response data source [${fileName}]. Commencing semantic alignment...`
        )))
        spinner.start()

        try {
            const responseStr = fs.readFileSync(filePath, 'utf8')
            let resourceStr = fs.readFileSync(`./${config.pagesDir}/${fileName}/resource.js`, 'utf8')

            // 调用 AI 服务进行字段对齐
            const result = await alignResponseFields(options, responseStr, resourceStr)

            Object.entries(result).forEach(([oldField, newField]) => {
                if (oldField === newField) return
                const regex = new RegExp(`(dataIndex|name)\\s*:\\s*['"]${oldField}['"]`, 'g')
                resourceStr = resourceStr.replace(regex, `$1: '${newField}'`)
            })

            fs.writeFileSync(path.join(`./${config.pagesDir}/${fileName}/resource.js`), resourceStr)
            const endTime = Date.now()

            // 成功报告：带上 9S 的骇客梗
            spinner.succeed(chalk.green(language(
                `🤖 Pod 153: [肯定] 字段对齐协议执行完毕：耗时 ${(endTime - startTime) / 1000} 秒。9S 的骇客任务很顺利。`,
                `🤖 Pod 153: [Affirmative] Field alignment protocol executed. Time: ${(endTime - startTime) / 1000}s. 9S's hacking mission was successful.`
            )))
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
            }
        } catch (error) {
            // 失败报告：提到“防火墙”
            spinner.fail(chalk.red(language(
                `🤖 Pod 153: [警告] 骇入 [${fileName}] 失败。接口数据遭遇强力防火墙：${error}`,
                `🤖 Pod 153: [Warning] Hacking into [${fileName}] failed. Encountered a powerful firewall in API data: ${error}`
            )))
        }
    })
}

module.exports = watchApi