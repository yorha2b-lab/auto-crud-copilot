const fs = require('fs')
const ora = require('ora')
const path = require('path')
const chalk = require('chalk')

module.exports = async (filePath, context) => {

    const { config, options, language, alignResponseFields } = context

    const startTime = Date.now()
    const fileName = path.basename(filePath, path.extname(filePath))
    const resourcePath = path.join(process.cwd(), config.pagesDir, fileName, 'resource.js')

    const spinner = ora({
        text: chalk.yellow(language(
            `🤖 Pod 153: [侦察] 发现加密数据源 [${fileName}]。正在尝试执行语义对齐协议...`,
            `🤖 Pod 153: [Recon] Encrypted data source [${fileName}] detected. Initiating semantic alignment...`
        )),
        color: 'yellow'
    }).start()

    try {
        if (!fs.existsSync(resourcePath)) {
            throw new Error(language(
                `地堡数据库中未检索到模块 [${fileName}] 的资源文件。请先执行视觉构筑。`,
                `Module [${fileName}] resource not found in Bunker database. Please execute visual construction first.`
            ))
        }

        const responseRaw = fs.readFileSync(filePath, 'utf8')
        let responseStr = responseRaw
        let resourceStr = fs.readFileSync(resourcePath, 'utf8')

        try {
            const parsed = JSON.parse(responseRaw)
            const normalizedData = Array.isArray(parsed) ? parsed : [parsed]
            responseStr = JSON.stringify(normalizedData.slice(0, 1))
        } catch (e) {
            console.log(chalk.gray(language(
                ` [System] 数据格式非标准 JSON，将尝试原始字符对齐。`,
                ` [System] Data format is not standard JSON, will try to align by character.`)
            ))
        }

        spinner.text = chalk.yellow(language(
            `🧑‍💻 9S: 正在扫描前后端字段差异... 执行语义桥接任务。`,
            `🧑‍💻 9S: Scanning field differences... Bridging semantic gaps.`
        ))

        const result = await alignResponseFields(options, responseStr, resourceStr)

        let changeCount = 0
        const resultMapping = {}
        Object.entries(result).forEach(([oldField, newField]) => {
            if (oldField === newField) return
            const regex = new RegExp(`(dataIndex|name)\\s*:\\s*['"]${oldField}['"]`, 'g')
            resourceStr = resourceStr.replace(regex, `$1: '${newField}'`)
            changeCount++
            resultMapping[oldField] = newField
        })

        fs.writeFileSync(resourcePath, resourceStr)
        const endTime = Date.now()

        spinner.succeed(chalk.green(language(
            `🤖 Pod 153: [肯定] 结果映射完成${JSON.stringify(resultMapping)}。已更正 ${changeCount} 处语义偏差。耗时: ${(endTime - startTime) / 1000}s`,
            `🤖 Pod 153: [Affirmative] Result mapping completed${JSON.stringify(resultMapping)}. Corrected ${changeCount} semantic deviations. Elapsed: ${(endTime - startTime) / 1000}s`
        )))

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
        }

    } catch (error) {
        spinner.fail(chalk.red(language(
            `🤖 Pod 153: [严重警告] 信号对齐失败。接口数据遭遇强力防火墙：${error}`,
            `🤖 Pod 153: [CRITICAL] Alignment failed. Encountered powerful API firewall: ${error}`
        )))
    }
}