const fs = require('fs')
const ora = require('ora')
const path = require('path')
const chalk = require('chalk')
const stringify = require('json-stringify-pretty-compact')

module.exports = async filePath => {

    const { get } = require('../../core/context')

    const {
        config, language, menus, options,
        pagePrompt, resourceTpl, indexTpl,
        recognizePage, generateMock, resource, index
    } = get()

    const startTime = Date.now()
    const fileName = path.basename(filePath, path.extname(filePath))
    const mockDir = path.join(process.cwd(), 'mock')
    const targetDir = path.join(process.cwd(), config.pagesDir, fileName)

    const spinner = ora({
        text: chalk.cyan(language(
            `[System] 视觉传感器捕捉完成: [${fileName}]。正在调配地堡资源进行物理构筑...\n`,
            `[System] Visual sensor captured: [${fileName}]. Allocating Bunker resources for physical construction...\n`
        )),
        color: 'cyan'
    }).start()

    try {

        if (fs.existsSync(targetDir)) {
            spinner.warn(chalk.yellow(language(
                `🤖 Pod 042: [拦截] 模块 [${fileName}] 已存在于地堡数据库中。为了防止数据覆盖，构筑协议已跳过。`,
                `🤖 Pod 042: [Intercept] Module [${fileName}] already exists. Construction skipped to prevent overwrite.`
            )))
            return
        }

        if (!fs.existsSync(mockDir)) fs.mkdirSync(mockDir, { recursive: true })
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true })

        let pageConfig
        if (config.useDemo) {
            console.log(chalk.yellow(language(
                `\n🤖 Pod 042: [报告] 拦截到实弹请求。正在空投标准模拟包: example.json\n`,
                `\n🤖 Pod 042: [Report] Real-fire request intercepted. Dropping simulation package: example.json\n`
            )))
            pageConfig = require('../../../example/example.json')
        } else {
            spinner.text = chalk.cyan(language(
                `🤖 Pod 042: 正在上传视觉元数据至司令部进行语义分析...\n`,
                `🤖 Pod 042: Uploading visual metadata to Command for semantic analysis...\n`
            ))
            pageConfig = await recognizePage({ prompt: pagePrompt, filePath, options })
        }

        fs.writeFileSync(path.join(targetDir, 'resource.js'), resource({ pageConfig, resourceTpl }))
        fs.writeFileSync(path.join(targetDir, 'index.js'), index({ config, fileName, indexTpl, pageConfig }))

        if (!menus.find(m => m.key === fileName)) {
            menus.push({ label: fileName, key: fileName })
        }

        if (config.needMock) {
            spinner.text = chalk.yellow(language(
                `🧑‍💻 9S: 正在突破目标防火墙... 执行数据伪装程序 [${fileName}]`,
                `🧑‍💻 9S: Piercing target firewall... Executing data camouflage [${fileName}]`
            ))
            const rawContent = await generateMock(pageConfig.table.columns, fileName)
            fs.writeFileSync(path.join(mockDir, `${fileName}.js`), `export default ${stringify.default(rawContent, { indent: 4, maxLength: 200 })}`)
            console.log(chalk.green(language(
                `\n[Success] 9S 报告: Mock 数据生成成功`,
                `\n[Success] 9S Report: Mock data generation successful.`
            )))
        }

        const endTime = Date.now()
        spinner.succeed(chalk.green(language(
            `🤖 Pod 042: [报告] 构筑协议执行完毕。模块 [${fileName}] 物理装配达成。耗时: ${(endTime - startTime) / 1000}s`,
            `🤖 Pod 042: [Report] Protocol complete. Physical assembly of [${fileName}] achieved. Elapsed: ${(endTime - startTime) / 1000}s`
        )))

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
        }

    } catch (error) {
        spinner.fail(chalk.red(language(
            `🤖 Pod 042: [警告] 构筑中断。检测到逻辑病毒或连接超时：${error}`,
            `🤖 Pod 042: [Warning] Construction aborted. Logic virus or timeout detected: ${error}`
        )))
    }
}