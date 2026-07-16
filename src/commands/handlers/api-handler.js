module.exports = async (filePath, liveResponse = null) => {

    const fs = require('fs')
    const ora = require('ora')
    const path = require('path')
    const chalk = require('chalk')

    const {
        unwrapSignal,
        config, language,
        alignResponseFields
    } = require('../../core/context').get()

    const { pagesDir } = config

    const startTime = Date.now()
    const fileName = liveResponse?.fileName ?? path.basename(filePath, path.extname(filePath))
    const resourcePath = path.join(process.cwd(), pagesDir, fileName, 'resource.js')

    const spinner = ora({
        text: chalk.yellow(language(
            `🤖 Pod 153: [侦察] 发现加密数据源 [${fileName}]。正在尝试执行语义对齐协议...\n`,
            `🤖 Pod 153: [Recon] Encrypted data source [${fileName}] detected. Initiating semantic alignment...\n`
        )),
        color: 'yellow'
    }).start()

    try {
        if (!fs.existsSync(resourcePath)) {
            throw new Error(language(
                `🤖 Pod 153: [警告] 地堡数据库中未检索到模块 [${fileName}] 的资源文件。请先执行视觉构筑。`,
                `🤖 Pod 153: [Warning] Module [${fileName}] resource not found in Bunker database. Please execute visual construction first.`
            ))
        }

        let rawJson = liveResponse ? liveResponse.data : JSON.parse(fs.readFileSync(filePath, 'utf8'))
        let resourceStr = fs.readFileSync(resourcePath, 'utf8')

        const coreArray = unwrapSignal(rawJson)

        if (!coreArray || coreArray.length === 0) {
            console.log(chalk.gray(language(
                ` [System] 数据格式非标准 JSON，将尝试原始字符对齐。`,
                ` [System] Data format is not standard JSON, will try to align by character.`)
            ))
        }

        const sampleData = coreArray && coreArray.length > 0 ? [coreArray[0]] : rawJson

        spinner.text = chalk.yellow(language(
            `🧑‍💻 9S: 正在扫描前后端字段差异... 执行语义桥接任务。`,
            `🧑‍💻 9S: Scanning field differences... Bridging semantic gaps.`
        ))

        const extractKeys = str => {
            const keys = []
            const regex = /(dataIndex|name)\s*:\s*['"]([^'"]+)['"]/g
            let match
            while ((match = regex.exec(str)) !== null) {
                keys.push(match[2])
            }
            return Array.from(new Set(keys))
        }

        const result = await alignResponseFields({ responseStr: JSON.stringify(sampleData), resourceStr: extractKeys(resourceStr).join(',') })
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
            `🤖 Pod 153: [肯定] 语义桥接协议执行完毕。已物理修正 ${changeCount} 处字段偏差。耗时: ${(endTime - startTime) / 1000}s`,
            `🤖 Pod 153: [Affirmative] Semantic bridge protocol complete. Corrected ${changeCount} field deviations. Elapsed: ${(endTime - startTime) / 1000}s`
        )))

        if (changeCount > 0) {
            console.log(chalk.magenta(`\n┌────── [ YoRHa Autonomous Backend Alignment ] ──────┐`))
            Object.entries(resultMapping).forEach(([oldField, newField]) => {
                // 💡 物理校准：计算空格数量，让箭头对齐在第 15 个字符位
                // 中文字符长度 * 2 是为了抵消它在终端占的双倍宽度
                const padding = ' '.repeat(Math.max(1, 15 - oldField.length * 2))
                console.log(
                    chalk.gray(` │  `) +
                    chalk.yellow(oldField) +
                    padding +
                    chalk.cyan(` ->  `) +
                    chalk.white(newField)
                )
            })
            console.log(chalk.magenta(`└───────────────────────────────────────────────────────┘\n`))
        }

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