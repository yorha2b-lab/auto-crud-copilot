const fs = require('fs')
const ora = require('ora')
const path = require('path')
const chalk = require('chalk')
const chokidar = require('chokidar')

const watchApi = () => {

    const { getConfig } = require('../utils/utils.js')
    const { alignSwaggerFields } = require('../services/llm.js')

    const config = getConfig()

    const watcher = chokidar.watch('./swagger', {
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
        const spinner = ora(chalk.cyan(`🤖 Pod 153: [报告] 侦测到未知的 Swagger 数据源 [${fileName}]，开始进行语义对齐...`))
        spinner.start()

        try {
            const swaggerStr = fs.readFileSync(filePath, 'utf8')
            let resourceStr = fs.readFileSync(`./${config.pagesDir}/${fileName}/resource.js`, 'utf8')
            const result = await alignSwaggerFields(swaggerStr, resourceStr)
            Object.entries(result).forEach(([oldField, newField]) => {
                if (oldField === newField) return
                const regex = new RegExp(`(dataIndex|name)\\s*:\\s*['"]${oldField}['"]`, 'g')
                resourceStr = resourceStr.replace(regex, `$1: '${newField}'`)
            })
            fs.writeFileSync(path.join(`./${config.pagesDir}/${fileName}/resource.js`), resourceStr)
            const endTime = Date.now()
            //fs.unlinkSync(filePath)
            spinner.succeed(chalk.green(`🤖 Pod 153: [肯定] 字段对齐协议执行完毕：耗时 ${(endTime - startTime) / 1000} 秒。9S 的骇客任务很顺利。`))
        } catch (error) {
            console.log(chalk.red(`🤖 Pod 153: [警告] 骇入 [${fileName}] 失败。接口数据遭遇强力防火墙：${error}`))
        }
    })
}

module.exports = watchApi
