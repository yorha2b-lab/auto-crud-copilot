module.exports = () => {

    const fs = require('fs')
    const path = require('path')
    const chalk = require('chalk')
    const chokidar = require('chokidar')

    const {
        options,
        language,
        createTaskQueue,
        contextStringify,
        menus, config, copyTemplateDir,
        apiHandler, pageHandler, partHandler,
    } = require('../core/context').get()

    const { hbsDir, hooksDir, utilsDir, componentsDir } = config

    try {
        if (hbsDir === '') {
            copyTemplateDir(options, 'hooks', hooksDir)
            copyTemplateDir(options, 'utils', utilsDir)
            copyTemplateDir(options, 'components', componentsDir)
        }
    } catch (error) {
        console.error(language('❌ 模板构筑失败:', '❌ Template construction failed:'), error)
    }

    const queue = createTaskQueue(2)

    queue.onIdle(() => {
        console.log(chalk.green(language(
            '\n🤖 Pod 042: [报告] 队列已空，正在向 Bunker 同步 Menu 路由配置...',
            '\n🤖 Pod 042: [Report] Queue empty. Syncing Menu configuration to Bunker...'
        )))
        const utilsDir = path.join(process.cwd(), config.utilsDir)
        if (!fs.existsSync(utilsDir)) fs.mkdirSync(utilsDir, { recursive: true })
        fs.writeFileSync(path.join(utilsDir, 'menus.js'), `export const menus = ${contextStringify({ context: menus, maxLength: 50 })}`)
        console.log(chalk.gray(language(
            '\n🤖 [System] 未检测到运行中的任务，系统待机中...\n',
            '\n🤖 [System] System is STANDBY.\n'
        )))
    })

    const watcher = chokidar.watch(['./screenShot', './screenPart', './response'], {
        persistent: true,
        ignoreInitial: true,
        ignored: /(^|[\/\\])\../,
        awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 }
    })

    console.log(chalk.magenta(language(
        '📡 Operator 6O: 呼叫 2B，地堡全频道联动监控已就绪！',
        '📡 Operator 6O: Calling 2B, all-channel linked monitoring is ready!'
    )))

    watcher.on('add', filePath => {

        const absolutePath = path.resolve(filePath)

        if (absolutePath.includes('screenShot')) {
            queue.add(() => pageHandler(filePath))
        }
        else if (absolutePath.includes('screenPart')) {
            queue.add(() => partHandler(filePath))
        }
        else if (absolutePath.includes('response')) {
            queue.add(() => apiHandler(filePath))
        }
    })
}