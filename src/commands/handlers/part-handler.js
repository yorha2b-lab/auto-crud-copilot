const fs = require('fs')
const ora = require('ora')
const chalk = require('chalk')
const stringify = require('json-stringify-pretty-compact')

module.exports = async (filePath, context) => {

    const { language, partPrompt, recognizePage } = context

    const startTime = Date.now()

    const spinner = ora({
        text: chalk.cyan(language(
            `[System] 侦测到局部视觉样本。正在执行“碎片构筑协议”...`,
            `[System] Partial visual sample detected. Executing "Fragment Construction Protocol"...`
        )),
        color: 'cyan'
    }).start()

    try {
        spinner.text = chalk.cyan(language(
            `🤖 Pod 042: 正在从神经云网络提取 UI 元数据...`,
            `🤖 Pod 042: Extracting UI metadata from neural cloud network...`
        ))

        const pageConfig = await recognizePage(partPrompt, filePath)

        const optionDict = pageConfig.optionDict || {}
        delete pageConfig.optionDict

        let mainConfigStr = stringify.default(pageConfig, { indent: 4, maxLength: 200 })
            .replace(/"(\w+)":/g, '$1:') // 去掉 key 的双引号
            .replace(/"/g, "'")           // 全量替换为单引号
            .replace(/['"]_CODE_([\s\S]*?)_CODE_['"]/g, '$1') // 还原代码片段
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

        spinner.stop()

        console.log(chalk.magenta(`\n┌────────────────── [ YoRHa Construction Output ] ──────────────────┐`))
        console.log(chalk.gray(`│ Source: ${filePath}`))
        console.log(chalk.gray(`│ Protocol: Partial UI Fragment | Status: SUCCESS`))
        console.log(chalk.magenta(`├────────────────────────────────────────────────────────────────────┘`))
        console.log(chalk.white(finalResult))
        console.log(chalk.magenta(`┌────────────────────────────────────────────────────────────────────┐`))
        console.log(chalk.green(language(
            `│ 🤖 Pod 042 报告：局部构筑达成。耗时: ${(endTime - startTime) / 1000}s`,
            `│ 🤖 Pod 042 Report: Partial construction achieved. Elapsed: ${(endTime - startTime) / 1000}s`
        )))
        console.log(chalk.green(language(
            `│ 命令：请手动将上述代码块物理装配至您的目标文件中。`,
            `│ Command: Please manually assemble the above code block into your target file.`
        )))
        console.log(chalk.magenta(`└────────────────────────────────────────────────────────────────────┘\n`))

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
        }

    } catch (error) {
        spinner.fail(chalk.red(language(
            `🤖 Pod 042: [警告] 碎片构筑失败。系统检测到逻辑干扰：${error}`,
            `🤖 Pod 042: [Warning] Fragment construction failed. Logic interference detected: ${error}`
        )))
    }
}