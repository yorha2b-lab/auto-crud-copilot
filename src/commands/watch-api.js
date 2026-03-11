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
        const spinner = ora(`🤖 Pod 042: 检测到新文件: ${fileName}, 开始识别...`)
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
            fs.writeFileSync(path.join(`./${config.pagesDir}/${fileName}/resource.js`), resourceStr.replace(/"(\w+)":/g, '$1:').replace(/"/g, "'"))
            const endTime = Date.now()
            //fs.unlinkSync(filePath)
            spinner.succeed(`🤖 Pod 042: 识别完成：耗时 ${(endTime - startTime) / 1000} 秒`)
        } catch (error) {
            console.log(chalk.red(`🤖 Pod 042: 识别 ${fileName} 失败失败：${error}`))
        }
    })
}

module.exports = watchApi
