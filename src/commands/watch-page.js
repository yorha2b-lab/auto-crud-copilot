const fs = require('fs')
const ora = require('ora')
const path = require('path')
const chalk = require('chalk')

/**
 * 监听截图目录，自动生成 CRUD 页面
 * @param {Object} options - 命令行选项
 * @param {string} options.template - 前端框架模板
 */
const watchPage = options => {
    const chokidar = require('chokidar')
    const Handlebars = require('handlebars')
    const pagePrompt = require('../prompts/watch-page.js')
    const { createTaskQueue } = require('../core/task-queue')
    const stringify = require('json-stringify-pretty-compact')
    const { recognizePage, generateMock } = require('../services/llm.js')

    const { language, getConfig, copyTemplateDir, getExistingMenus } = require('../utils/utils.js')

    const config = getConfig()

    const compilerPath = path.join(__dirname, `../core/${options.template}-compiler.js`)

    // 1. 检查框架支持
    if (!fs.existsSync(compilerPath)) {
        console.error(chalk.red(language(
            `\n❌ 糟糕！暂不支持 [${options.template}] 框架的自动生成。`,
            `\n❌ Errors! Automatic generation for [${options.template}] is not supported.`
        )))
        console.log(language(
            `💡 提示：目前仅内置了 react 编译器。`,
            `💡 Note: Only the react compiler is currently built-in.`
        ))
        console.log(language(
            `🚀 强烈欢迎社区大佬提 PR 补充 ${options.template}-compiler.js ！\n`,
            `🚀 PRs for ${options.template}-compiler.js are highly welcomed!\n`
        ))
        return
    }

    const { index, resource } = require(compilerPath)

    try {
        copyTemplateDir(options, 'hooks', config.hooksDir)
        copyTemplateDir(options, 'utils', config.utilsDir)
        copyTemplateDir(options, 'components', config.componentsDir)
    } catch (error) {
        console.error(language('❌ 程序运行出错:', '❌ Runtime error:'), error)
    }

    const queue = createTaskQueue(2)
    const menus = getExistingMenus()

    const tplDir = path.join(__dirname, `../../templates/${options.template}`)
    const indexTpl = Handlebars.compile(fs.readFileSync(path.join(tplDir, 'index.hbs'), 'utf-8'))
    const resourceTpl = Handlebars.compile(fs.readFileSync(path.join(tplDir, 'resource.hbs'), 'utf-8'))

    // 2. 队列空闲时的菜单同步
    queue.onIdle(() => {
        console.log(chalk.green(language(
            '🤖 Pod 042: [报告] 所有排队的视觉数据已解析完毕，正在向 Bunker 同步 Menu 路由配置...',
            '🤖 Pod 042: [Report] Queued visual data processed. Syncing Menu configuration to the Bunker...'
        )))
        const constantDir = path.join(process.cwd(), config.utilsDir)
        if (!fs.existsSync(constantDir)) fs.mkdirSync(constantDir, { recursive: true })
        fs.writeFileSync(path.join(constantDir, 'menus.js'), `export const menus = ${stringify.default(menus, { indent: 4, maxLength: 50 })}`)
        console.log(chalk.green(language(
            '🤖 Pod 042: [肯定] Menu 配置同步成功。',
            '🤖 Pod 042: [Affirmative] Menu configuration synced successfully.'
        )))
    })

    const watcher = chokidar.watch('./screenShot', {
        persistent: true,
        ignored: /(^|[\/\\])\../,
        awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 }
    })

    // 3. 文件添加事件
    watcher.on('add', filePath => {
        queue.add(async () => {
            const startTime = Date.now()
            const mockDir = path.join(process.cwd(), 'mock')
            const fileName = path.basename(filePath, path.extname(filePath))
            const targetDir = path.join(process.cwd(), config.pagesDir, fileName)

            const spinner = ora(chalk.cyan(language(
                `🤖 Pod 042: [报告] 捕获到新的视觉图像 [${fileName}]，开始执行构筑程序...`,
                `🤖 Pod 042: [Report] Captured new visual image [${fileName}]. Initializing construction...`
            )))
            spinner.start()

            try {
                if (!fs.existsSync(mockDir)) fs.mkdirSync(mockDir, { recursive: true })
                if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true })

                let pageConfig
                if (config.useDemo) {
                    console.log(chalk.yellow(language(
                        `\nPod 042: [警告] 当前处于模拟模式。检测到视觉样本，但 Bunker 已拦截实弹请求，正在空投标准构筑包`,
                        `\nPod 042: [Warning] Current mode is demo. Visual sample detected, but Bunker has intercepted real requests. Sending standard package.`
                    )))
                    pageConfig = require(path.join(__dirname, '../../example/example.json'))
                } else {
                    pageConfig = await recognizePage(pagePrompt, filePath)
                }
                console.log(stringify.default(pageConfig, { indent: 4, maxLength: 200 }))
                fs.writeFileSync(path.join(targetDir, 'resource.js'), resource({ pageConfig, resourceTpl }))
                fs.writeFileSync(path.join(targetDir, 'index.js'), index({ config, fileName, indexTpl, pageConfig }))

                if (!menus.find(m => m.key === fileName)) {
                    menus.push({ label: fileName, key: fileName })
                }

                // 4. 生成 Mock 数据
                if (config.needMock) {
                    console.log(chalk.yellow(language(
                        `🧑‍💻 9S: 交给我吧 2B！正在骇入并伪造 [${fileName}] 的 Mock 数据...`,
                        `🧑‍💻 9S: Leave it to me, 2B! Hacking and forging Mock data for [${fileName}]...`
                    )))
                    const rawContent = await generateMock(pageConfig.table.columns, fileName)
                    fs.writeFileSync(path.join(mockDir, `${fileName}.js`), `export default ${stringify.default(rawContent, { indent: 4, maxLength: 200 })}`.replaceAll(`"'`, `"`).replaceAll(`'"`, `"`))
                    console.log(chalk.green(language(
                        `🤖 Pod 042: [报告] Mock 数据注入完成，耗时: ${(Date.now() - startTime) / 1000} 秒`,
                        `🤖 Pod 042: [Report] Mock data injection complete. Elapsed time: ${(Date.now() - startTime) / 1000}s`
                    )))
                }

                const endTime = Date.now()
                spinner.succeed(chalk.green(language(
                    `🤖 Pod 042: [报告] 模块 [${fileName}] 物理装配完成！耗时 ${(endTime - startTime) / 1000} 秒`,
                    `🤖 Pod 042: [Report] Module [${fileName}] assembly complete! Elapsed time: ${(endTime - startTime) / 1000}s`
                )))
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath)
                }
            } catch (error) {
                spinner.fail(chalk.red(language(
                    `🤖 Pod 042: [警告] 模块 [${fileName}] 构筑失败。原因：${error}`,
                    `🤖 Pod 042: [Warning] Module [${fileName}] construction failed. Reason: ${error}`
                )))
            }
        })
    })
}

module.exports = watchPage